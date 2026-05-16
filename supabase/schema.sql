-- ============================================================
-- EDUBUDDI AI — Complete Database Schema
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. PROFILES (extends Supabase auth.users)
-- ──────────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin')),
  job_title TEXT,
  department TEXT,
  company_id UUID,
  xp_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  last_active_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 2. COMPANIES
-- ──────────────────────────────────────────────
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  industry TEXT,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'scale', 'enterprise')),
  max_employees INTEGER DEFAULT 25,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD CONSTRAINT fk_company
  FOREIGN KEY (company_id) REFERENCES public.companies(id);

-- ──────────────────────────────────────────────
-- 3. COURSES & LESSONS
-- ──────────────────────────────────────────────
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('sales', 'negotiation', 'product', 'communication', 'leadership', 'onboarding', 'custom')),
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_minutes INTEGER DEFAULT 30,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  company_id UUID REFERENCES public.companies(id),
  created_by UUID REFERENCES public.profiles(id),
  xp_reward INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'video', 'quiz', 'roleplay', 'interactive')),
  content JSONB NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  estimated_minutes INTEGER DEFAULT 5,
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 4. QUIZZES & QUESTIONS
-- ──────────────────────────────────────────────
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'open_ended', 'scenario')),
  options JSONB DEFAULT '[]',
  correct_answer TEXT,
  explanation TEXT,
  skill_tag TEXT,
  points INTEGER DEFAULT 10,
  order_index INTEGER DEFAULT 0
);

-- ──────────────────────────────────────────────
-- 5. LEARNING PROGRESS
-- ──────────────────────────────────────────────
CREATE TABLE public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_pct INTEGER DEFAULT 0,
  score INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB DEFAULT '{}',
  time_taken_seconds INTEGER,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 6. SKILLS & DETECTION
-- ──────────────────────────────────────────────
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT
);

CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency INTEGER DEFAULT 0 CHECK (proficiency BETWEEN 0 AND 100),
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('improving', 'stable', 'declining')),
  last_assessed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- ──────────────────────────────────────────────
-- 7. GAMIFICATION
-- ──────────────────────────────────────────────
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('xp', 'streak', 'courses', 'quizzes', 'perfect_score', 'custom')),
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 25
);

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE public.xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 8. REVENUE INTELLIGENCE
-- ──────────────────────────────────────────────
CREATE TABLE public.revenue_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  target DECIMAL(12,2) NOT NULL DEFAULT 0,
  deals_closed INTEGER DEFAULT 0,
  deals_lost INTEGER DEFAULT 0,
  avg_deal_size DECIMAL(12,2),
  conversion_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.money_leaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  type TEXT NOT NULL CHECK (type IN ('declining_performance', 'skill_gap', 'low_engagement', 'missed_targets', 'high_churn')),
  description TEXT NOT NULL,
  estimated_loss DECIMAL(12,2),
  recommended_action TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ
);

CREATE TABLE public.performance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('anomaly', 'milestone', 'risk', 'opportunity')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 9. AI COACH CONVERSATIONS
-- ──────────────────────────────────────────────
CREATE TABLE public.coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.coach_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 10. LEARNING PATHS
-- ──────────────────────────────────────────────
CREATE TABLE public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_role TEXT,
  courses JSONB DEFAULT '[]',
  estimated_weeks INTEGER DEFAULT 4,
  company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  learning_path_id UUID NOT NULL REFERENCES public.learning_paths(id),
  progress_pct INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, learning_path_id)
);

-- ──────────────────────────────────────────────
-- 11. DAILY ACTIVITY & STREAKS
-- ──────────────────────────────────────────────
CREATE TABLE public.daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  lessons_completed INTEGER DEFAULT 0,
  quizzes_taken INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  coach_messages_sent INTEGER DEFAULT 0,
  UNIQUE(user_id, activity_date)
);

-- ──────────────────────────────────────────────
-- 12. ROW LEVEL SECURITY
-- ──────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.money_leaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all in their company, edit own
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Enable insert for auth" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Courses: everyone can read published courses
CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Progress: users see own progress
CREATE POLICY "Users see own progress" ON public.course_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own lesson progress" ON public.lesson_progress FOR ALL USING (user_id = auth.uid());

