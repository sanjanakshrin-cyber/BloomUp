# BloomUp — Complete Project & System Design Documentation

**Project Name:** BloomUp  
**Tagline:** *Grow your skills. Earn your worth. Make an impact.*  
**Live Production URL:** https://bloomup-rust.vercel.app  
**Backend Platform:** Supabase (PostgreSQL, Auth, Storage, Row Level Security)  
**Frontend Hosting:** Vercel  

---

## Table of Contents

1. Executive Summary & Project Vision  
2. Problem Statement & Objectives  
3. Languages, Frameworks & Libraries Used  
4. System Architecture & Total System Design  
5. Frontend Architecture & Module Breakdown  
6. Brand Identity & Design System  
7. Backend & Database Design (PostgreSQL)  
8. Security, Authentication & Row Level Security (RLS)  
9. Admin vs. Student Role Separation & Virtual Reward Flow  
10. Modular AI-Ready Recommendation Engine  
11. Testing & Verification (`pytest` Clarification & Actual Checks)  
12. Git & Git Bash Commands (What Was Run vs. GitHub Deployment Guide)  
13. Cloud Deployment (Supabase & Vercel)  
14. Missing / Recommended Enhancements & Future Roadmap  

---

## 1. Executive Summary & Project Vision

**BloomUp** is a full-stack student opportunity and personal growth platform designed for college and university students. Instead of forcing students to use separate tools for freelance micro-gigs, community volunteering, and skill tracking, BloomUp unifies three core pillars into one cohesive workspace:

1. **EARN:** Students discover paid micro-gigs, apply with tailored pitches, complete assigned tasks, and track **virtual verified rewards (`₹`)** (designed for visualization and portfolio tracking rather than real money transfers).
2. **IMPACT:** Students participate in community volunteering drives, log verified service hours, earn Impact Points, and unlock achievement badges.
3. **GROW:** Students manage technical and non-technical skills with proficiency levels, set deadline-backed learning goals, track progress visually, and access curated learning resources.

---

## 2. Problem Statement & Objectives

### 2.1 Problem Statement
Students often struggle with fragmented platforms:
- Job boards focus on full-time roles rather than student-friendly micro-gigs.
- Volunteering initiatives lack centralized hour/impact verification.
- Learning goals and skill progress are rarely connected to real-world opportunities.

### 2.2 Core Objectives
- Provide a **single responsive web application** with Light Sage and Deep Forest Dark themes.
- Implement **real authentication** (email/password, password reset, session persistence) and **role-based access control (RBAC)** separating **Students** and **Admins/Organizations**.
- Enforce **database-level security** using Supabase PostgreSQL Row Level Security (RLS) and triggers so students cannot self-assign roles, earnings, or impact points.
- Deliver an **Admin Console** where administrators can publish tasks, assign tasks directly to students, and verify completion to credit virtual tracked rewards.

---

## 3. Languages, Frameworks & Libraries Used

### 3.1 Programming & Markup Languages
| Language | Where Used | Purpose |
| :--- | :--- | :--- |
| **JavaScript (ES2022 / JSX)** | `src/**/*.js`, `src/**/*.jsx` | Frontend application logic, React components, state management, Supabase client queries |
| **HTML5** | `index.html`, JSX templates | Semantic page structure, Google Fonts (`Mulish`), accessible landmarks |
| **CSS3 (CSS Variables)** | `src/styles/theme.css`, `global.css`, page/component CSS | Centralized Light/Dark theme tokens, responsive CSS Grid/Flexbox layouts, animations |
| **PostgreSQL SQL & PL/pgSQL** | `supabase/migrations/*.sql`, `supabase/seed.sql` | 10-table relational schema, RLS policies, triggers, and `SECURITY DEFINER` RPCs |
| **TOML & JSON** | `supabase/config.toml`, `package.json`, `vercel.json` | Supabase Auth URL config, npm dependencies, Vercel SPA routing |

### 3.2 Frontend Libraries (`package.json`)
| Package | Version | Role |
| :--- | :--- | :--- |
| `react` | `^18.3.1` | Core UI component library |
| `react-dom` | `^18.3.1` | DOM rendering for React 18 |
| `react-router-dom` | `^7.1.5` | Client-side routing, protected routes, role guards, 404 handling |
| `@supabase/supabase-js` | `^2.49.1` | Official Supabase SDK for Auth, PostgreSQL queries, RPC calls, and Storage |
| `lucide-react` | `^0.475.0` | Clean, consistent line icon set |

