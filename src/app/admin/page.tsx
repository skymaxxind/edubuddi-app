'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/ui/AppShell'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const { profile } = useAuth('admin')
  const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'company' | 'analytics'>('users')
  const [users, setUsers] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: '', description: '', category: 'sales', difficulty: 'beginner', estimated_minutes: 30
  })

  useEffect(() => {
    if (!profile) return
    fetchAdminData()
  }, [profile])

  const fetchAdminData = async () => {
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (usersData) setUsers(usersData)

    const { data: coursesData } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })
    if (coursesData) setCourses(coursesData)
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    fetchAdminData()
  }

  const createCourse = async () => {
    if (!profile || !newCourse.title) return
    await supabase.from('courses').insert({
      ...newCourse,
      is_published: true,
      created_by: profile.id
    })
    setShowAddCourse(false)
    setNewCourse({ title: '', description: '', category: 'sales', difficulty: 'beginner', estimated_minutes: 30 })
    fetchAdminData()
  }

  const toggleCoursePublished = async (courseId: string, current: boolean) => {
    await supabase.from('courses').update({ is_published: !current }).eq('id', courseId)
    fetchAdminData()
  }

  const tabs = [
    { key: 'users', label: 'User Management', icon: '👥' },
    { key: 'courses', label: 'Course Builder', icon: '📚' },
    { key: 'company', label: 'Company Settings', icon: '🏢' },
    { key: 'analytics', label: 'Analytics', icon: '📊' },
  ]

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Panel ⚙️</h1>
        <p className="text-gray-500 mt-1">Manage users, courses, and company settings</p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold">All Users ({users.length})</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {users.map(user => (
              <div key={user.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
                  {user.full_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-sm text-gray-400">{user.email}</div>
                </div>
                <div className="text-sm text-gray-500">Lv {user.level} • {user.xp_points} XP</div>
                <select
                  value={user.role}
                  onChange={e => updateUserRole(user.id, e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  user.current_streak > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {user.current_streak > 0 ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">All Courses ({courses.length})</h3>
            <button
              onClick={() => setShowAddCourse(!showAddCourse)}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition"
            >
              + Add Course
            </button>
          </div>

          {showAddCourse && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h4 className="font-semibold mb-4">Create New Course</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={e => setNewCourse(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Course title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newCourse.category}
                    onChange={e => setNewCourse(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="sales">Sales</option>
                    <option value="product">Product</option>
                    <option value="communication">Communication</option>
                    <option value="leadership">Leadership</option>
                    <option value="negotiation">Negotiation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={newCourse.difficulty}
                    onChange={e => setNewCourse(p => ({ ...p, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={newCourse.estimated_minutes}
                    onChange={e => setNewCourse(p => ({ ...p, estimated_minutes: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newCourse.description}
                    onChange={e => setNewCourse(p => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Course description..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={createCourse} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
                  Create Course
                </button>
                <button onClick={() => setShowAddCourse(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {courses.map(course => (
              <div key={course.id} className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium">{course.title}</div>
                  <div className="text-sm text-gray-400">{course.category} • {course.difficulty} • {course.estimated_minutes} min</div>
                </div>
                <button
                  onClick={() => toggleCoursePublished(course.id, course.is_published)}
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    course.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {course.is_published ? 'Published' : 'Draft'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'company' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">Company Settings</h3>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Your Company" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="https://..." />
            </div>
            <button className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition">
              Save Settings
            </button>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Platform Usage</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold">{users.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active Users (this week)</span>
                <span className="font-semibold">{users.filter(u => u.streak_days > 0).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Courses</span>
                <span className="font-semibold">{courses.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Admins</span>
                <span className="font-semibold">{users.filter(u => u.role === 'admin').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Managers</span>
                <span className="font-semibold">{users.filter(u => u.role === 'manager').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Employees</span>
                <span className="font-semibold">{users.filter(u => u.role === 'employee').length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Training Impact</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Published Courses</span>
                <span className="font-semibold">{courses.filter(c => c.is_published).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg Level</span>
                <span className="font-semibold">
                  {users.length > 0 ? (users.reduce((s, u) => s + u.level, 0) / users.length).toFixed(1) : '0'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total XP Earned</span>
                <span className="font-semibold">{users.reduce((s, u) => s + u.xp, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Longest Streak</span>
                <span className="font-semibold">{Math.max(0, ...users.map((u: any) => u.streak_days))} days</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
