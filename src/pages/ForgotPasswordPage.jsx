import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Button from '../components/common/Button'
import ConfigBanner from '../components/common/ConfigBanner'
import { useAuth } from '../context/AuthContext'
import './AuthPages.css'

export default function ForgotPasswordPage() {
  const { resetPasswordForEmail, isConfigured } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      await resetPasswordForEmail(email.trim())
      setSuccess('Password reset instructions have been sent to your email.')
    } catch (err) {
      setError(err.message || 'Could not send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: 'var(--bg-canvas)',
      }}
    >
      <div className="bu-card auth-card bu-fade-up">
        <Link
          to="/login"
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
          <ArrowLeft size={16} /> Back to Log In
        </Link>

        <h1 style={{ fontSize: '1.55rem', marginBottom: 8 }}>Reset your password</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 20 }}>
          Enter your account email and we&apos;ll send you a secure reset link.
        </p>

        {!isConfigured && <ConfigBanner />}
        {error && <div className="auth-alert auth-alert-error">{error}</div>}
        {success && <div className="auth-alert auth-alert-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="bu-field">
            <label className="bu-label" htmlFor="reset-email">Email Address</label>
            <input
              id="reset-email"
              type="email"
              className="bu-input"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading} disabled={!isConfigured}>
            Send Reset Link
          </Button>
        </form>
      </div>
    </div>
  )
}
