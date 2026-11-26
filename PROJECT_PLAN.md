# BloomUp — Implementation Plan

## Overview
BloomUp is a full-stack student opportunity and growth platform uniting **Earn** (paid micro-gigs), **Impact** (volunteering & community service), and **Grow** (skills & learning goals).

## Batches
1. **Batch 1 — Project Setup, Theme, Shared Components & Landing Page**
   - Vite + React + React Router + Lucide React
   - Centralized CSS variable theme system (Light & Dark forest-green themes, Mulish font, `#84C233`, `#F6C827`, `#F7931E`, `#493D33`, `#FFFFFF`)
   - Common UI kit (Button, Card, Badge, Modal, ConfirmDialog, Toast, Skeleton, EmptyState, Botanical SVG illustrations)
   - Responsive Public Landing Page (Navbar, Hero, 3 Pillars, How It Works, Why BloomUp, Demo Testimonials, Final CTA, Footer)

2. **Batch 2 — Supabase, Database Schema, Migrations & Authentication**
   - 10 PostgreSQL tables (`profiles`, `opportunities`, `applications`, `skills`, `student_skills`, `learning_goals`, `volunteering_records`, `achievements`, `user_achievements`, `activity_logs`)
   - Strict Row Level Security (RLS) policies + server-side RPCs (`complete_opportunity_application`, `log_verified_volunteering`) + Storage bucket policies for avatars
   - AuthContext (Email/Password, Google OAuth, Password Reset, Email Verification, Session Persistence)
   - Login, Signup, ForgotPassword, ResetPassword, ProtectedRoute, GuestRoute, 404

3. **Batch 3 — Student Onboarding, Profile & Dashboard**
   - 5-step onboarding wizard (Personal, Education, Skills, Interests, Goals) with progress bar & Supabase persistence
   - Student Profile with avatar upload to Supabase Storage, education/skills/interests editing, and history
   - Dashboard with compact icon sidebar, top bar, KPI cards, dual-bar statistics chart, recommended gigs/volunteering, skills progress, leaderboard/activity panel

4. **Batch 4 — Earn, Impact, Grow & Applications**
   - Earn micro-gig marketplace (search, category/pay/skill/deadline filters, sort, apply, withdraw)
   - Impact volunteering marketplace (filters, apply, hours/points tracking, badges)
   - Grow personal development (skills CRUD, proficiency levels, learning goals with target dates & progress bars, curated resources)
   - Unified Applications page (filter by status & type, view details, withdraw pending)
   - Modular rule-based recommendation engine (`src/utils/recommendations.js`)

5. **Batch 5 — Settings, Demo Seed Data & UX Polish**
   - Settings (account, theme toggle, password update, notification & privacy preferences, logout)
   - `supabase/seed.sql` with clearly labeled demo opportunities & achievements
   - Loading skeletons, empty states, form validation, toast notifications

6. **Batch 6 — Documentation, Vercel Config & Verification**
   - Comprehensive `README.md`, `.env.example`, `vercel.json`, `.gitignore`
   - `npm install`, `npm run build`, lint/route/smoke verification
