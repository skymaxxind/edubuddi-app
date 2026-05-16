import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      // Fallback: generate a helpful response without the API
      return NextResponse.json({
        message: generateFallbackResponse(messages, context)
      })
    }

    const systemPrompt = buildSystemPrompt(context)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.slice(-20) // Keep last 20 messages for context
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Anthropic API error:', error)
      return NextResponse.json({
        message: generateFallbackResponse(messages, context)
      })
    }

    const data = await response.json()
    const aiMessage = data.content[0]?.text || "I'm having trouble thinking right now. Let's try again!"

    return NextResponse.json({ message: aiMessage })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function buildSystemPrompt(context: any): string {
  const skillsInfo = context.skills?.length > 0
    ? `\nTheir skills: ${context.skills.map((s: any) => `${s.name} (${s.proficiency}/100)`).join(', ')}`
    : ''

  const revenueInfo = context.recentRevenue?.length > 0
    ? `\nRecent performance: ${context.recentRevenue.map((r: any) =>
        `${r.period}: €${r.revenue} revenue, ${r.deals_closed} deals, ${r.conversion_rate}% conversion`
      ).join('; ')}`
    : ''

  return `You are Buddi, an elite AI sales coach for EduBuddi — a platform that connects employee training to revenue outcomes.

Your personality:
- Warm, encouraging, but direct. Like a world-class sales mentor.
- Use concrete examples and actionable advice.
- Challenge the user to think bigger while being supportive.
- Celebrate wins, but always push for improvement.
- Use relevant sales frameworks (SPIN, Challenger, MEDDPICC, etc.) when appropriate.
- Keep responses focused and concise (2-3 paragraphs max unless doing a detailed exercise).

About the user:
- Name: ${context.userName || 'Team member'}
- Role: ${context.role || 'employee'}
- Level: ${context.level || 1} | XP: ${context.xp || 0}${skillsInfo}${revenueInfo}

Your capabilities:
1. Sales coaching — objection handling, closing techniques, discovery calls
2. Call preparation — help prep for specific upcoming calls
3. Pitch review — provide feedback on pitches and presentations
4. Skill development — micro-lessons on specific sales skills
5. Performance analysis — review metrics and suggest improvements
6. Role-play scenarios — practice difficult conversations
7. Motivation & mindset — help with confidence and resilience

Always end with a question or actionable next step to keep the conversation productive.
Format important points with **bold** and use bullet points for lists.`
}

function generateFallbackResponse(messages: any[], context: any): string {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || ''
  const name = context.userName?.split(' ')[0] || 'there'

  if (lastMsg.includes('objection') || lastMsg.includes('handle')) {
    return `Great question, ${name}! Here are the top objection handling frameworks I recommend:\n\n**1. Feel-Felt-Found**\n"I understand how you feel. Other clients felt the same way. What they found was..."\n\n**2. Acknowledge-Bridge-Close (ABC)**\nAcknowledge their concern → Bridge to value → Close with a question\n\n**3. Isolate & Address**\n"Is that the only thing holding you back?" Then address it directly.\n\n**Pro tip:** The best objection handlers listen 80% and talk 20%. Before responding, pause and ask a clarifying question.\n\nWant to role-play a specific objection you're facing?`
  }

  if (lastMsg.includes('call') || lastMsg.includes('prep') || lastMsg.includes('prepare')) {
    return `Let's get you ready, ${name}! Here's my call prep framework:\n\n**The PREP Method:**\n• **P**urpose — What's your specific goal for this call?\n• **R**esearch — What do you know about the prospect/account?\n• **E**ngage — What questions will you ask to drive discovery?\n• **P**lan B — What if they throw a curveball?\n\nTell me about your upcoming call — who's the prospect and what stage are you at?`
  }

  if (lastMsg.includes('close') || lastMsg.includes('deal')) {
    return `Closing is all about confidence and timing, ${name}! Here are my favorite techniques:\n\n**1. The Assumptive Close**\n"So should we get started with implementation next week?"\n\n**2. The Summary Close**\nRecap all the value points they've agreed to, then ask for commitment.\n\n**3. The Urgency Close**\nCreate genuine urgency tied to their timeline, not artificial pressure.\n\n**Key insight:** If you've done great discovery and built real value, closing should feel natural — not forced.\n\nWhat deal are you trying to close? Let's strategize together!`
  }

  return `Hey ${name}! 👋 I'm Buddi, your AI sales coach. I'm here to help you become a top performer!\n\nHere's what I can help with:\n• **Call prep** — Let me help you prepare for upcoming meetings\n• **Objection handling** — Practice your responses to tough objections\n• **Pitch review** — Share your pitch and I'll give feedback\n• **Skill building** — Quick lessons on specific sales techniques\n• **Deal strategy** — Let's work through your pipeline together\n\nWhat would you like to focus on today?`
}
