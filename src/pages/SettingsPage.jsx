import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Lock, LogOut, Moon, Shield, Sun } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/common/Button'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { updateProfile } from '../services/bloomupService'

export default function SettingsPage() {
  const { user, profile, updatePassword, signOut, refreshProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingPass, setUpdatingPass] = useState(false)

  const [notifPrefs, setNotifPrefs] = useState(
    profile?.notification_prefs || {
      email_updates: true,
      opportunity_alerts: true,
      goal_reminders: true,
    }
  )

  const [privacyPrefs, setPrivacyPrefs] = useState(
    profile?.privacy_prefs || {
      show_on_leaderboard: true,
      profile_visibility: 'students',
    }
  )

  const [savingPrefs, setSavingPrefs] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters.', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error')
      return
    }
    setUpdatingPass(true)
    try {
      await updatePassword(newPassword)
      setNewPassword('')
      setConfirmPassword('')
      showToast('Password updated successfully!', 'success')
    } catch (err) {
      showToast(err.message || 'Could not update password.', 'error')
    } finally {
      setUpdatingPass(false)
    }
  }

  const savePreferences = async () => {
    if (!user) return
    setSavingPrefs(true)
    try {
      await updateProfile(user.id, {
        notification_prefs: notifPrefs,
        privacy_prefs: privacyPrefs,
      })
      await refreshProfile()
      showToast('Preferences saved!', 'success')
    } catch (err) {
      showToast(err.message || 'Could not save preferences.', 'error')
    } finally {
      setSavingPrefs(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      showToast('Logged out.', 'info')
      navigate('/')
    } catch (err) {
      showToast(err.message || 'Logout failed.', 'error')
    }
  }

  return (
    <AppLayout title="Settings" subtitle="Manage your account, appearance, notifications, and privacy">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22 }}>
        {/* Account & Appearance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="bu-card" style={{ padding: 22 }}>
            <h2 style={{ fontSize: '1.08rem', marginBottom: 12 }}>Account Details</h2>
            <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div><strong>Name:</strong> {profile?.full_name || 'Student'}</div>
              <div><strong>Email:</strong> {profile?.email || user?.email}</div>
              <div><strong>Role:</strong> {profile?.role || 'student'}</div>
            </div>
          </div>

          <div className="bu-card" style={{ padding: 22 }}>
            <h2 style={{ fontSize: '1.08rem', marginBottom: 12 }}>Theme Preference</h2>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                variant={theme === 'light' ? 'primary' : 'secondary'}
                onClick={() => setTheme('light')}
                style={{ flex: 1 }}
              >
                <Sun size={16} /> Light Sage
              </Button>
              <Button
                variant={theme === 'dark' ? 'primary' : 'secondary'}
                onClick={() => setTheme('dark')}
                style={{ flex: 1 }}
              >
                <Moon size={16} /> Forest Dark
              </Button>
            </div>
          </div>

          <form className="bu-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }} onSubmit={handlePasswordChange}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={18} color="#84C233" />
              <h2 style={{ fontSize: '1.08rem' }}>Password Management</h2>
            </div>
            <div className="bu-field">
              <label className="bu-label" htmlFor="set-new-pass">New Password</label>
              <input
                id="set-new-pass"
                type="password"
                className="bu-input"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="bu-field">
              <label className="bu-label" htmlFor="set-conf-pass">Confirm Password</label>
              <input
                id="set-conf-pass"
                type="password"
                className="bu-input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" loading={updatingPass}>Update Password</Button>
          </form>
        </div>

        {/* Notifications, Privacy & Session */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="bu-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={18} color="#F7931E" />
              <h2 style={{ fontSize: '1.08rem' }}>Notification Preferences</h2>
            </div>
            {[
              { key: 'email_updates', label: 'Email updates about application status' },
              { key: 'opportunity_alerts', label: 'New matching Earn & Impact alerts' },
              { key: 'goal_reminders', label: 'Learning goal deadline reminders' },
            ].map((item) => (
              <label
                key={item.key}
                style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.92rem', cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(notifPrefs[item.key])}
                  onChange={(e) =>
                    setNotifPrefs((prev) => ({ ...prev, [item.key]: e.target.checked }))
                  }
                />
                <span>{item.label}</span>
              </label>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <Shield size={18} color="#84C233" />
              <h2 style={{ fontSize: '1.08rem' }}>Privacy Settings</h2>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.92rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(privacyPrefs.show_on_leaderboard)}
                onChange={(e) =>
                  setPrivacyPrefs((prev) => ({ ...prev, show_on_leaderboard: e.target.checked }))
                }
              />
              <span>Allow my verified impact score on campus leaderboards</span>
            </label>

            <div className="bu-field">
              <label className="bu-label" htmlFor="priv-vis">Profile Visibility</label>
              <select
                id="priv-vis"
                className="bu-select"
                value={privacyPrefs.profile_visibility || 'students'}
                onChange={(e) =>
                  setPrivacyPrefs((prev) => ({ ...prev, profile_visibility: e.target.value }))
                }
              >
                <option value="students">Verified Organizations &amp; Students</option>
                <option value="orgs_only">Organizations Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <Button onClick={savePreferences} loading={savingPrefs}>
              Save Preferences
            </Button>
          </div>

          <div className="bu-card" style={{ padding: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem' }}>Sign Out</h2>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                Log out of your current BloomUp session.
              </p>
            </div>
            <Button variant="danger" onClick={handleLogout}>
              <LogOut size={16} /> Log Out
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
