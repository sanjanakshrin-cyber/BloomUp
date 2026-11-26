import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Plus, Trash2, Upload } from 'lucide-react'
import Logo from '../components/common/Logo'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { updateProfile, uploadAvatar, upsertStudentSkill, logActivity } from '../services/bloomupService'

const STEPS = ['Personal', 'Education', 'Skills', 'Interests', 'Goals']

const GIG_CATEGORIES = [
  'Web Development',
  'Graphic Design',
  'Social Media',
  'Content Writing',
  'Tutoring',
  'Data Entry & Analysis',
  'Research',
]

const VOLUNTEER_CATEGORIES = [
  'Environment',
  'Education',
  'Community Awareness',
  'Food Security',
  'Educational Support',
]

const LEARNING_INTERESTS = [
  'Frontend Engineering',
  'UI/UX & Product Design',
  'Data Science',
  'Public Speaking',
  'Technical Writing',
  'Leadership & Volunteering',
]

export default function OnboardingPage() {
  const { user, profile, refreshProfile } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Step 1: Personal
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [location, setLocation] = useState(profile?.location || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')

  // Step 2: Education
  const [college, setCollege] = useState(profile?.college || '')
  const [course, setCourse] = useState(profile?.course || '')
  const [academicYear, setAcademicYear] = useState(profile?.academic_year || '2nd Year')

  // Step 3: Skills
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [skillCategory, setSkillCategory] = useState('technical')
  const [skillProficiency, setSkillProficiency] = useState('intermediate')

  // Step 4: Interests
  const [gigCats, setGigCats] = useState(profile?.preferred_gig_categories || [])
  const [volCats, setVolCats] = useState(profile?.preferred_volunteering_categories || [])
  const [learnInterests, setLearnInterests] = useState(profile?.learning_interests || [])

  // Step 5: Goals
  const [careerGoals, setCareerGoals] = useState(profile?.career_goals || '')
  const [learningGoalsSummary, setLearningGoalsSummary] = useState(
    profile?.learning_goals_summary || ''
  )
  const [personalDevGoals, setPersonalDevGoals] = useState(profile?.personal_dev_goals || '')

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingAvatar(true)
    try {
      const publicUrl = await uploadAvatar(user.id, file)
      setAvatarUrl(publicUrl)
      showToast('Profile picture uploaded!', 'success')
    } catch (err) {
      showToast(err.message || 'Avatar upload failed.', 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const addSkill = () => {
    const trimmed = skillInput.trim()
    if (!trimmed) return
    if (skills.some((s) => s.skillName.toLowerCase() === trimmed.toLowerCase())) {
      showToast('Skill already added.', 'info')
      return
    }
    setSkills((prev) => [
      ...prev,
      { skillName: trimmed, category: skillCategory, proficiency: skillProficiency },
    ])
    setSkillInput('')
  }

  const toggleItem = (list, setList, value) => {
    setList(list.includes(value) ? list.filter((i) => i !== value) : [...list, value])
  }

  const validateStep = () => {
    if (step === 0 && (!fullName.trim() || !location.trim())) {
      showToast('Please enter your full name and location.', 'error')
      return false
    }
    if (step === 1 && (!college.trim() || !course.trim())) {
      showToast('Please enter your college/university and course.', 'error')
      return false
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const handleComplete = async () => {
    if (!user) return
    setSaving(true)
    try {
      await updateProfile(user.id, {
        full_name: fullName.trim(),
        location: location.trim(),
        avatar_url: avatarUrl,
        college: college.trim(),
        course: course.trim(),
        academic_year: academicYear,
        preferred_gig_categories: gigCats,
        preferred_volunteering_categories: volCats,
        learning_interests: learnInterests,
        career_goals: careerGoals.trim(),
        learning_goals_summary: learningGoalsSummary.trim(),
        personal_dev_goals: personalDevGoals.trim(),
        onboarding_completed: true,
      })

      for (const s of skills) {
        await upsertStudentSkill({
          studentId: user.id,
          skillName: s.skillName,
          category: s.category,
          proficiency: s.proficiency,
        })
      }

      await logActivity(user.id, 'onboarding_completed', 'Completed BloomUp student onboarding')
      await refreshProfile()
      showToast('Welcome to BloomUp! Your profile is ready.', 'success')
      navigate('/dashboard')
    } catch (err) {
      showToast(err.message || 'Could not save onboarding details.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const progressPct = Math.round(((step + 1) / STEPS.length) * 100)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-canvas)', padding: '32px 16px' }}>
      <div style={{ maxWidth: 700, marginInline: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Logo />
          <Badge tone="green">
            Step {step + 1} of {STEPS.length} • {STEPS[step]}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: 8,
            borderRadius: 999,
            backgroundColor: 'var(--border-subtle)',
            overflow: 'hidden',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              backgroundColor: 'var(--brand-green)',
              transition: 'width 240ms ease',
            }}
          />
        </div>

        <div className="bu-card bu-fade-up" style={{ padding: 32 }}>
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h1 style={{ fontSize: '1.5rem' }}>Tell us about yourself</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem' }}>
                  Let&apos;s personalize your BloomUp student profile.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 18,
                    backgroundColor: 'var(--bg-badge-green)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#5c8f1d',
                  }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    (fullName || 'B')[0].toUpperCase()
                  )}
                </div>
                <label style={{ cursor: 'pointer' }}>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                  <span className="bu-btn bu-btn-secondary bu-btn-sm">
                    <Upload size={15} /> {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                  </span>
                </label>
              </div>

              <div className="bu-field">
                <label className="bu-label" htmlFor="ob-name">Full Name *</label>
                <input
                  id="ob-name"
                  className="bu-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Rahul Sharma"
                />
              </div>

              <div className="bu-field">
                <label className="bu-label" htmlFor="ob-loc">City / Location *</label>
                <input
                  id="ob-loc"
                  className="bu-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Pune, India"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h1 style={{ fontSize: '1.5rem' }}>Your education</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem' }}>
                  Helps us surface relevant campus and remote opportunities.
                </p>
              </div>

              <div className="bu-field">
                <label className="bu-label" htmlFor="ob-college">College / University *</label>
                <input
                  id="ob-college"
                  className="bu-input"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g., Pune Institute of Technology"
                />
              </div>

              <div className="bu-field">
                <label className="bu-label" htmlFor="ob-course">Course / Major *</label>
                <input
                  id="ob-course"
                  className="bu-input"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g., B.Tech Computer Science"
                />
              </div>

              <div className="bu-field">
                <label className="bu-label" htmlFor="ob-year">Academic Year</label>
                <select
                  id="ob-year"
                  className="bu-select"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                  <option>Postgraduate</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h1 style={{ fontSize: '1.5rem' }}>Your skills</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem' }}>
                  Add technical and non-technical skills to power personalized recommendations.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: 8 }}>
                <input
                  className="bu-input"
                  placeholder="e.g., React, Figma, Writing"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSkill()
                    }
                  }}
                />
                <select
                  className="bu-select"
                  value={skillCategory}
                  onChange={(e) => setSkillCategory(e.target.value)}
                >
                  <option value="technical">Technical</option>
                  <option value="non-technical">Non-Technical</option>
                </select>
                <select
                  className="bu-select"
                  value={skillProficiency}
                  onChange={(e) => setSkillProficiency(e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <Button onClick={addSkill}>
                  <Plus size={16} /> Add
                </Button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {skills.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    No skills added yet—you can also add more later in Grow.
                  </p>
                ) : (
                  skills.map((s) => (
                    <span
                      key={s.skillName}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 12px',
                        borderRadius: 999,
                        backgroundColor: 'var(--bg-badge-green)',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                      }}
                    >
                      {s.skillName} ({s.proficiency})
                      <button
                        type="button"
                        onClick={() =>
                          setSkills((prev) => prev.filter((item) => item.skillName !== s.skillName))
                        }
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d9483b', padding: 0 }}
                        aria-label={`Remove ${s.skillName}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h1 style={{ fontSize: '1.5rem' }}>Your interests</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem' }}>
                  Choose the categories you&apos;d love to explore across Earn, Impact, and Grow.
                </p>
              </div>

              <div>
                <div className="bu-label" style={{ marginBottom: 8 }}>Preferred Micro-Gig Categories</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {GIG_CATEGORIES.map((cat) => {
                    const active = gigCats.includes(cat)
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleItem(gigCats, setGigCats, cat)}
                        className={`bu-btn bu-btn-sm ${active ? 'bu-btn-primary' : 'bu-btn-secondary'}`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="bu-label" style={{ marginBottom: 8 }}>Preferred Volunteering Causes</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {VOLUNTEER_CATEGORIES.map((cat) => {
                    const active = volCats.includes(cat)
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleItem(volCats, setVolCats, cat)}
                        className={`bu-btn bu-btn-sm ${active ? 'bu-btn-primary' : 'bu-btn-secondary'}`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="bu-label" style={{ marginBottom: 8 }}>Learning Interests</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {LEARNING_INTERESTS.map((item) => {
                    const active = learnInterests.includes(item)
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleItem(learnInterests, setLearnInterests, item)}
                        className={`bu-btn bu-btn-sm ${active ? 'bu-btn-primary' : 'bu-btn-secondary'}`}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h1 style={{ fontSize: '1.5rem' }}>Set your goals</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem' }}>
                  Define what success looks like for you this semester.
                </p>
              </div>

              <div className="bu-field">
                <label className="bu-label" htmlFor="ob-career">Career Goals</label>
                <textarea
                  id="ob-career"
                  rows={2}
                  className="bu-textarea"
                  placeholder="e.g., Land a summer product engineering internship"
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                />
              </div>

              <div className="bu-field">
                <label className="bu-label" htmlFor="ob-learn-goal">Learning Goals</label>
                <textarea
                  id="ob-learn-goal"
                  rows={2}
                  className="bu-textarea"
                  placeholder="e.g., Master React state management and build 3 portfolio projects"
                  value={learningGoalsSummary}
                  onChange={(e) => setLearningGoalsSummary(e.target.value)}
                />
              </div>

              <div className="bu-field">
                <label className="bu-label" htmlFor="ob-dev-goal">Personal Development Goals</label>
                <textarea
                  id="ob-dev-goal"
                  rows={2}
                  className="bu-textarea"
                  placeholder="e.g., Volunteer 20 hours in local education drives"
                  value={personalDevGoals}
                  onChange={(e) => setPersonalDevGoals(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 28,
              paddingTop: 20,
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <Button
              variant="secondary"
              onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
              disabled={step === 0 || saving}
            >
              <ArrowLeft size={16} /> Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button variant="primary" onClick={handleNext}>
                Next <ArrowRight size={16} />
              </Button>
            ) : (
              <Button variant="primary" onClick={handleComplete} loading={saving}>
                <CheckCircle2 size={16} /> Complete Setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
