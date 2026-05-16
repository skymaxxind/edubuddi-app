'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppShell from '@/components/ui/AppShell'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type { Course, Lesson, Quiz, QuizQuestion } from '@/types/database'

export default function CourseDetailPage() {
  const { courseId } = useParams()
  const { profile } = useAuth()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [showQuiz, setShowQuiz] = useState(false)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)

  useEffect(() => {
    if (!profile || !courseId) return
    fetchCourse()
  }, [profile, courseId])

  const fetchCourse = async () => {
    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()
    if (courseData) setCourse(courseData)

    const { data: lessonData } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })
    if (lessonData) {
      setLessons(lessonData)
      if (lessonData.length > 0) setActiveLesson(lessonData[0])
    }

    // Get completed lessons
    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', profile!.id)
      .eq('completed', true)
    if (progressData) {
      setCompletedLessons(new Set(progressData.map(p => p.lesson_id)))
    }
  }

  const completeLesson = async (lessonId: string) => {
    if (!profile) return

    const { data: existing } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('user_id', profile.id)
      .eq('lesson_id', lessonId)
      .single()

    if (existing) {
      await supabase
        .from('lesson_progress')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      await supabase.from('lesson_progress').insert({
        user_id: profile.id,
        lesson_id: lessonId,
        completed: true,
        time_spent_seconds: 300,
        completed_at: new Date().toISOString()
      })
    }

    setCompletedLessons(prev => new Set([...prev, lessonId]))

    // Award XP
    await supabase.from('xp_history').insert({
      user_id: profile.id,
      amount: 25,
      source: 'lesson',
      description: `Completed lesson: ${activeLesson?.title}`
    })

    await supabase
      .from('profiles')
      .update({ xp_points: profile.xp_points + 25 })
      .eq('id', profile.id)

    // Update course progress
    const newCompleted = completedLessons.size + 1
    const progressPct = Math.round((newCompleted / lessons.length) * 100)
    const isComplete = newCompleted >= lessons.length

    await supabase
      .from('course_progress')
      .upsert({
        user_id: profile.id,
        course_id: courseId as string,
        status: isComplete ? 'completed' : 'in_progress',
        progress_pct: progressPct,
        ...(isComplete ? { completed_at: new Date().toISOString() } : {})
      }, { onConflict: 'user_id,course_id' })

    // Move to next lesson or show quiz
    const currentIndex = lessons.findIndex(l => l.id === lessonId)
    if (currentIndex < lessons.length - 1) {
      setActiveLesson(lessons[currentIndex + 1])
    } else {
      // Check for quiz
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('*, questions:quiz_questions(*)')
        .eq('lesson_id', lessonId)
        .single()

      if (quizData) {
        setQuiz(quizData)
        setQuizQuestions(quizData.questions || [])
        setShowQuiz(true)
      }
    }
  }

  const submitQuiz = async () => {
    if (!quiz || !profile) return

    let correct = 0
    quizQuestions.forEach(q => {
      if (answers[q.id] === q.correct_answer) correct++
    })

    const score = Math.round((correct / quizQuestions.length) * 100)
    setQuizScore(score)
    setQuizSubmitted(true)

    const passed = score >= quiz.passing_score

    await supabase.from('quiz_attempts').insert({
      user_id: profile.id,
      quiz_id: quiz.id,
      score,
      passed,
      answers
    })

    if (passed) {
      await supabase.from('xp_history').insert({
        user_id: profile.id,
        amount: 50,
        source: 'quiz',
        description: `Passed quiz: ${quiz.title} (${score}%)`
      })

      await supabase
        .from('profiles')
        .update({ xp: profile.xp_points + 50 })
        .eq('id', profile.id)
    }
  }

  if (!course) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-500">Loading course...</div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      {/* Course header */}
      <div className="mb-6">
        <button onClick={() => router.push('/training')} className="text-sm text-gray-500 hover:text-brand-600 mb-2 inline-block">
          ← Back to Training
        </button>
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="text-gray-500 mt-1">{course.description}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span className="capitalize">{course.category}</span>
          <span>{course.difficulty}</span>
          <span>{course.estimated_minutes} min total</span>
          <span>{completedLessons.size}/{lessons.length} lessons done</span>
        </div>
        {/* Progress bar */}
        <div className="mt-3 bg-gray-200 rounded-full h-2 max-w-md">
          <div
            className="bg-brand-500 h-2 rounded-full transition-all"
            style={{ width: `${lessons.length > 0 ? (completedLessons.size / lessons.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Lesson sidebar */}
        <div className="w-72 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 font-semibold text-sm">
              Course Content ({lessons.length} lessons)
            </div>
            {lessons.map((lesson, idx) => {
              const isCompleted = completedLessons.has(lesson.id)
              const isActive = activeLesson?.id === lesson.id
              return (
                <button
                  key={lesson.id}
                  onClick={() => { setActiveLesson(lesson); setShowQuiz(false) }}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 flex items-center gap-3 transition ${
                    isActive ? 'bg-brand-50 border-l-2 border-l-brand-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-medium truncate ${isActive ? 'text-brand-700' : ''}`}>
                      {lesson.title}
                    </div>
                    <div className="text-xs text-gray-400">{lesson.estimated_minutes} min</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1">
          {showQuiz && quiz ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-2">{quiz.title}</h2>
              <p className="text-gray-500 mb-6">Pass with {quiz.passing_score}% to earn bonus XP!</p>

              {!quizSubmitted ? (
                <>
                  {quizQuestions.map((q, idx) => (
                    <div key={q.id} className="mb-6">
                      <div className="font-medium mb-3">{idx + 1}. {q.question}</div>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => setAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                            className={`w-full text-left p-3 rounded-lg border transition ${
                              answers[q.id] === optIdx
                                ? 'border-brand-500 bg-brand-50'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-sm">{opt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(answers).length < quizQuestions.length}
                    className="px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition disabled:opacity-50"
                  >
                    Submit Answers
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">{quizScore >= quiz.passing_score ? '🎉' : '😢'}</div>
                  <div className="text-3xl font-bold mb-2">{quizScore}%</div>
                  <div className={`text-lg font-medium ${quizScore >= quiz.passing_score ? 'text-green-600' : 'text-red-600'}`}>
                    {quizScore >= quiz.passing_score ? 'Passed! +50 XP earned!' : 'Not quite. Review the material and try again.'}
                  </div>
                  <button
                    onClick={() => router.push('/training')}
                    className="mt-6 px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition"
                  >
                    Back to Courses
                  </button>
                </div>
              )}
            </div>
          ) : activeLesson ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span className="capitalize">{activeLesson.content_type}</span>
                <span>•</span>
                <span>{activeLesson.estimated_minutes} min</span>
              </div>
              <h2 className="text-xl font-bold mb-4">{activeLesson.title}</h2>

              <div className="prose max-w-none">
                {activeLesson.content.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-3 text-gray-700 leading-relaxed">{paragraph}</p>
                ))}
              </div>

              <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {completedLessons.has(activeLesson.id) ? (
                    <span className="text-green-600 font-medium">✓ Completed</span>
                  ) : (
                    'Mark as complete when you\'re done'
                  )}
                </div>
                {!completedLessons.has(activeLesson.id) && (
                  <button
                    onClick={() => completeLesson(activeLesson.id)}
                    className="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition"
                  >
                    Complete & Continue →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Select a lesson to begin</div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
