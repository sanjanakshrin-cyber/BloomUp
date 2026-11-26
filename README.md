# BloomUp — Student Opportunity & Growth Platform

**Tagline:** *Grow your skills. Earn your worth. Make an impact.*

BloomUp is a full-stack student platform uniting three pillars in one place:
1. **EARN:** Discover paid micro-gigs, apply, and track verified earnings.
2. **IMPACT:** Participate in volunteering drives, log verified hours, and earn impact points.
3. **GROW:** Manage technical and non-technical skills, create learning goals, and track milestones.

---

## Technology Stack

- **Frontend:** React 18, Vite, React Router, Lucide React, CSS variables (Light Sage & Deep Forest Dark themes)
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage, Row Level Security)
- **Hosting:** Vercel (SPA rewrite configured in `vercel.json`)

---

## Local Installation & Running

```bash
cd bloomup
npm install
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

---

## Supabase Project Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - Never expose `service_role` in frontend code or commit `.env`.

### Database Migrations

Run the SQL files in order inside the **Supabase SQL Editor** (or via Supabase CLI `supabase db push`):

1. `supabase/migrations/001_initial_schema.sql` — Creates all 10 tables (`profiles`, `opportunities`, `applications`, `skills`, `student_skills`, `learning_goals`, `volunteering_records`, `achievements`, `user_achievements`, `activity_logs`) and signup profile trigger.
2. `supabase/migrations/002_rls_and_functions.sql` — Enables Row Level Security, prevents students from self-assigning roles/earnings/impact points, sets up `verify_and_complete_application`, and configures the `avatars` storage bucket.

### Demo Seed Data

Run `supabase/seed.sql` in the **Supabase SQL Editor** to populate:
- Core skills catalog
- Achievement badges
- Clearly labeled `[Demo Opportunity]` paid micro-gigs (`earn`) and volunteering drives (`impact`)

---

## Assigning Organization / Admin Roles

By default, every new signup receives `role = 'student'`. Students cannot elevate their own role due to the `protect_profile_sensitive_columns` database trigger.

To promote an organization or admin account, run in the **Supabase SQL Editor** (as `postgres` / `service_role`):

```sql
UPDATE public.profiles
SET role = 'organization' -- or 'admin'
WHERE email = 'partner@organization.org';
```

Only `organization` or `admin` accounts can create/manage opportunities or call `verify_and_complete_application(application_id)`.

---

## Google OAuth Setup

1. In [Google Cloud Console](https://console.cloud.google.com/), create OAuth 2.0 Web Application credentials.
2. Add your Supabase callback URL as an **Authorized Redirect URI**:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. In **Supabase Dashboard → Authentication → Providers → Google**, enable Google and paste your **Client ID** and **Client Secret**.
4. Under **Authentication → URL Configuration**, add your local (`http://localhost:5173`) and production Vercel URLs to **Redirect URLs**.

---

## GitHub & Vercel Deployment

### GitHub
```bash
git init
git add .
git commit -m "feat: initial BloomUp MVP"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Vercel
1. Import your GitHub repository in [vercel.com](https://vercel.com).
2. Framework Preset: **Vite** (`npm run build`, output directory `dist`).
3. Add environment variables in Vercel Project Settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. `vercel.json` is included so nested routes (`/dashboard`, `/earn`, `/onboarding`, etc.) work on direct refresh.

---

## Troubleshooting

- **"Supabase not configured" banner appears:** Ensure `.env` exists in `bloomup/` with valid `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then restart `npm run dev`.
- **Avatar upload fails:** Confirm `002_rls_and_functions.sql` ran so the `avatars` storage bucket and its policies exist.
- **404 on page refresh in production:** Confirm `vercel.json` is deployed at the root of the project.
