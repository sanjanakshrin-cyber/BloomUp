import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Logo from '../components/common/Logo'
import Button from '../components/common/Button'
import ConfigBanner from '../components/common/ConfigBanner'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

export default function SignupPage() {
  const { signUp, signInWithGoogle, isConfigured } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const data = await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      })
      if (data?.session) {
        setSuccess('Account created! Redirecting to onboarding...')
      } else {
        setSuccess(
          'Account created! Please check your email inbox to verify your address before logging in.'
        )
      }
    } catch (err) {
      setError(err.message || 'Unable to create account.')
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
          <h2>Start your student growth journey today.</h2>
          <p>
            Join a community of learners building real-world skills through micro-gigs,
            volunteering, and structured personal goals.
          </p>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#9ab79e' }}>
          Earn + Impact + Grow — all in one student platform.
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

          <h1 style={{ fontSize: '1.65rem', marginBottom: 6 }}>Create your student account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem', marginBottom: 22 }}>
            Set up your profile in minutes and unlock Earn, Impact, and Grow.
          </p>

          {!isConfigured && <ConfigBanner />}
          {error && <div className="auth-alert auth-alert-error">{error}</div>}
          {success && <div className="auth-alert auth-alert-success">{success}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="bu-field">
              <label className="bu-label" htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                className="bu-input"
                placeholder="e.g., Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="bu-field">
              <label className="bu-label" htmlFor="signup-email">Email Address</label>
              <input
                id="signup-email"
                type="email"
                className="bu-input"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="bu-field">
              <label className="bu-label" htmlFor="signup-password">Password</label>
              <div className="auth-password-wrap">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  className="bu-input"
                  placeholder="At least 8 characters"
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

            <div className="bu-field">
              <label className="bu-label" htmlFor="signup-confirm">Confirm Password</label>
              <input
                id="signup-confirm"
                type={showPassword ? 'text' : 'password'}
                className="bu-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" fullWidth size="lg" loading={submitting} disabled={!isConfigured}>
              Create Account
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
            Sign up with Google
          </Button>

          <p
            style={{
              textAlign: 'center',
              marginTop: 22,
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
            }}
          >
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--brand-green)', fontWeight: 800 }}>
              Log In
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
