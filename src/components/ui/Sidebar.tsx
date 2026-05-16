'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Profile } from '@/types/database'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'ð', roles: ['employee', 'manager', 'admin'] },
  { href: '/coach', label: 'AI Coach', icon: 'ð¤', roles: ['employee', 'manager', 'admin'] },
  { href: '/training', label: 'Training', icon: 'ð', roles: ['employee', 'manager', 'admin'] },
  { href: '/leaderboard', label: 'Leaderboard', icon: 'ð', roles: ['employee', 'manager', 'admin'] },
  { href: '/manager', label: 'Manager Hub', icon: 'ð', roles: ['manager', 'admin'] },
  { href: '/admin', label: 'Admin Panel', icon: 'âï¸', roles: ['admin'] },
]

interface SidebarProps {
  profile: Profile | null
  onSignOut: () => void
}

export default function Sidebar({ profile, onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const filteredNav = navItems.filter(item =>
    profile ? item.roles.includes(profile.role) : false
  )

  const levelProgress = profile ? ((profile.xp_points % 1000) / 1000) * 100 : 0

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-dark-900 text-white flex flex-col transition-all duration-300 min-h-screen`}>
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-dark-700">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0">
          B
        </div>
        {!collapsed && <span className="text-xl font-bold">EduBuddi</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-gray-400 hover:text-white p-1"
        >
          {collapsed ? 'â' : 'â'}
        </button>
      </div>

      {/* User card */}
      {profile && !collapsed && (
        <div className="p-4 border-b border-dark-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold">
              {profile.full_name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{profile.full_name}</div>
              <div className="text-xs text-gray-400 capitalize">{profile.role}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-brand-400 font-bold">Lv {profile.level}</span>
            <div className="flex-1 bg-dark-700 rounded-full h-2">
              <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
            </div>
            <span className="text-xs text-gray-400">{profile.xp_points} XP</span>
          </div>
          {profile.current_streak > 0 && (
            <div className="mt-2 text-xs text-orange-400 flex items-center gap-1">
              ð¥ {profile.current_streak} day streak
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {filteredNav.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-dark-700">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 w-full transition-all"
        >
          <span className="text-lg">ðª</span>
          {!collapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
