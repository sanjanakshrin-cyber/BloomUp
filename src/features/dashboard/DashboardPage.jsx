// src/features/dashboard/DashboardPage.jsx
// ─────────────────────────────────────────────────────────────
// The Dashboard page content. This is a placeholder that
// confirms the shell is working. In the next step it will
// be filled with stat cards, charts, and leaderboard panels.
//
// No props needed — this component manages its own content.
// ─────────────────────────────────────────────────────────────

import './DashboardPage.css'

export default function DashboardPage() {
  return (
    <div className="dashboard-page">

      {/* Placeholder message — guides the next build step */}
      <div className="dashboard-placeholder">

        {/* Nature-inspired SVG illustration */}
        <svg
          className="dashboard-placeholder__illustration"
          width="80" height="80"
          viewBox="0 0 80 80"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="40" cy="40" r="38" fill="var(--color-progress-track)" />
          {/* Stem */}
          <path
            d="M40 65V35"
            stroke="var(--brand-green)" strokeWidth="3" strokeLinecap="round"
          />
          {/* Left leaf */}
          <path
            d="M40 42C40 42 32 36 24 36c0 8 6 13 16 10z"
            fill="var(--brand-green)" opacity="0.85"
          />
          {/* Right leaf */}
          <path
            d="M40 50C40 50 48 44 56 44c0 8-6 13-16 10z"
            fill="var(--brand-green)"
          />
          {/* Top bud */}
          <circle cx="40" cy="31" r="5" fill="var(--brand-yellow)" />
        </svg>

        <h2 className="dashboard-placeholder__title">
          Shell is ready
        </h2>
        <p className="dashboard-placeholder__body">
          The layout is working. Sidebar, topbar, and content area
          are all in place. Next step: stat cards, charts, and the
          leaderboard panel.
        </p>

        {/* Three zone indicators showing what comes next */}
        <div className="dashboard-placeholder__zones">
          <div className="dashboard-placeholder__zone">
            <span className="dashboard-placeholder__zone-dot dashboard-placeholder__zone-dot--green" />
            Earn — micro-jobs
          </div>
          <div className="dashboard-placeholder__zone">
            <span className="dashboard-placeholder__zone-dot dashboard-placeholder__zone-dot--yellow" />
            Impact — volunteering
          </div>
          <div className="dashboard-placeholder__zone">
            <span className="dashboard-placeholder__zone-dot dashboard-placeholder__zone-dot--orange" />
            Grow — AI insights
          </div>
        </div>

      </div>

    </div>
  )
}
