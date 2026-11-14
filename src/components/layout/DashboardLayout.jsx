// src/components/layout/DashboardLayout.jsx
// ─────────────────────────────────────────────────────────────
// The dashboard shell. It assembles the full page layout:
//
//   [ Sidebar ] [ Topbar                            ]
//               [ Main content   ] [ Right panel   ]
//
// Props:
//   children       — the main page content (e.g. DashboardPage)
//   activePage     — string: passed down to Sidebar for active state
//   onNavigate     — function: called when a nav item is clicked
//   pageTitle      — string: passed to Topbar as the page heading
//   rightPanel     — React node: optional right panel content
//                    (leaderboard, activity feed — added later)
// ─────────────────────────────────────────────────────────────

import Sidebar from './Sidebar'
import Topbar  from './Topbar'
import './DashboardLayout.css'

export default function DashboardLayout({
  children,
  activePage  = 'dashboard',
  onNavigate,
  pageTitle   = 'Dashboard',
  rightPanel  = null,
}) {
  return (
    /*
     * .layout-page  — the full-screen sage green background
     * .layout-shell — the large white/dark-green rounded container
     */
    <div className="layout-page">
      <div className="layout-shell">

        {/* Left sidebar — fixed width, full height */}
        <Sidebar activePage={activePage} onNavigate={onNavigate} />

        {/* Right side — topbar + content row */}
        <div className="layout-body">

          {/* Topbar spans the full width of the body column */}
          <Topbar title={pageTitle} />

          {/* Content row: main area + optional right panel */}
          <div className="layout-content-row">

            {/* Main scrollable content area */}
            <main
              className="layout-main"
              id="main-content"
              aria-label="Main content"
              tabIndex={-1}  /* allows focus from skip-link */
            >
              {children}
            </main>

            {/* Right panel — hidden on mobile, reserved slot */}
            {rightPanel && (
              <aside
                className="layout-right-panel"
                aria-label="Leaderboard and activity"
              >
                {rightPanel}
              </aside>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
