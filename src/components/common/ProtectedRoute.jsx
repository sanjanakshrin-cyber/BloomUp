import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Skeleton } from './Skeleton'

function FullPageLoader() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-canvas)',
        padding: 24,
      }}
    >
      <div className="bu-card" style={{ width: '100%', maxWidth: 420, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Skeleton width="55%" height={24} />
        <Skeleton width="100%" height={16} />
        <Skeleton width="80%" height={16} />
      </div>
    </div>
  )
}

export function ProtectedRoute({ children, requireOnboarding = true }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageLoader />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireOnboarding && profile && !profile.onboarding_completed && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  if (!requireOnboarding && profile?.onboarding_completed && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (profile && !['admin', 'organization'].includes(profile.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

export function GuestRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <FullPageLoader />

  if (user) {
    if (profile && ['admin', 'organization'].includes(profile.role)) {
      return <Navigate to="/admin" replace />
    }
    if (profile && !profile.onboarding_completed) {
      return <Navigate to="/onboarding" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return children
}
