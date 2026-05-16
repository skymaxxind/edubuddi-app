// Types matching the actual Supabase schema

export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'employee' | 'manager' | 'admin'
  job_title: string | null
  department: string | null
  company_id: string | null
  avatar_url: string | null
  xp_points: number
  level: number
  current_streak: number
  longest_streak: number
  last_active_at: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  logo_url: string | null
  industry: string | null
  plan: string
  max_employees: number
  created_at: string
}

export interface Course {
  id: string
  title: string
  description: string | null
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_minutes: number
  thumbnail_url: string | null
  is_published: boolean
  company_id: string | null
  created_by: string | null
  xp_reward: number
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  content_type: 'text' | 'video' | 'quiz' | 'roleplay' | 'interactive'
  content: any // JSONB
  order_index: number
  estimated_minutes: number
  xp_reward: number
  created_at: string
}

export interface Quiz {
  id: string
  lesson_id: string | null
  course_id: string | null
  title: string
  passing_score: number
  time_limit_minutes: number | null
  created_at: string
  questions?: QuizQuestion[]
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question: string
  question_type: string
  options: any // JSONB
  correct_answer: string
  explanation: string | null
  skill_tag: string | null
  points: number
  order_index: number
}

export interface CourseProgress {
  id: string
  user_id: string
  course_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  progress_pct: number
  score: number | null
  started_at: string | null
  completed_at: string | null
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  score: number | null
  time_spent_seconds: number
  completed_at: string | null
}

export interface Skill {
  id: string
  name: string
  category: string
  description: string | null
}

export interface UserSkill {
  id: string
  user_id: string
  skill_id: string
  proficiency: number
  trend: 'improving' | 'stable' | 'declining'
  last_assessed_at: string
  skill?: Skill
}

export interface Badge {
  id: string
  name: string
  description: string | null
  icon: string
  requirement_type: string
  requirement_value: number
  xp_reward: number
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge?: Badge
}

export interface XPHistory {
  id: string
  user_id: string
  amount: number
  source: string
  description: string | null
  created_at: string
}

export interface RevenueData {
  id: string
  user_id: string
  period: string
  revenue: number
  target: number
  deals_closed: number
  deals_lost: number
  avg_deal_size: number | null
  conversion_rate: number | null
  created_at: string
}

export interface MoneyLeak {
  id: string
  user_id: string
  detected_at: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: string
  description: string
  estimated_loss: number | null
  recommended_action: string | null
  resolved: boolean
  resolved_at: string | null
}

export interface PerformanceAlert {
  id: string
  user_id: string
  alert_type: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  read: boolean
  created_at: string
}

export interface CoachConversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  messages?: CoachMessage[]
}

export interface CoachMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface DailyActivity {
  id: string
  user_id: string
  activity_date: string
  lessons_completed: number
  quizzes_taken: number
  xp_earned: number
  time_spent_minutes: number
  coach_messages_sent: number
}
