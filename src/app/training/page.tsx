'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/ui/AppShell'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type { Course, CourseProgress } from '@/types/database'

export default function TrainingPage() {
  const { profile } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({})
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!profile) return

    const fetchData = async () => {
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (coursesData) setCourses(coursesData)

      const { data: progressData } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', profile.id)

      if (progressData) {
        const map: Record<string, CourseProgress> = {}
        progressData.forEach(p => { map[p.course_id] = p as CourseProgress })
        setProgress(map)
      }
    }

    fetchData()
  }, [profile])

  const categories = ['all', ...new Set(courses.map(c => c.category))]

  const filtered = courses.filter(c => {
    if (filter !== 'all' && c.category !== filter) return false
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) &&
        !c.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const startCourse = async (courseId: string) => {
    if (!profile) return

    if (!progress[courseId]) {
      await supabase.from('course_progress').insert({
        user_id: profile.id,
        course_id: courseId,
        status: 'in_progress',
        progress_pct: 0,
        started_at: new Date().toISOString()
      })
    }

    router.push(`/training/${courseId}`)
  }

  const categoryIcons: Record<string, string> = {
    sales: '💰',
    product: '📦',
    communication: '💬',
    leadership: '👑',
    negotiation: '🤝',
    prospecting: '🎯',
    closing: '🏆',
    all: '📚'
  }

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700'
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Training Center 📚</h1>
        <p className="text-gray-500 mt-1">Browse courses and build your skills</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-brand-600">{courses.length}</div>
          <div className="text-sm text-gray-500">Available Courses</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Object.values(progress).filter(p => p.status === 'in_progress').length}
          </div>
          <div className="text-sm text-gray-500">In Progress</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {Object.values(progress).filter(p => p.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(Object.values(progress).reduce((sum, p) => sum + p.progress_pct, 0) / Math.max(Object.values(progress).length, 1))}%
          </div>
          <div className="text-sm text-gray-500">Avg Progress</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition capitalize ${
                filter === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {categoryIcons[cat] || '📖'} {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-700">No courses found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(course => {
            const cp = progress[course.id]
            return (
              <div key={course.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition group">
                {/* Course thumbnail */}
                <div className="h-40 bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center relative">
                  <span className="text-5xl">{categoryIcons[course.category] || '📖'}</span>
                  {cp && (
                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="bg-black/30 h-1">
                        <div className="bg-brand-400 h-1 transition-all" style={{ width: `${cp.progress_pct}%` }} />
                      </div>
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${difficultyColors[course.difficulty]}`}>
                    {course.difficulty}
                  </span>
                </div>

                {/* Course info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 capitalize">
                      {course.category}
                    </span>
                    <span className="text-xs text-gray-400">{course.estimated_minutes} min</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>

                  <button
                    onClick={() => startCourse(course.id)}
                    className={`w-full mt-4 py-2 rounded-lg font-medium text-sm transition ${
                      cp?.status === 'completed'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : cp?.status === 'in_progress'
                        ? 'bg-brand-600 text-white hover:bg-brand-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cp?.status === 'completed' ? '✓ Review Course' :
                     cp?.status === 'in_progress' ? `Continue (${cp.progress_pct}%)` :
                     'Start Course'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