-- Coach: users see own conversations
CREATE POLICY "Users see own conversations" ON public.coach_conversations FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own messages" ON public.coach_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.coach_conversations WHERE id = conversation_id AND user_id = auth.uid())
);

-- Revenue: users see own, managers see team
CREATE POLICY "Users see own revenue" ON public.revenue_data FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users see own leaks" ON public.money_leaks FOR SELECT USING (user_id = auth.uid());

-- Skills & badges: users see own
CREATE POLICY "Users see own skills" ON public.user_skills FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own badges" ON public.user_badges FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own xp" ON public.xp_history FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own activity" ON public.daily_activity FOR ALL USING (user_id = auth.uid());

-- Lessons & quizzes: readable by all authenticated
CREATE POLICY "Authenticated read lessons" ON public.lessons FOR SELECT USING (auth.role() = 'authenticated');

-- Badges readable by all
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view quizzes" ON public.quizzes FOR SELECT USING (true);
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view questions" ON public.quiz_questions FOR SELECT USING (true);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own attempts" ON public.quiz_attempts FOR ALL USING (user_id = auth.uid());
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT USING (true);
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view paths" ON public.learning_paths FOR SELECT USING (true);
ALTER TABLE public.user_learning_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own paths" ON public.user_learning_paths FOR ALL USING (user_id = auth.uid());
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own alerts" ON public.performance_alerts FOR ALL USING (user_id = auth.uid());

-- ──────────────────────────────────────────────
-- 13. AUTO-CREATE PROFILE ON SIGNUP
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────────────
-- 14. SEED DATA — Default skills
-- ──────────────────────────────────────────────
INSERT INTO public.skills (name, category, description) VALUES
  ('Cold Calling', 'sales', 'Ability to engage prospects through cold outreach'),
  ('Negotiation', 'sales', 'Closing deals and handling objections effectively'),
  ('Product Knowledge', 'product', 'Understanding of company products and features'),
  ('Active Listening', 'communication', 'Listening to understand customer needs'),
  ('Objection Handling', 'sales', 'Addressing and overcoming customer concerns'),
  ('Pipeline Management', 'sales', 'Managing and progressing deals through stages'),
  ('Discovery Questions', 'sales', 'Asking the right questions to uncover needs'),
  ('Presentation Skills', 'communication', 'Delivering compelling pitches and demos'),
  ('Time Management', 'productivity', 'Prioritizing tasks and managing workload'),
  ('CRM Hygiene', 'sales', 'Keeping CRM data accurate and up to date'),
  ('Follow-Up', 'sales', 'Consistent and timely prospect follow-up'),
  ('Emotional Intelligence', 'leadership', 'Reading and responding to emotional cues'),
  ('Team Collaboration', 'communication', 'Working effectively with team members'),
  ('Data Analysis', 'analytics', 'Interpreting sales data and metrics'),
  ('Coaching Others', 'leadership', 'Helping peers improve their skills');

-- ──────────────────────────────────────────────
-- 15. SEED DATA — Default badges
-- ──────────────────────────────────────────────
INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value, xp_reward) VALUES
  ('First Steps', 'Complete your first lesson', '🎯', 'courses', 1, 25),
  ('Quick Learner', 'Complete 5 lessons in one day', '⚡', 'courses', 5, 50),
  ('Knowledge Seeker', 'Complete 10 courses', '📚', 'courses', 10, 100),
  ('Perfect Score', 'Get 100% on a quiz', '💯', 'perfect_score', 1, 75),
  ('Quiz Master', 'Pass 25 quizzes', '🧠', 'quizzes', 25, 150),
  ('On Fire', '7-day learning streak', '🔥', 'streak', 7, 100),
  ('Unstoppable', '30-day learning streak', '🚀', 'streak', 30, 500),
  ('Rising Star', 'Reach 1,000 XP', '⭐', 'xp', 1000, 100),
  ('Expert', 'Reach 5,000 XP', '🏆', 'xp', 5000, 250),
  ('Legend', 'Reach 10,000 XP', '👑', 'xp', 10000, 500);

-- ──────────────────────────────────────────────
-- DONE! Your EduBuddi database is ready.
-- ──────────────────────────────────────────────
