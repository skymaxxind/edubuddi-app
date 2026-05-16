'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/ui/AppShell'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function ManagerPage() {
  const { profile } = useAuth('manager')
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'revenue' | 'leaks' | 'skills'>('overview')
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [moneyLeaks, setMoneyLeaks] = useState<any[]>([])
  const [teamSkills, setTeamSkills] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => {
    if (!profile) return
    fetchManagerData()
  }, [profile])

  const fetchManagerData = async () => {
    // Team members
    const { data: team } = await supabase
      .from('profiles')
      .select('*')
      .order('xp_points', { ascending: false })
    if (team) setTeamMembers(team)

    // Revenue data
    const { data: revenue } = await supabase
      .from('revenue_data')
      .select('*')
      .order('period', { ascending: false })
      .limit(50)
    if (revenue) setRevenueData(revenue)

    // Money leaks
    const { data: leaks } = await supabase
      .from('money_leaks')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(20)
    if (leaks) setMoneyLeaks(leaks)

    // Team skills
    const { data: skills } = await supabase
      .from('user_skills')
      .select('*, skill:skills(*), profile:profiles(full_name)')
    if (skills) setTeamSkills(skills)

    // Performance alerts
    const { data: alertData } = await supabase
      .from('performance_alerts')
      .select('*, profile:profiles(full_name)')
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10)
    if (alertData) setAlerts(alertData)
  }

  const totalRevenue = revenueData.reduce((sum, r) => sum + (r.revenue || 0), 0)
  const totalDeals = revenueData.reduce((sum, r) => sum + (r.deals_closed || 0), 0)
  const avgConversion = revenueData.length > 0
    ? Math.round(revenueData.reduce((sum, r) => sum + (r.conversion_rate || 0), 0) / revenueData.length)
    : 0
  const totalLeakLoss = moneyLeaks.reduce((sum, l) => sum + (l.estimated_loss || 0), 0)
  const activeLeaks = moneyLeaks.filter(l => !l.resolved).length

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'team', label: 'Team', icon: '👥' },
    { key: 'revenue', label: 'Revenue Intel', icon: '💰' },
    { key: 'leaks', label: 'Money Leaks', icon: '🚨' },
    { key: 'skills', label: 'Skill Heatmap', icon: '🎯' },
  ]

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manager Command Center 📈</h1>
        <p className="text-gray-500 mt-1">Team performance, revenue intelligence & money leak detection</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab.key ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard icon="👥" label="Team Size" value={teamMembers.length.toString()} change="" color="blue" />
            <KPICard icon="💰" label="Total Revenue" value={`€${(totalRevenue / 1000).toFixed(0)}k`} change="+24%" color="green" />
            <KPICard icon="🎯" label="Avg Conversion" value={`${avgConversion}%`} change="+5%" color="brand" />
            <KPICard icon="🚨" label="Active Leaks" value={activeLeaks.toString()} change={`-€${(totalLeakLoss / 1000).toFixed(0)}k`} color="red" />
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h3 className="font-semibold mb-4">Performance Alerts</h3>
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg ${
                    alert.severity === 'critical' ? 'bg-red-50' :
                    alert.severity === 'high' ? 'bg-orange-50' :
                    'bg-yellow-50'
                  }`}>
                    <span>{alert.severity === 'critical' ? '🚨' : alert.severity === 'high' ? '⚠️' : 'ℹ️'}</span>
                    <div>
                      <span className="font-medium text-sm">{alert.profile?.full_name}: </span>
                      <span className="text-sm text-gray-600">{alert.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top & Bottom performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-4 text-green-700">🌟 Top Performers</h3>
              {teamMembers.slice(0, 5).map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 py-2">
                  <span className="text-lg w-8">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`}</span>
                  <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold">
                    {m.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{m.full_name}</div>
                    <div className="text-xs text-gray-400">Level {m.level} • {m.xp_points} XP</div>
                  </div>
                  <div className="text-sm text-brand-600 font-semibold">{m.xp_points} XP</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold mb-4 text-red-700">⚠️ Need Attention</h3>
              {teamMembers.slice(-5).reverse().map(m => (
                <div key={m.id} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-bold">
                    {m.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{m.full_name}</div>
                    <div className="text-xs text-gray-400">Level {m.level} • {m.current_streak}d streak</div>
                  </div>
                  <div className="text-sm text-red-500">{m.xp_points} XP</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'team' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b text-sm font-medium text-gray-500">
            <div className="col-span-4">Member</div>
            <div className="col-span-2 text-center">Level</div>
            <div className="col-span-2 text-center">XP</div>
            <div className="col-span-2 text-center">Streak</div>
            <div className="col-span-2 text-center">Status</div>
          </div>
          {teamMembers.map(m => (
            <div key={m.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 items-center hover:bg-gray-50">
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
                  {m.full_name?.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-sm">{m.full_name}</div>
                  <div className="text-xs text-gray-400">{m.email}</div>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <span className="px-2 py-1 bg-brand-100 text-brand-700 rounded-full text-sm">Lv {m.level}</span>
              </div>
              <div className="col-span-2 text-center font-semibold">{m.xp_points}</div>
              <div className="col-span-2 text-center">
                {m.current_streak > 0 ? <span className="text-orange-500">🔥 {m.current_streak}d</span> : '—'}
              </div>
              <div className="col-span-2 text-center">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  m.current_streak > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {m.current_streak > 0 ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'revenue' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <KPICard icon="💰" label="Total Revenue" value={`€${totalRevenue.toLocaleString()}`} change="+24%" color="green" />
            <KPICard icon="🤝" label="Deals Closed" value={totalDeals.toString()} change="+12%" color="blue" />
            <KPICard icon="📊" label="Avg Conversion" value={`${avgConversion}%`} change="+5%" color="brand" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Revenue by Team Member</h3>
            <div className="space-y-4">
              {teamMembers.map(m => {
                const memberRevenue = revenueData.filter(r => r.user_id === m.id)
                const total = memberRevenue.reduce((sum, r) => sum + (r.revenue || 0), 0)
                const maxRevenue = Math.max(...teamMembers.map(tm =>
                  revenueData.filter(r => r.user_id === tm.id).reduce((s, r) => s + (r.revenue || 0), 0)
                ), 1)
                return (
                  <div key={m.id} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium truncate">{m.full_name}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-4">
                      <div
                        className="bg-green-500 h-4 rounded-full transition-all"
                        style={{ width: `${(total / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <div className="w-24 text-right text-sm font-semibold">€{total.toLocaleString()}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {activeTab === 'leaks' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <KPICard icon="🚨" label="Active Leaks" value={activeLeaks.toString()} change="" color="red" />
            <KPICard icon="💸" label="Est. Loss" value={`€${totalLeakLoss.toLocaleString()}`} change="" color="orange" />
            <KPICard icon="✅" label="Resolved" value={moneyLeaks.filter(l => l.resolved).length.toString()} change="" color="green" />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Money Leak Detector</h3>
            <p className="text-sm text-gray-500 mb-4">
              EduBuddi automatically detects training gaps that are costing your team revenue.
            </p>

            {moneyLeaks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">✅</div>
                <p>No money leaks detected. Your team is performing well!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {moneyLeaks.map(leak => (
                  <div key={leak.id} className={`p-4 rounded-lg border ${
                    leak.resolved ? 'resolved' : 'active' === 'resolved' ? 'border-green-200 bg-green-50' :
                    leak.resolved ? 'resolved' : 'active' === 'in_progress' ? 'border-yellow-200 bg-yellow-50' :
                    'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            leak.resolved ? 'resolved' : 'active' === 'resolved' ? 'bg-green-200 text-green-800' :
                            leak.resolved ? 'resolved' : 'active' === 'in_progress' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-red-200 text-red-800'
                          }`}>
                            {leak.resolved ? 'resolved' : 'active'}
                          </span>
                          <span className="font-medium">{leak.type}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{leak.description}</p>
                        {leak.recommended_action && (
                          <p className="text-sm text-green-700 mt-1">Resolution: {leak.recommended_action}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <div className="text-lg font-bold text-red-600">-€{leak.estimated_loss.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{new Date(leak.detected_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'skills' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Team Skill Heatmap</h3>
          <p className="text-sm text-gray-500 mb-6">
            Identify skill gaps across your team and target training where it matters most.
          </p>

          {(() => {
            const skillMap = new Map<string, Map<string, number>>()
            const allSkills = new Set<string>()

            teamSkills.forEach(us => {
              const userName = us.profile?.full_name || 'Unknown'
              const skillName = us.skill?.name || 'Unknown'
              allSkills.add(skillName)
              if (!skillMap.has(userName)) skillMap.set(userName, new Map())
              skillMap.get(userName)!.set(skillName, us.proficiency)
            })

            const skillNames = Array.from(allSkills)
            const users = Array.from(skillMap.entries())

            if (users.length === 0) {
              return (
                <div className="text-center py-8 text-gray-500">
                  No skill data available yet. Assign training to build the heatmap.
                </div>
              )
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2 font-medium text-gray-500 sticky left-0 bg-white">Team Member</th>
                      {skillNames.map(skill => (
                        <th key={skill} className="p-2 font-medium text-gray-500 text-center whitespace-nowrap">
                          {skill}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(([userName, skills]) => (
                      <tr key={userName} className="border-t border-gray-100">
                        <td className="p-2 font-medium sticky left-0 bg-white">{userName}</td>
                        {skillNames.map(skill => {
                          const value = skills.get(skill) || 0
                          return (
                            <td key={skill} className="p-2 text-center">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto text-xs font-bold ${
                                  value >= 80 ? 'bg-green-500 text-white' :
                                  value >= 60 ? 'bg-green-300 text-green-900' :
                                  value >= 40 ? 'bg-yellow-300 text-yellow-900' :
                                  value >= 20 ? 'bg-orange-300 text-orange-900' :
                                  value > 0 ? 'bg-red-300 text-red-900' :
                                  'bg-gray-100 text-gray-400'
                                }`}
                              >
                                {value || '—'}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                  <span>Legend:</span>
                  <span className="flex items-center gap-1"><div className="w-4 h-4 bg-red-300 rounded" /> 0-19</span>
                  <span className="flex items-center gap-1"><div className="w-4 h-4 bg-orange-300 rounded" /> 20-39</span>
                  <span className="flex items-center gap-1"><div className="w-4 h-4 bg-yellow-300 rounded" /> 40-59</span>
                  <span className="flex items-center gap-1"><div className="w-4 h-4 bg-green-300 rounded" /> 60-79</span>
                  <span className="flex items-center gap-1"><div className="w-4 h-4 bg-green-500 rounded" /> 80-100</span>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </AppShell>
  )
}

function KPICard({ icon, label, value, change, color }: { icon: string; label: string; value: string; change: string; color: string }) {
  const colors: Record<string, string> = {
    brand: 'bg-brand-50 border-brand-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
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
      {change && (
        <div className={`text-xs mt-2 font-medium ${
          change.startsWith('+') ? 'text-green-600' : change.startsWith('-') ? 'text-red-600' : 'text-gray-500'
        }`}>
          {change}
        </div>
      )}
    </div>
  )
}