### 3.3 Build, Lint & Development Tools
| Package | Version | Role |
| :--- | :--- | :--- |
| `vite` | `^6.1.0` | Fast development server and production bundler |
| `@vitejs/plugin-react` | `^4.3.4` | React Fast Refresh and JSX transform |
| `eslint` | `^9.19.0` | Static code analysis and lint rules (`eslint.config.js`) |
| `eslint-plugin-react-hooks` | `^5.1.0` | Enforces React Hooks rules |
| `eslint-plugin-react-refresh` | `^0.4.18` | Validates Fast Refresh boundaries |

---

## 4. System Architecture & Total System Design

BloomUp follows a **Modern 3-Layer Serverless / BaaS (Backend-as-a-Service) Architecture**:

1. **Presentation Layer (Vercel Edge / React SPA):**
   - Built with Vite + React 18 and served globally by Vercel CDN.
   - `vercel.json` rewrites all routes (`/(.*)`) to `/index.html` so direct URL access and refreshes on `/dashboard`, `/earn`, `/admin`, etc. work seamlessly.
2. **Application & State Layer (Browser Client):**
   - `ThemeContext` manages Light/Dark theme persistence (`localStorage` + `data-theme`).
   - `ToastContext` provides global non-blocking notifications.
   - `AuthContext` manages Supabase JWT sessions, profile loading, and auth actions.
   - `bloomupService.js` encapsulates all database/storage/RPC operations.
3. **Data, Auth & Security Layer (Supabase Cloud — `ap-south-1`):**
   - **Supabase Auth (GoTrue):** Issues JWTs, handles signup, login, password reset, and email confirmation.
   - **PostgreSQL 15+:** Stores all 10 relational tables, executes triggers, and enforces Row Level Security on every query.
   - **Supabase Storage:** Hosts student profile pictures in the `avatars` bucket with per-user folder isolation.

