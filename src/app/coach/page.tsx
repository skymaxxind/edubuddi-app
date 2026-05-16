'use client'

import { useEffect, useState, useRef } from 'react'
import AppShell from '@/components/ui/AppShell'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export default function CoachPage() {
  const { profile } = useAuth()
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConvo, setActiveConvo] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!profile) return
    loadConversations()
  }, [profile])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = async () => {
    const { data } = await supabase
      .from('coach_conversations')
      .select('*')
      .eq('user_id', profile!.id)
      .order('updated_at', { ascending: false })
    if (data) setConversations(data)
  }

  const loadMessages = async (conversationId: string) => {
    setActiveConvo(conversationId)
    const { data } = await supabase
      .from('coach_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const startNewConversation = async () => {
    if (!profile) return
    const { data, error } = await supabase
      .from('coach_conversations')
      .insert({ user_id: profile.id, title: 'New Coaching Session' })
      .select()
      .single()

    if (data) {
      setActiveConvo(data.id)
      setMessages([])
      await loadConversations()

      // Send welcome message
      const welcomeMsg: Message = {
        role: 'assistant',
        content: `Hey ${profile.full_name?.split(' ')[0] || 'there'}! 👋 I'm Buddi, your AI sales coach. I'm here to help you sharpen your skills, prepare for calls, handle objections, and close more deals.\n\nWhat would you like to work on today? Here are some ideas:\n\n• **Call preparation** — Let me help you prep for an upcoming call\n• **Objection handling** — Practice responding to common objections\n• **Pitch review** — Share your pitch and I'll give feedback\n• **Skill building** — Work on a specific sales skill\n• **Deal strategy** — Let's strategize on a deal you're working\n\nOr just ask me anything about sales!`
      }

      await supabase.from('coach_messages').insert({
        conversation_id: data.id,
        role: 'assistant',
        content: welcomeMsg.content
      })

      setMessages([welcomeMsg])
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || sending || !activeConvo || !profile) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSending(true)

    // Save user message
    await supabase.from('coach_messages').insert({
      conversation_id: activeConvo,
      role: 'user',
      content: userMessage.content
    })

    try {
      // Get user context for personalized coaching
      const { data: skills } = await supabase
        .from('user_skills')
        .select('*, skill:skills(*)')
        .eq('user_id', profile.id)

      const { data: recentRevenue } = await supabase
        .from('revenue_data')
        .select('*')
        .eq('user_id', profile.id)
        .order('period', { ascending: false })
        .limit(3)

      // Call AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          context: {
            userName: profile.full_name,
            role: profile.role,
            level: profile.level,
            xp: profile.xp_points,
            skills: skills?.map(s => ({
              name: s.skill?.name,
              proficiency: s.proficiency
            })) || [],
            recentRevenue: recentRevenue || []
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const assistantMessage: Message = { role: 'assistant', content: data.message }

      setMessages(prev => [...prev, assistantMessage])

      // Save assistant message
      await supabase.from('coach_messages').insert({
        conversation_id: activeConvo,
        role: 'assistant',
        content: data.message
      })

      // Update conversation title if it's still default
      const convo = conversations.find(c => c.id === activeConvo)
      if (convo?.title === 'New Coaching Session') {
        const title = userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? '...' : '')
        await supabase
          .from('coach_conversations')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', activeConvo)
        loadConversations()
      }

      // Award XP for coaching interaction
      await supabase.from('xp_history').insert({
        user_id: profile.id,
        amount: 10,
        source: 'coach',
        description: 'AI coaching interaction'
      })

      await supabase
        .from('profiles')
        .update({ xp_points: profile.xp_points + 10 })
        .eq('id', profile.id)

    } catch (err) {
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. This could mean the AI API key hasn't been configured yet. Please check your environment variables and try again."
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickPrompts = [
    { icon: '📞', text: 'Help me prepare for a sales call' },
    { icon: '🛡️', text: 'Practice objection handling' },
    { icon: '📊', text: 'Review my performance and suggest improvements' },
    { icon: '💡', text: 'Give me a 5-minute sales tip' },
  ]

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-7rem)] -m-6">
        {/* Conversations sidebar */}
        {showSidebar && (
          <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={startNewConversation}
                className="w-full py-2.5 bg-brand-600 text-white rounded-lg font-medium text-sm hover:bg-brand-700 transition flex items-center justify-center gap-2"
              >
                <span>+</span> New Session
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map(convo => (
                <button
                  key={convo.id}
                  onClick={() => loadMessages(convo.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                    activeConvo === convo.id ? 'bg-brand-50 border-l-2 border-l-brand-500' : ''
                  }`}
                >
                  <div className="font-medium text-sm truncate">{convo.title}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(convo.updated_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
              {conversations.length === 0 && (
                <div className="p-4 text-sm text-gray-500 text-center">
                  No conversations yet. Start a new session!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Chat header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            <button onClick={() => setShowSidebar(!showSidebar)} className="text-gray-400 hover:text-gray-600">
              {showSidebar ? '◀' : '▶'}
            </button>
            <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white text-sm">🤖</div>
            <div>
              <div className="font-semibold text-sm">Buddi AI Coach</div>
              <div className="text-xs text-green-500">Online — Ready to help</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!activeConvo ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h2 className="text-xl font-bold mb-2">Meet Buddi, Your AI Sales Coach</h2>
                <p className="text-gray-500 mb-6 max-w-md">
                  Get personalized coaching, practice objection handling, prep for calls, and improve your sales skills.
                </p>
                <button
                  onClick={startNewConversation}
                  className="px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition"
                >
                  Start Coaching Session
                </button>
                <div className="grid grid-cols-2 gap-3 mt-8 max-w-lg">
                  {quickPrompts.map((qp, i) => (
                    <button
                      key={i}
                      onClick={async () => {
                        await startNewConversation()
                        setInput(qp.text)
                      }}
                      className="p-3 bg-white rounded-lg border border-gray-200 text-left text-sm hover:border-brand-300 hover:shadow transition"
                    >
                      <span className="text-lg">{qp.icon}</span>
                      <div className="mt-1 text-gray-700">{qp.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-br-md'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content.split('**').map((part, i) =>
                          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          {activeConvo && (
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-3 items-end max-w-3xl mx-auto">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Buddi anything about sales..."
                  rows={1}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none text-sm"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="px-4 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  Send
                </button>
              </div>
              <div className="text-xs text-gray-400 text-center mt-2">
                Buddi uses AI to provide coaching. Responses are personalized based on your performance data.
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
