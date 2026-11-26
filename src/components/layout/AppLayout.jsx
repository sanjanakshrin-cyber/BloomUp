import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  FileCheck2,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sprout,
  Sun,
  User,
  X,
} from 'lucide-react'
import Logo from '../common/Logo'
import Badge from '../common/Badge'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'
import './AppLayout.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/earn', label: 'Earn', icon: Briefcase },
  { to: '/impact', label: 'Impact', icon: HeartHandshake },
  { to: '/grow', label: 'Grow', icon: Sprout },
  { to: '/applications', label: 'My Applications', icon: FileCheck2 },
  { to: '/profile', label: 'My Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function AppLayout({ title, subtitle, children }) {
  const { profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      showToast('Logged out successfully.', 'info')
      navigate('/')
    } catch (err) {
      showToast(err.message || 'Logout failed.', 'error')
    }
  }

  const initials = (profile?.full_name || 'S')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="app-shell">
      <div
        className={`app-drawer-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      <aside className={`app-sidebar ${drawerOpen ? 'open' : ''}`} aria-label="Sidebar navigation">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/dashboard" onClick={() => setDrawerOpen(false)}>
              <Logo size={32} />
            </Link>
            <button
              type="button"
              className="app-icon-pill app-mobile-btn"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="app-nav-list">
            {(profile?.role === 'admin' || profile?.role === 'organization') && (
              <NavLink
                to="/admin"
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) => `app-nav-item ${isActive ? 'active' : ''}`}
              >
                <ShieldCheck size={19} />
                <span>Admin Console</span>
              </NavLink>
            )}
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) => `app-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        <button type="button" className="app-nav-item" onClick={handleLogout}>
          <LogOut size={19} />
          <span>Log Out</span>
        </button>
      </aside>

      <div className="app-main-wrap">
        <header className="app-topbar">
          <div className="app-topbar-left">
            <button
              type="button"
              className="app-icon-pill app-mobile-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={19} />
            </button>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{subtitle}</p>
              )}
            </div>
          </div>

          <div className="app-topbar-actions">
            {(profile?.role === 'admin' || profile?.role === 'organization') && (
              <Badge tone="orange">ADMIN</Badge>
            )}
            <button
              type="button"
              className="app-icon-pill"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link to="/profile" className="app-avatar-btn" aria-label="My Profile">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Student'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initials
              )}
            </Link>
          </div>
        </header>

        <main className="app-content bu-fade-up">{children}</main>
      </div>
    </div>
  )
}
