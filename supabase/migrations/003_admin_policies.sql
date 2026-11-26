-- Allow admins and organizations to assign tasks directly and update application statuses
CREATE POLICY "Admins and orgs can assign applications"
  ON public.applications FOR INSERT
  WITH CHECK (public.is_org_or_admin());

CREATE POLICY "Admins and orgs can update applications"
  ON public.applications FOR UPDATE
  USING (public.is_org_or_admin())
  WITH CHECK (public.is_org_or_admin());
