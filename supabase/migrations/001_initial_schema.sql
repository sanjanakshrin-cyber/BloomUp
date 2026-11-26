-- ============================================================================
-- BloomUp Initial PostgreSQL Schema
-- Tables:
--   1. profiles
--   2. opportunities
--   3. applications
--   4. skills
--   5. student_skills
--   6. learning_goals
--   7. volunteering_records
--   8. achievements
--   9. user_achievements
--  10. activity_logs
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  location TEXT DEFAULT '',
  college TEXT DEFAULT '',
  course TEXT DEFAULT '',
  academic_year TEXT DEFAULT '',
  preferred_gig_categories TEXT[] DEFAULT '{}',
  preferred_volunteering_categories TEXT[] DEFAULT '{}',
  learning_interests TEXT[] DEFAULT '{}',
  career_goals TEXT DEFAULT '',
  learning_goals_summary TEXT DEFAULT '',
  personal_dev_goals TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'organization', 'admin')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  verified_earnings NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (verified_earnings >= 0),
  impact_points INTEGER NOT NULL DEFAULT 0 CHECK (impact_points >= 0),
  volunteering_hours NUMERIC(8, 2) NOT NULL DEFAULT 0 CHECK (volunteering_hours >= 0),
  completed_opportunities INTEGER NOT NULL DEFAULT 0 CHECK (completed_opportunities >= 0),
  notification_prefs JSONB NOT NULL DEFAULT '{"email_updates": true, "opportunity_alerts": true, "goal_reminders": true}'::jsonb,
  privacy_prefs JSONB NOT NULL DEFAULT '{"show_on_leaderboard": true, "profile_visibility": "students"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. OPPORTUNITIES (supports both Paid Micro-Gigs and Volunteering)
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('earn', 'impact')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  organization TEXT NOT NULL,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  payment_amount NUMERIC(10, 2) DEFAULT 0 CHECK (payment_amount >= 0),
  currency TEXT DEFAULT 'INR',
  impact_points INTEGER DEFAULT 0 CHECK (impact_points >= 0),
  duration_hours NUMERIC(6, 2) DEFAULT 0 CHECK (duration_hours >= 0),
  available_slots INTEGER DEFAULT 10 CHECK (available_slots >= 0),
  work_mode TEXT NOT NULL DEFAULT 'remote' CHECK (work_mode IN ('remote', 'in-person', 'hybrid')),
  location TEXT DEFAULT 'Remote',
  deadline TIMESTAMPTZ,
  event_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed')),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_type_status ON public.opportunities(type, status);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON public.opportunities(category);

CREATE TRIGGER set_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'withdrawn')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_student ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_opportunity ON public.applications(opportunity_id);

CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. SKILLS CATALOG
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('technical', 'non-technical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. STUDENT SKILLS
CREATE TABLE IF NOT EXISTS public.student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'technical' CHECK (category IN ('technical', 'non-technical')),
  proficiency TEXT NOT NULL DEFAULT 'beginner' CHECK (proficiency IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_student_skills_student ON public.student_skills(student_id);

CREATE TRIGGER set_student_skills_updated_at
  BEFORE UPDATE ON public.student_skills
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. LEARNING GOALS
CREATE TABLE IF NOT EXISTS public.learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  skill_tag TEXT DEFAULT '',
  target_date DATE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_goals_student ON public.learning_goals(student_id);

CREATE TRIGGER set_learning_goals_updated_at
  BEFORE UPDATE ON public.learning_goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. VOLUNTEERING RECORDS (Verified only)
CREATE TABLE IF NOT EXISTS public.volunteering_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  hours_logged NUMERIC(6, 2) NOT NULL CHECK (hours_logged > 0),
  points_awarded INTEGER NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_volunteering_student ON public.volunteering_records(student_id);

-- 8. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'award',
  pillar TEXT NOT NULL CHECK (pillar IN ('earn', 'impact', 'grow', 'general')),
  points_required INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. USER ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, achievement_id)
);

-- 10. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  title TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_student ON public.activity_logs(student_id, created_at DESC);