*(See [STARUML_MERMAID_DIAGRAMS.md](file:///Users/manirajsrikoti/bloomup/STARUML_MERMAID_DIAGRAMS.md) for full Architecture, ER, Sequence, Class, and State diagrams.)*

---

## 5. Frontend Architecture & Module Breakdown

### 5.1 Folder Structure
```text
bloomup/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/          # Badge, Button, Modal, ConfirmDialog, EmptyState, Skeleton, Logo, ProtectedRoute
│   │   ├── layout/          # AppLayout (Sidebar + Topbar + Mobile Drawer)
│   │   └── opportunities/   # OpportunityCard, OpportunityDetailModal
│   ├── context/             # AuthContext, ThemeContext, ToastContext
│   ├── lib/                 # supabase.js
│   ├── pages/               # 15 pages (Landing, Auth, Onboarding, Dashboard, Earn, Impact, Grow, Applications, Profile, Settings, Admin, 404)
│   ├── services/            # bloomupService.js
│   ├── styles/              # theme.css, global.css
│   ├── utils/               # recommendations.js, formatters.js
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   ├── config.toml
│   ├── migrations/          # 001_initial_schema.sql, 002_rls_and_functions.sql, 003_admin_policies.sql
│   └── seed.sql
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
├── vercel.json
└── vite.config.js
```

### 5.2 Routing & Access Control (`src/App.jsx`, `ProtectedRoute.jsx`)
- **Public Routes:** `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`
- **Guest Guards (`GuestRoute`):** Logged-in users visiting `/login` or `/signup` are automatically redirected to `/admin` (if admin/org), `/onboarding` (if onboarding incomplete), or `/dashboard`.
- **Student Protected Routes (`ProtectedRoute`):** `/onboarding`, `/dashboard`, `/earn`, `/impact`, `/grow`, `/applications`, `/profile`, `/settings`
- **Admin Protected Route (`AdminRoute`):** `/admin` — accessible only when `profile.role IN ('admin', 'organization')`.
- **Fallback:** `*` renders `NotFoundPage.jsx`.

---

## 6. Brand Identity & Design System

- **Typography:** `Mulish` loaded via Google Fonts (`400`, `500`, `600`, `700`, `800`).
- **Exact Brand Palette:**
  - Primary Green: `#84C233` (CTAs, active states, progress bars)
  - Warm Yellow: `#F6C827` (highlights, badges, goals)
  - Vibrant Orange: `#F7931E` (Impact pillar, logo ring, admin badges)
  - Earthy Brown: `#493D33` (neutral dark accents)
  - Pure White: `#FFFFFF` (light-mode card surfaces)
- **Dual Theme Support:**
  - **Light Theme:** Warm cream/pale-sage canvas (`#F3F8EE`) with `#FFFFFF` cards and deep green text (`#1F331E`).
  - **Dark Theme:** Deep forest-green canvas (`#0E2215`) with elevated forest-green cards (`#1A3724`) and warm-white text (`#F4F8F2`).

---

## 7. Backend & Database Design (PostgreSQL)

All 10 tables live in the `public` schema (defined in [001_initial_schema.sql](file:///Users/manirajsrikoti/bloomup/supabase/migrations/001_initial_schema.sql)):

1. **`profiles`** — Extends `auth.users(id)` (`PK`, `ON DELETE CASCADE`). Stores student personal/education info, interests, goals, `role` (`student | organization | admin`), `onboarding_completed`, and server-managed totals (`verified_earnings`, `impact_points`, `volunteering_hours`, `completed_opportunities`).
2. **`opportunities`** — Unified table for both `earn` (micro-gigs) and `impact` (volunteering) with `payment_amount`, `currency`, `impact_points`, `duration_hours`, `required_skills[]`, `work_mode`, `deadline`, `status`, and `is_demo`.
3. **`applications`** — Links `student_id` to `opportunity_id` with `UNIQUE (student_id, opportunity_id)` to prevent duplicate applications. Tracks `status` (`pending | accepted | rejected | completed | withdrawn`) and `verified_at`.
4. **`skills`** — Master catalog of technical and non-technical skills.
5. **`student_skills`** — Junction table storing each student's skills and `proficiency` (`beginner | intermediate | advanced`).
6. **`learning_goals`** — Personal goals with `target_date`, `progress` (`0–100`), and `status` (`in_progress | completed`).
7. **`volunteering_records`** — Immutable verified log of volunteering hours and awarded impact points.
8. **`achievements`** — Badge definitions (`First Sprout`, `First Verified Gig`, `Community Seed`, `Goal Finisher`, `Eco Champion`).
9. **`user_achievements`** — Tracks unlocked badges per student.
10. **`activity_logs`** — Timeline of student actions (`application_submitted`, `task_assigned`, `opportunity_completed`, `goal_created`).

---

## 8. Security, Authentication & Row Level Security (RLS)

Defined in [002_rls_and_functions.sql](file:///Users/manirajsrikoti/bloomup/supabase/migrations/002_rls_and_functions.sql) and [003_admin_policies.sql](file:///Users/manirajsrikoti/bloomup/supabase/migrations/003_admin_policies.sql):

- **Privilege Escalation Guard (`protect_profile_sensitive_columns` trigger):** Blocks any student API request from modifying `role`, `verified_earnings`, `impact_points`, `volunteering_hours`, or `completed_opportunities`. Only `service_role`, `postgres`, or `admin/organization` can update those fields.
- **Application Integrity:** Students can only insert `pending` applications for themselves and withdraw their own `pending` applications. They cannot mark their own applications as `accepted` or `completed`.
- **Trusted RPC (`verify_and_complete_application(p_application_id)`):** Runs as `SECURITY DEFINER`, checks `is_org_or_admin()`, marks the application `completed`, credits `verified_earnings` (for Earn) or `volunteering_hours` + `impact_points` (for Impact), and inserts an `activity_logs` entry atomically.
- **Storage Security (`avatars` bucket):** Publicly readable, but `INSERT` / `UPDATE` / `DELETE` are restricted to `(storage.foldername(name))[1] = auth.uid()::text`.
- **Secret Hygiene:** Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are exposed to the frontend; `.env` is excluded via `.gitignore`.

---

## 9. Admin vs. Student Role Separation & Virtual Reward Flow

### 9.1 Admin Account (`admin@bloomup.app`)
- Automatically lands on `/admin` (**Admin Console**).
- Can **Create Tasks** (Earn micro-gigs with virtual `₹` amounts or Impact drives with points/hours).
- Can **Assign Tasks Directly** to any registered student (`status = 'accepted'`).
- Can **Accept / Reject** pending student applications.
- Can **Verify & Complete** tasks, crediting virtual tracked earnings (`₹`) or Impact Points to the student.

### 9.2 Student Account (`student@bloomup.app`)
- New students complete the 5-step **Onboarding** wizard (`/onboarding`), then land on `/dashboard`.
- Browse **Earn** and **Impact**, apply to opportunities, view Admin-assigned tasks in **My Applications**, manage skills/goals in **Grow**, and see their **Verified Earnings (`₹`)** update automatically when the Admin verifies completion.
- *Note:* Earnings are **virtual tracked rewards** for visualization and portfolio proof—no real payment gateway or bank transfer is involved.

---

## 10. Modular AI-Ready Recommendation Engine

Implemented in [recommendations.js](file:///Users/manirajsrikoti/bloomup/src/utils/recommendations.js):
- Scores each open opportunity against the student's profile:
  - `+30` points per matching skill (`required_skills` vs `student_skills`)
  - `+25` points for matching preferred Earn/Impact category
  - `+15` points for keyword alignment with `learning_interests`
- Returns a transparent `matchReason` string (e.g., *"Matches your skills: React, JavaScript"*).
- Designed as a pure function (`scoreOpportunity`) so a future LLM/embedding service can replace or augment scoring without changing any UI component.

---

## 11. Testing & Verification (`pytest` Clarification & Actual Checks)

### 11.1 Did we use `pytest`?
**No.** `pytest` is a Python testing framework and was **not** used in this project because BloomUp's codebase is **JavaScript (React + Vite)** with a **Supabase (PostgreSQL)** backend—there is no Python server or Python test suite.

### 11.2 Verification Actually Executed
1. **Static Analysis (`npm run lint`):** ESLint checked all `.js` and `.jsx` files — **0 errors** (4 non-blocking warnings).
2. **Production Bundle (`npm run build`):** Vite compiled 1,684 modules into `dist/` cleanly in `1.18s`.
3. **Database Migrations & Seed Verification:** Executed `001_initial_schema.sql`, `002_rls_and_functions.sql`, `003_admin_policies.sql`, and `seed.sql` against live Supabase (`snkwrcubvudrkyitgkbh`), confirming **13 opportunities, 14 skills, and 5 achievements** in PostgreSQL.
4. **Live Auth Verification (`curl`):** Tested `POST /auth/v1/token?grant_type=password` for both `student@bloomup.app` and `admin@bloomup.app` — both returned valid authenticated sessions.
5. **Live Production HTTP Check (`curl -sI`):** Verified `HTTP/2 200` on `https://bloomup-rust.vercel.app` and `https://bloomup-rust.vercel.app/login`.

---

## 12. Git & Git Bash Commands (What Was Run vs. GitHub Deployment Guide)

### 12.1 Honest Status: What Commands Were Actually Run
During this build, **no `git` commands were run**—the project was deployed directly from `/Users/manirajsrikoti/bloomup` to Vercel using the **Vercel CLI** (`vercel --prod --yes`), and the database was deployed using the **Supabase CLI** (`supabase db push --yes`).

### 12.2 Complete Git Bash Commands to Push to GitHub
Open **Git Bash** (or terminal) in `/Users/manirajsrikoti/bloomup` and run:

```bash
# 1. Navigate to the project folder
cd /Users/manirajsrikoti/bloomup

# 2. Initialize a new Git repository
git init

# 3. Verify .env is ignored (CRITICAL: never commit .env!)
git status

# 4. Stage all project files
git add .

# 5. Create your initial commit
git commit -m "feat: complete BloomUp full-stack MVP with Admin Console"

# 6. Rename default branch to main
git branch -M main

# 7. Link your GitHub repository (replace with your actual GitHub repo URL)
git remote add origin https://github.com/<your-username>/bloomup.git

# 8. Push to GitHub
git push -u origin main
```

### 12.3 Everyday Git Bash Commands You Should Know
```bash
git status                  # Check modified/untracked files
git add <file>              # Stage a specific file
git commit -m "fix: ..."    # Commit staged changes
git pull origin main        # Pull latest changes from GitHub
git checkout -b feat/new    # Create and switch to a new feature branch
git log --oneline -n 10     # View recent commit history
```

---

## 13. Cloud Deployment (Supabase & Vercel)

- **Supabase Project Ref:** `snkwrcubvudrkyitgkbh` (`ap-south-1`)
- **Supabase Auth URL Config:** `site_url = https://bloomup-rust.vercel.app`, `additional_redirect_urls = ["https://bloomup-rust.vercel.app/**", "http://localhost:5173/**"]`
- **Vercel Project:** `manirajsrikoti-5021/bloomup`
- **Vercel Env Vars:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured for `Production` and `Preview`.
- **SPA Routing:** Handled by `vercel.json` rewrite rules.

---

## 14. Missing / Recommended Enhancements & Future Roadmap

Items not yet added in this MVP that are recommended for production scaling:
1. **Automated Test Suite:** Add **Vitest + React Testing Library** for unit/component tests and **Playwright** for end-to-end browser tests.
2. **GitHub CI/CD Auto-Deploy:** Connect the GitHub repository to Vercel so every `git push origin main` triggers automatic lint, build, and deployment.
3. **Google OAuth Credentials:** Add Google Cloud Client ID & Secret in Supabase Dashboard if social login is desired.
4. **Code Splitting:** Add `React.lazy()` route-level code splitting to reduce initial JS bundle size below 500 kB.
5. **Email Templates & Notifications:** Customize Supabase Auth email templates with BloomUp branding.
6. **AI Recommendation Upgrade:** Replace rule-based scoring in `src/utils/recommendations.js` with vector embeddings (`pgvector`) or an LLM ranking endpoint.
