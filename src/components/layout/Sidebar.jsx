// src/components/layout/Sidebar.jsx
// ─────────────────────────────────────────────────────────────
// The left sidebar. It holds the BloomUp logo, four navigation
// items, a theme toggle, and a user avatar at the bottom.
//
// Props:
//   activePage  — string: 'dashboard' | 'earn' | 'impact' | 'grow'
//   onNavigate  — function: called with the page name when a nav
//                 item is clicked
// ─────────────────────────────────────────────────────────────

import { useTheme } from '../../context/ThemeContext'
import './Sidebar.css'

// ─── Inline SVG icons ────────────────────────────────────────
// Self-contained SVGs — no icon library needed.
// Each is 20×20, uses currentColor so they inherit the CSS
// colour of their parent element automatically.

// ─── Design rules for all four nav icons ─────────────────────
// • 20 × 20 px, viewBox="0 0 20 20"
// • stroke="currentColor", fill="none"
// • strokeWidth="1.6" on every path
// • strokeLinecap="round", strokeLinejoin="round" throughout
// • No fill shapes — pure outline style
// ─────────────────────────────────────────────────────────────

function IconDashboard() {
  // Four-square grid: two rows of two rounded rectangles
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.5"
        stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.5"
        stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.5"
        stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.5"
        stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconEarn() {
  // Briefcase: rectangular body with a top handle arch
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      {/* Briefcase body */}
      <rect x="2.5" y="7" width="15" height="10" rx="1.75"
        stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"/>
      {/* Handle */}
      <path d="M7 7V5.5A1.5 1.5 0 0 1 8.5 4h3A1.5 1.5 0 0 1 13 5.5V7"
        stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"/>
      {/* Centre divider line */}
      <path d="M2.5 12h15"
        stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round"/>
    </svg>
  )
}

function IconImpact() {
  // Heart with two small hands cupped beneath it
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      {/* Heart */}
      <path d="M10 15.5C10 15.5 3 11 3 6.5A3.5 3.5 0 0 1 10 5a3.5 3.5 0 0 1 7 1.5C17 11 10 15.5 10 15.5z"
        stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconGrow() {
  // Sprout: a vertical stem with one left leaf and one right leaf
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      {/* Stem */}
      <path d="M10 17V9"
        stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"/>
      {/* Left leaf curving out from the stem */}
      <path d="M10 13C10 13 10 9 6 8c0 4 3 5.5 4 5z"
        stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"/>
      {/* Right leaf curving out from the stem */}
      <path d="M10 10C10 10 10 6 14 5c0 4-3 5.5-4 5z"
        stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M11.89 4.11l-1.06 1.06M4.11 11.89 3.05 12.95" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function IconMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M13.5 10A6 6 0 0 1 6 2.5a6 6 0 1 0 7.5 7.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Navigation items ─────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: IconDashboard },
  { id: 'earn',      label: 'Earn',      Icon: IconEarn      },
  { id: 'impact',    label: 'Impact',    Icon: IconImpact    },
  { id: 'grow',      label: 'Grow',      Icon: IconGrow      },
]

// ─── Component ────────────────────────────────────────────────
export default function Sidebar({ activePage = 'dashboard', onNavigate }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  function handleNav(pageId) {
    if (onNavigate) onNavigate(pageId)
  }

  return (
    <aside className="sidebar" aria-label="Main navigation">

      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="sidebar__logo" aria-label="BloomUp">
        {/* Leaf mark — simple SVG brandmark */}
        <svg
          className="sidebar__logo-mark"
          width="28" height="28" viewBox="0 0 28 28"
          fill="none" aria-hidden="true"
        >
          <rect width="28" height="28" rx="8" fill="var(--brand-green)"/>
          <path
            d="M14 22V11M14 11C14 11 11 7 7 6c0 4.5 3 7.5 7 5zM14 15C14 15 17 11 21 10c0 4.5-3 7.5-7 5z"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
        <span className="sidebar__logo-text">BloomUp</span>
      </div>

      {/* ── Nav items ─────────────────────────────────────── */}
      <nav className="sidebar__nav" aria-label="Pages">
        <ul className="sidebar__nav-list" role="list">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = activePage === id
            return (
              <li key={id}>
                <button
                  className={`sidebar__nav-item${isActive ? ' sidebar__nav-item--active' : ''}`}
                  onClick={() => handleNav(id)}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                  title={label}
                >
                  <span className="sidebar__nav-icon">
                    <Icon />
                  </span>
                  {/* Label visible only when sidebar is expanded on larger screens */}
                  <span className="sidebar__nav-label">{label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* ── Bottom controls ───────────────────────────────── */}
      <div className="sidebar__bottom">
        {/* Theme toggle */}
        <button
          className="sidebar__theme-toggle"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <IconSun /> : <IconMoon />}
        </button>

        {/* User avatar — placeholder for now */}
        <button
          className="sidebar__avatar"
          aria-label="Your account"
          title="Your account"
        >
          <span aria-hidden="true">S</span>
        </button>
      </div>

    </aside>
  )
}
