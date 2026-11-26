-- ============================================================================
-- BloomUp Row Level Security (RLS), Integrity Guards & Trusted Functions
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteering_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper: Check if current user is admin or organization
CREATE OR REPLACE FUNCTION public.is_org_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('organization', 'admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 1. PROFILES POLICIES & PRIVILEGE ESCALATION GUARD
-- ============================================================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_org_or_admin());

CREATE POLICY "Users can update own non-privileged profile fields"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Prevent students from modifying role, verified_earnings, impact_points,
-- volunteering_hours, or completed_opportunities directly.
CREATE OR REPLACE FUNCTION public.guard_profile_sensitive_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF current_setting('role', true) IN ('service_role', 'postgres', 'supabase_admin')
    OR current_user IN ('postgres', 'supabase_admin')
    OR public.is_org_or_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role
    OR NEW.verified_earnings IS DISTINCT FROM OLD.verified_earnings
    OR NEW.impact_points IS DISTINCT FROM OLD.impact_points
    OR NEW.volunteering_hours IS DISTINCT FROM OLD.volunteering_hours
    OR NEW.completed_opportunities IS DISTINCT FROM OLD.completed_opportunities THEN
    RAISE EXCEPTION 'Students cannot self-assign roles, earnings, impact points, or completed counts.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS protect_profile_sensitive_columns ON public.profiles;
CREATE TRIGGER protect_profile_sensitive_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_sensitive_columns();

-- ============================================================================
-- 2. OPPORTUNITIES POLICIES
-- ============================================================================
CREATE POLICY "Authenticated and public users can browse open opportunities"
  ON public.opportunities FOR SELECT
  USING (TRUE);

CREATE POLICY "Only organization or admin can insert opportunities"
  ON public.opportunities FOR INSERT
  WITH CHECK (public.is_org_or_admin());

CREATE POLICY "Only organization or admin can update opportunities"
  ON public.opportunities FOR UPDATE
  USING (public.is_org_or_admin());

CREATE POLICY "Only organization or admin can delete opportunities"
  ON public.opportunities FOR DELETE
  USING (public.is_org_or_admin());

-- ============================================================================
-- 3. APPLICATIONS POLICIES
-- ============================================================================
CREATE POLICY "Students can view own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = student_id OR public.is_org_or_admin());

CREATE POLICY "Students can apply as pending only"
  ON public.applications FOR INSERT
  WITH CHECK (
    auth.uid() = student_id
    AND status = 'pending'
    AND verified_at IS NULL
  );

CREATE POLICY "Students can withdraw their own pending applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (
    auth.uid() = student_id
    AND status IN ('pending', 'withdrawn')
    AND verified_at IS NULL
  );

-- ============================================================================
-- 4. SKILLS & STUDENT_SKILLS POLICIES
-- ============================================================================
CREATE POLICY "Anyone can read skills catalog"
  ON public.skills FOR SELECT
  USING (TRUE);

CREATE POLICY "Students manage own skills"
  ON public.student_skills FOR ALL
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- ============================================================================
-- 5. LEARNING GOALS POLICIES
-- ============================================================================
CREATE POLICY "Students manage own learning goals"
  ON public.learning_goals FOR ALL
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- ============================================================================
-- 6. VOLUNTEERING RECORDS POLICIES (Read-only for students)
-- ============================================================================
CREATE POLICY "Students can view own volunteering records"
  ON public.volunteering_records FOR SELECT
  USING (auth.uid() = student_id OR public.is_org_or_admin());

-- ============================================================================
-- 7. ACHIEVEMENTS & USER_ACHIEVEMENTS POLICIES
-- ============================================================================
CREATE POLICY "Anyone can view achievement definitions"
  ON public.achievements FOR SELECT
  USING (TRUE);

CREATE POLICY "Students can view own earned achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = student_id OR public.is_org_or_admin());

-- ============================================================================
-- 8. ACTIVITY LOGS POLICIES
-- ============================================================================
CREATE POLICY "Students can view own activity logs"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own non-reward activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- ============================================================================
-- 9. TRUSTED BACKEND VERIFICATION FUNCTIONS (Admin / Organization Only)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.verify_and_complete_application(
  p_application_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_app public.applications%ROWTYPE;
  v_opp public.opportunities%ROWTYPE;
BEGIN
  IF NOT public.is_org_or_admin() THEN
    RAISE EXCEPTION 'Unauthorized: only organization or admin accounts can verify completion.';
  END IF;

  SELECT * INTO v_app FROM public.applications WHERE id = p_application_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found.';
  END IF;

  IF v_app.status = 'completed' THEN
    RETURN;
  END IF;

  SELECT * INTO v_opp FROM public.opportunities WHERE id = v_app.opportunity_id;

  UPDATE public.applications
  SET status = 'completed', verified_at = NOW()
  WHERE id = p_application_id;

  IF v_opp.type = 'earn' THEN
    UPDATE public.profiles
    SET
      verified_earnings = verified_earnings + COALESCE(v_opp.payment_amount, 0),
      completed_opportunities = completed_opportunities + 1
    WHERE id = v_app.student_id;
  ELSIF v_opp.type = 'impact' THEN
    INSERT INTO public.volunteering_records (
      student_id, opportunity_id, hours_logged, points_awarded, verified_by, notes
    ) VALUES (
      v_app.student_id,
      v_opp.id,
      GREATEST(COALESCE(v_opp.duration_hours, 1), 1),
      COALESCE(v_opp.impact_points, 0),
      auth.uid(),
      'Verified completion of ' || v_opp.title
    );

    UPDATE public.profiles
    SET
      volunteering_hours = volunteering_hours + GREATEST(COALESCE(v_opp.duration_hours, 1), 1),
      impact_points = impact_points + COALESCE(v_opp.impact_points, 0),
      completed_opportunities = completed_opportunities + 1
    WHERE id = v_app.student_id;
  END IF;

  INSERT INTO public.activity_logs (student_id, action_type, title, metadata)
  VALUES (
    v_app.student_id,
    'opportunity_completed',
    'Verified completion: ' || v_opp.title,
    jsonb_build_object('opportunity_id', v_opp.id, 'type', v_opp.type)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 10. SUPABASE STORAGE BUCKET FOR PROFILE AVATARS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Students can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Students can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Students can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
