// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Root application component.
// Manages which page is active and renders the shell layout
// with the correct page inside it.
//
// As you add Earn, Impact, and Grow pages, import them here
// and add them to the PAGE_TITLES map.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import DashboardLayout from './components/layout/DashboardLayout'
import DashboardPage   from './features/dashboard/DashboardPage'
import './App.css'

// Maps page id → heading shown in the Topbar
const PAGE_TITLES = {
  dashboard: 'Dashboard',
  earn:      'Earn',
  impact:    'Impact',
  grow:      'Grow',
}

export default function App() {
  // Track which nav item is selected
  const [activePage, setActivePage] = useState('dashboard')

  // Pick the right page component to render
  // (Earn, Impact, Grow pages will slot in here later)
  function renderPage() {
    switch (activePage) {
      case 'earn':    return <DashboardPage /> // placeholder until EarnPage is built
      case 'impact':  return <DashboardPage /> // placeholder until ImpactPage is built
      case 'grow':    return <DashboardPage /> // placeholder until GrowPage is built
      default:        return <DashboardPage />
    }
  }

  return (
    <DashboardLayout
      activePage={activePage}
      onNavigate={setActivePage}
      pageTitle={PAGE_TITLES[activePage]}
    >
      {renderPage()}
    </DashboardLayout>
  )
}
