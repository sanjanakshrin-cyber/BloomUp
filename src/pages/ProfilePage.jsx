import { useEffect, useState } from 'react'
import { Award, Briefcase, HeartHandshake, Save, Upload } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  listAchievements,
  listLearningGoals,
  listMyApplications,
  listStudentSkills,
  listVolunteeringRecords,
  updateProfile,
  uploadAvatar,
} from '../services/bloomupService'
import { formatCurrency, formatDate } from '../utils/formatters'

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const { showToast } = useToast()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [location, setLocation] = useState(profile?.location || '')
  const [college, setCollege] = useState(profile?.college || '')
  const [course, setCourse] = useState(profile?.course || '')
  const [academicYear, setAcademicYear] = useState(profile?.academic_year || '2nd Year')
  const [careerGoals, setCareerGoals] = useState(profile?.career_goals || '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [skills, setSkills] = useState([])
  const [goals, setGoals] = useState([])
  const [completedApps, setCompletedApps] = useState([])
  const [volRecords, setVolRecords] = useState([])
  const [earnedBadges, setEarnedBadges] = useState([])

  useEffect(() => {
    if (!profile) return
    setFullName(profile.full_name || '')
    setLocation(profile.location || '')
    setCollege(profile.college || '')
    setCourse(profile.course || '')
    setAcademicYear(profile.academic_year || '2nd Year')
    setCareerGoals(profile.career_goals || '')
  }, [profile])

  useEffect(() => {
    if (!user?.id) return
    Promise.all([
      listStudentSkills(user.id),
      listLearningGoals(user.id),
      listMyApplications(user.id),
      listVolunteeringRecords(user.id),
      listAchievements(user.id),
    ])
      .then(([s, g, apps, vol, ach]) => {
        setSkills(s)
        setGoals(g)
        setCompletedApps(apps.filter((a) => a.status === 'completed'))
        setVolRecords(vol)
        setEarnedBadges(ach.earned)
      })
      .catch((err) => console.error(err.message))
  }, [user?.id])

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const url = await uploadAvatar(user.id, file)
      await updateProfile(user.id, { avatar_url: url })
      await refreshProfile()
      showToast('Profile picture updated!', 'success')
    } catch (err) {
      showToast(err.message || 'Could not upload avatar.', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await updateProfile(user.id, {
        full_name: fullName.trim(),
        location: location.trim(),
        college: college.trim(),
        course: course.trim(),
        academic_year: academicYear,
        career_goals: careerGoals.trim(),
      })
      await refreshProfile()
      showToast('Profile updated!', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to save profile.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout title="My Profile" subtitle="Manage your student identity, education, and verified history">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22 }}>
        {/* Left: Editable Profile Form */}
        <form className="bu-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={handleSave}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundColor: 'var(--bg-badge-green)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.4rem',
                color: '#5c8f1d',
              }}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (fullName || 'S')[0].toUpperCase()
              )}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{profile?.full_name || 'Student'}</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 8 }}>{profile?.email}</div>
              <label style={{ cursor: 'pointer' }}>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
                <span className="bu-btn bu-btn-secondary bu-btn-sm">
                  <Upload size={14} /> {uploading ? 'Uploading...' : 'Change Photo'}
                </span>
              </label>
            </div>
          </div>

          <div className="bu-field">
            <label className="bu-label" htmlFor="pf-name">Full Name</label>
            <input id="pf-name" className="bu-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="bu-field">
            <label className="bu-label" htmlFor="pf-loc">Location</label>
            <input id="pf-loc" className="bu-input" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <div className="bu-field">
            <label className="bu-label" htmlFor="pf-college">College / University</label>
            <input id="pf-college" className="bu-input" value={college} onChange={(e) => setCollege(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="bu-field">
              <label className="bu-label" htmlFor="pf-course">Course</label>
              <input id="pf-course" className="bu-input" value={course} onChange={(e) => setCourse(e.target.value)} />
            </div>
            <div className="bu-field">
              <label className="bu-label" htmlFor="pf-year">Academic Year</label>
              <select id="pf-year" className="bu-select" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
                <option>Postgraduate</option>
              </select>
            </div>
          </div>

          <div className="bu-field">
            <label className="bu-label" htmlFor="pf-goals">Career Goals</label>
            <textarea id="pf-goals" rows={2} className="bu-textarea" value={careerGoals} onChange={(e) => setCareerGoals(e.target.value)} />
          </div>

          <Button type="submit" loading={saving}>
            <Save size={16} /> Save Profile Changes
          </Button>
        </form>

        {/* Right: Skills, Goals, Badges, Verified History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="bu-card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Verified Summary</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <Badge tone="green">
                <Briefcase size={13} /> {formatCurrency(profile?.verified_earnings || 0)} Earned
              </Badge>
              <Badge tone="orange">
                <HeartHandshake size={13} /> {profile?.impact_points || 0} Impact Points
              </Badge>
              <Badge tone="yellow">
                <Award size={13} /> {Number(profile?.volunteering_hours || 0)} Volunteering Hrs
              </Badge>
            </div>
          </div>

          <div className="bu-card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: 10 }}>Skills ({skills.length})</h2>
            {skills.length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No skills added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {skills.map((s) => (
                  <Badge key={s.id} tone="green">{s.skill_name} • {s.proficiency}</Badge>
                ))}
              </div>
            )}
          </div>

          <div className="bu-card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: 10 }}>Learning Goals ({goals.length})</h2>
            {goals.length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No learning goals created yet.</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {goals.map((g) => (
                  <li key={g.id} style={{ marginBottom: 6 }}>
                    <strong>{g.title}</strong> — {g.progress}% ({g.status === 'completed' ? 'Completed' : 'In Progress'})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bu-card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: 10 }}>
              Verified History &amp; Badges ({earnedBadges.length})
            </h2>
            {completedApps.length === 0 && volRecords.length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Completed gigs and verified volunteering records will appear here.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.88rem' }}>
                {completedApps.map((app) => (
                  <div key={app.id}>
                    <strong>{app.opportunity?.title}</strong> • Verified on {formatDate(app.verified_at)}
                  </div>
                ))}
                {volRecords.map((rec) => (
                  <div key={rec.id}>
                    <strong>{rec.opportunity?.title || 'Volunteering'}</strong> • {rec.hours_logged} hrs (+{rec.points_awarded} pts)
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
