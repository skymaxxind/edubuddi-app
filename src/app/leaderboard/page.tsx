'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/ui/AppShell'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface LeaderboardEntry {
  id: string
  full_name: string
  xp_points: number
  level: number
  current_streak: number
  role: string
}

export default function LeaderboardPage() {
  const { profile } = useAuth()
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([])
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all')

  useEffect(() => {
    if (!profile) return

    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, xp_points, level, current_streak, role')
        .order('xp_points', { ascending: false })
        .limit(50)
      // @ts-ignore - xp_points is the correct column

      if (data) setLeaders(data)
    }

    fetchLeaderboard()
  }, [profile, timeRange])

  const getMedal = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `${index + 1}`
  }

  const myRank = leaders.findIndex(l => l.id === profile?.id) + 1

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Leaderboard 🏆</h1>
        <p className="text-gray-500 mt-1">See how you stack up against your team</p>
      </div>

      {/* Your position card */}
      {myRank > 0 && (
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-brand-200">Your Position</div>
              <div className="text-4xl font-bold">#{myRank}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-brand-200">Total XP</div>
              <div className="text-2xl font-bold">{profile?.xp_points.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-brand-200">Level</div>
              <div className="text-2xl font-bold">{profile?.level}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-brand-200">Streak</div>
              <div className="text-2xl font-bold">🔥 {profile?.current_streak}</div>
            </div>
          </div>
        </div>
      )}

      {/* Time range filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'month', 'week'] as const).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
              timeRange === range ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {range === 'all' ? 'All Time' : `This ${range}`}
          </button>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">Member</div>
          <div className="col-span-2 text-center">Level</div>
          <div className="col-span-2 text-center">XP</div>
          <div className="col-span-2 text-center">Streak</div>
        </div>

        {leaders.map((leader, idx) => {
          const isMe = leader.id === profile?.id
          return (
            <div
              key={leader.id}
              className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 items-center transition ${
                isMe ? 'bg-brand-50' : 'hover:bg-gray-50'
              } ${idx < 3 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent' : ''}`}
            >
              <div className="col-span-1">
                <span className={`text-lg ${idx < 3 ? 'text-2xl' : 'text-sm text-gray-500'}`}>
                  {getMedal(idx)}
                </span>
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-amber-600' : 'bg-brand-500'
                }`}>
                  {leader.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <div className="font-medium">
                    {leader.full_name} {isMe && <span className="text-brand-600 text-xs">(You)</span>}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">{leader.role}</div>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <span className="px-2 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-medium">
                  Lv {leader.level}
                </span>
              </div>
              <div className="col-span-2 text-center font-semibold text-brand-600">
                {leader.xp_points.toLocaleString()}
              </div>
              <div className="col-span-2 text-center">
                {leader.current_streak > 0 ? (
                  <span className="text-orange-500">🔥 {leader.current_streak}d</span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>
          )
        })}

        {leaders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No team members yet. Be the first to start learning!
          </div>
        )}
      </div>
    </AppShell>
  )
}
