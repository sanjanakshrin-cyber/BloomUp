// src/components/layout/Topbar.jsx
// ─────────────────────────────────────────────────────────────
// The horizontal bar at the top of the main content area.
// Shows the current page title on the left and a search field
// plus notification bell on the right.
//
// Props:
//   title  — string: the name of the current page
// ─────────────────────────────────────────────────────────────

import './Topbar.css'

// ─── Inline SVG icons ────────────────────────────────────────

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M9 2a5 5 0 0 0-5 5v2.5L2.5 11.5h13L14 9.5V7a5 5 0 0 0-5-5z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
      />
      <path d="M7.5 14a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────
export default function Topbar({ title = 'Dashboard' }) {
  return (
    <header className="topbar" role="banner">

      {/* Page title */}
      <div className="topbar__title">
        <h1 className="topbar__heading">{title}</h1>
        {/* Greeting — a warm touch without being generic */}
        <p className="topbar__sub">
          {greetingByHour()}
        </p>
      </div>

      {/* Right controls */}
      <div className="topbar__controls">

        {/* Search */}
        <div className="topbar__search" role="search">
          <span className="topbar__search-icon" aria-hidden="true">
            <IconSearch />
          </span>
          <input
            className="topbar__search-input"
            type="search"
            placeholder="Search…"
            aria-label="Search BloomUp"
          />
        </div>

        {/* Notification bell */}
        <button
          className="topbar__icon-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <IconBell />
          {/* Unread dot */}
          <span className="topbar__notif-dot" aria-hidden="true" />
        </button>

      </div>
    </header>
  )
}

// ─── Helper ───────────────────────────────────────────────────
// Returns a short greeting appropriate for the time of day.
function greetingByHour() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning — here\'s where you stand.'
  if (h < 17) return 'Good afternoon — keep the momentum going.'
  return 'Good evening — here\'s a summary of your day.'
}
