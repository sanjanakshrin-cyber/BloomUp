import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Logo from '../components/common/Logo'
import Button from '../components/common/Button'
import ConfigBanner from '../components/common/ConfigBanner'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './AuthPages.css'

export default function LoginPage() {
  const { signIn, signInWithGoogle, isConfigured } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter both your email and password.')
      return
    }

    setSubmitting(true)
    try {
      await signIn({ email: email.trim(), password })
      showToast('Welcome back to BloomUp!', 'success')
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Unable to log in. Please check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Google sign-in failed.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <Logo size={36} showText={false} />
          <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#ffffff' }}>BloomUp</span>
        </Link>

        <div>
          <h2>Welcome back to your growth space.</h2>
          <p>
            Continue applying to paid micro-gigs, tracking your community volunteering hours, and
            completing your learning goals.
          </p>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#9ab79e' }}>
          Grow your skills. Earn your worth. Make an impact.
        </p>
      </aside>

      <main className="auth-main">
        <div className="bu-card auth-card bu-fade-up">
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.86rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginBottom: 20,
            }}
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <h1 style={{ fontSize: '1.65rem', marginBottom: 6 }}>Log in to BloomUp</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem', marginBottom: 22 }}>
            Sign in with your student email or Google account.
          </p>

          {!isConfigured && <ConfigBanner />}
          {error && <div className="auth-alert auth-alert-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="bu-field">
              <label className="bu-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="bu-input"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="bu-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="bu-label" htmlFor="login-password">Password</label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-green)' }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="auth-password-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="bu-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" loading={submitting} disabled={!isConfigured}>
              Log In
            </Button>
          </form>

          <div className="auth-divider">OR</div>

          <Button
            variant="outline"
            fullWidth
            size="md"
            onClick={handleGoogle}
            loading={googleLoading}
            disabled={!isConfigured}
          >
            Continue with Google
          </Button>

          <p
            style={{
              textAlign: 'center',
              marginTop: 22,
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
            }}
          >
            New to BloomUp?{' '}
            <Link to="/signup" style={{ color: 'var(--brand-green)', fontWeight: 800 }}>
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
