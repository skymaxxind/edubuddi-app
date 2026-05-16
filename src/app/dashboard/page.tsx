'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/ui/AppShell'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type { XPHistory, PerformanceAlert, DailyActivity } from '@/types/database'

export default function DashboardPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [courseProgress, setCourseProgress] = useState<any[]>([])
  const [recentXP, setRecentXP] = useState<XPHistory[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [stats, setStats] = useState({ coursesCompleted: 0, quizzesPassed: 0 })

  useEffect(() => {
    if (!profile) return

    const fetchDashboard = async () => {
      // Course progress with course details
      const { data: progress } = await supabase
        .from('course_progress')
        .select('*, course:courses(*)')
        .eq('user_id', profile.id)
        .order('started_at', { ascending: false })
        .limit(5)
      if (progress) setCourseProgress(progress)

      // Recent XP
      const { data: xp } = await supabase
        .from('xp_history')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10)
      if (xp) setRecentXP(xp)

      // Badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', profile.id)
        .order('earned_at', { ascending: false })
      if (userBadges) setBadges(userBadges)

      // Alerts
      const { data: alertData } = await supabase
        .from('performance_alerts')
        .select('*')
        .eq('user_id', profile.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5)
      if (alertData) setAlerts(alertData as PerformanceAlert[])

      // Aggregate stats
      const { count: completedCount } = await supabase
        .from('course_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('status', 'completed')

      const { count: quizCount } = await supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('passed', true)

      setStats({
        coursesCompleted: completedCount || 0,
        quizzesPassed: quizCount || 0,
      })
    }

    fetchDashboard()
  }, [profile])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting()}, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your learning overview for today</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="⚡" label="Total XP" value={profile?.xp_points?.toLocaleString() || '0'} color="brand" />
        <StatCard icon="🎯" label="Level" value={profile?.level?.toString() || '1'} color="blue" />
        <StatCard icon="🔥" label="Day Streak" value={profile?.current_streak?.toString() || '0'} color="orange" />
        <StatCard icon="📚" label="Courses Done" value={stats.coursesCompleted.toString()} color="green" />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6">
          {alerts.map(alert => (
            <div key={alert.id} className={`flex items-start gap-3 p-4 rounded-lg mb-2 ${
              alert.severity === 'critical' ? 'bg-red-50 border border-red-200' :
              alert.severity === 'warning' ? 'bg-orange-50 border border-orange-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <span className="text-lg">
                {alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <div>
                <div className="font-medium text-sm">{alert.title}</div>
                <div className="text-sm text-gray-600">{alert.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Continue Learning</h2>
              <button onClick={() => router.push('/training')} className="text-brand-600 text-sm font-medium hover:underline">
                View all courses →
              </button>
            </div>

            {courseProgress.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📚</div>
                <p className="text-gray-500">No courses started yet</p>
                <button
                  onClick={() => router.push('/training')}
                  className="mt-3 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition"
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {courseProgress.map(cp => (
                  <div key={cp.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => router.push(`/training/${cp.course_id}`)}>
                    <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center text-2xl shrink-0">
                      {cp.course?.category === 'sales' ? '💰' :
                       cp.course?.category === 'product' ? '📦' :
                       cp.course?.category === 'communication' ? '💬' : '📖'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{cp.course?.title || 'Course'}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[200px]">
                          <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${cp.progress_pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{cp.progress_pct}%</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      cp.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {cp.status === 'completed' ? 'Done' : 'In Progress'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickAction icon="🤖" title="Talk to Buddi" desc="Get AI coaching" onClick={() => router.push('/coach')} />
            <QuickAction icon="📝" title="Quick Quiz" desc="Test your knowledge" onClick={() => router.push('/training')} />
            <QuickAction icon="🏆" title="Leaderboard" desc="See rankings" onClick={() => router.push('/leaderboard')} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* AI Coach Card */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
              <div>
                <div className="font-semibold">Buddi AI Coach</div>
                <div className="text-sm text-brand-200">Your personal trainer</div>
              </div>
            </div>
            <p className="text-sm text-brand-100 mb-4">
              Ready to help you improve your sales skills and close more deals.
            </p>
            <button
              onClick={() => router.push('/coach')}
              className="w-full py-2 bg-white text-brand-700 rounded-lg font-semibold text-sm hover:bg-brand-50 transition"
            >
              Start Coaching Session
            </button>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-3">Your Badges</h3>
            {badges.length === 0 ? (
              <p className="text-sm text-gray-500">Complete courses and quizzes to earn badges!</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {badges.slice(0, 8).map(ub => (
                  <div key={ub.id} className="text-center" title={ub.badge?.name}>
                    <div className="text-2xl">{ub.badge?.icon || '🏅'}</div>
                    <div className="text-xs text-gray-500 truncate">{ub.badge?.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent XP */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-3">Recent XP</h3>
            {recentXP.length === 0 ? (
              <p className="text-sm text-gray-500">Start learning to earn XP!</p>
            ) : (
              <div className="space-y-2">
                {recentXP.slice(0, 5).map(xp => (
                  <div key={xp.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 truncate">{xp.description}</span>
                    <span className="text-brand-600 font-semibold shrink-0 ml-2">+{xp.amount} XP</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    brand: 'bg-brand-50 border-brand-200',
    blue: 'bg-blue-50 border-blue-200',
    orange: 'bg-orange-50 border-orange-200',
    green: 'bg-green-50 border-green-200',
  }
  return (
    <div className={`p-4 rounded-xl border ${colors[color] || colors.brand}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  )
}

function QuickAction({ icon, title, desc, onClick }: { icon: string; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-4 bg-white rounded-xl border border-gray-200 text-left hover:shadow-md transition group">
      <span className="text-2xl">{icon}</span>
      <div className="font-medium mt-2 group-hover:text-brand-600 transition">{title}</div>
      <div className="text-sm text-gray-500">{desc}</div>
    </button>
  )
}
