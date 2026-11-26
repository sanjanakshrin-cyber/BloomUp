import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Button from '../components/common/Button'
import ConfigBanner from '../components/common/ConfigBanner'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './AuthPages.css'

export default function ResetPasswordPage() {
  const { updatePassword, isConfigured } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await updatePassword(password)
      showToast('Password updated successfully!', 'success')
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Unable to update password. Please request a new reset link.')
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
        <h1 style={{ fontSize: '1.55rem', marginBottom: 8 }}>Choose a new password</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 20 }}>
          Enter your new password below to regain access to your BloomUp account.
        </p>

        {!isConfigured && <ConfigBanner />}
        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="bu-field">
            <label className="bu-label" htmlFor="new-password">New Password</label>
            <div className="auth-password-wrap">
              <input
                id="new-password"
                type={show ? 'text' : 'password'}
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
                onClick={() => setShow((prev) => !prev)}
                aria-label="Toggle password visibility"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="bu-field">
            <label className="bu-label" htmlFor="confirm-new-password">Confirm Password</label>
            <input
              id="confirm-new-password"
              type={show ? 'text' : 'password'}
              className="bu-input"
              placeholder="Re-enter new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading} disabled={!isConfigured}>
            Update Password
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: '0.9rem' }}>
          <Link to="/login" style={{ color: 'var(--brand-green)', fontWeight: 700 }}>
            Return to Log In
          </Link>
        </p>
      </div>
    </div>
  )
}
