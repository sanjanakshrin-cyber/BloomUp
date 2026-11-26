import { useCallback, useEffect, useState } from 'react'
import { BookOpen, CheckCircle2, Plus, Sprout, Target, Trash2 } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import EmptyState from '../components/common/EmptyState'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  createLearningGoal,
  deleteLearningGoal,
  deleteStudentSkill,
  listLearningGoals,
  listSkillsCatalog,
  listStudentSkills,
  updateLearningGoal,
  upsertStudentSkill,
} from '../services/bloomupService'
import { formatDate } from '../utils/formatters'

const LEARNING_RESOURCES = [
  {
    title: 'React Official Documentation',
    topic: 'Frontend Engineering',
    url: 'https://react.dev/learn',
  },
  {
    title: 'MDN Web Docs — Modern JavaScript',
    topic: 'Web Development',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
  },
  {
    title: 'Figma Learn — UI/UX Design Basics',
    topic: 'Design & Prototyping',
    url: 'https://help.figma.com/hc/en-us',
  },
  {
    title: 'PostgreSQL & SQL Fundamentals',
    topic: 'Data & Backend',
    url: 'https://www.postgresql.org/docs/current/tutorial.html',
  },
]

export default function GrowPage() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [skills, setSkills] = useState([])
  const [catalog, setCatalog] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  // Skill form
  const [skillName, setSkillName] = useState('')
  const [skillCat, setSkillCat] = useState('technical')
  const [skillProf, setSkillProf] = useState('beginner')
  const [savingSkill, setSavingSkill] = useState(false)

  // Goal form
  const [goalTitle, setGoalTitle] = useState('')
  const [goalDesc, setGoalDesc] = useState('')
  const [goalTag, setGoalTag] = useState('')
  const [goalDate, setGoalDate] = useState('')
  const [savingGoal, setSavingGoal] = useState(false)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const [s, c, g] = await Promise.all([
        listStudentSkills(user.id),
        listSkillsCatalog(),
        listLearningGoals(user.id),
      ])
      setSkills(s)
      setCatalog(c)
      setGoals(g)
    } catch (err) {
      showToast(err.message || 'Failed to load Grow workspace.', 'error')
    } finally {
      setLoading(false)
    }
  }, [user?.id, showToast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!skillName.trim()) return
    setSavingSkill(true)
    try {
      const saved = await upsertStudentSkill({
        studentId: user.id,
        skillName: skillName.trim(),
        category: skillCat,
        proficiency: skillProf,
      })
      setSkills((prev) => [saved, ...prev.filter((item) => item.skill_name !== saved.skill_name)])
      setSkillName('')
      showToast('Skill saved!', 'success')
    } catch (err) {
      showToast(err.message || 'Could not save skill.', 'error')
    } finally {
      setSavingSkill(false)
    }
  }

  const handleProficiencyChange = async (skill, proficiency) => {
    try {
      const updated = await upsertStudentSkill({
        studentId: user.id,
        skillName: skill.skill_name,
        category: skill.category,
        proficiency,
      })
      setSkills((prev) => prev.map((s) => (s.id === skill.id ? updated : s)))
      showToast(`Updated ${skill.skill_name} to ${proficiency}.`, 'success')
    } catch (err) {
      showToast(err.message || 'Could not update skill.', 'error')
    }
  }

  const handleDeleteSkill = async (skill) => {
    try {
      await deleteStudentSkill(skill.id, user.id)
      setSkills((prev) => prev.filter((s) => s.id !== skill.id))
      showToast('Skill removed.', 'info')
    } catch (err) {
      showToast(err.message || 'Could not remove skill.', 'error')
    }
  }

  const handleCreateGoal = async (e) => {
    e.preventDefault()
    if (!goalTitle.trim()) return
    setSavingGoal(true)
    try {
      const created = await createLearningGoal({
        studentId: user.id,
        title: goalTitle,
        description: goalDesc,
        skillTag: goalTag,
        targetDate: goalDate,
      })
      setGoals((prev) => [created, ...prev])
      setGoalTitle('')
      setGoalDesc('')
      setGoalTag('')
      setGoalDate('')
      showToast('Learning goal created!', 'success')
    } catch (err) {
      showToast(err.message || 'Could not create goal.', 'error')
    } finally {
      setSavingGoal(false)
    }
  }

  const handleProgressUpdate = async (goal, nextProgress) => {
    const clamped = Math.max(0, Math.min(100, Number(nextProgress)))
    const status = clamped === 100 ? 'completed' : 'in_progress'
    try {
      const updated = await updateLearningGoal(goal.id, user.id, { progress: clamped, status })
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? updated : g)))
      if (clamped === 100) showToast(`Goal "${goal.title}" completed!`, 'success')
    } catch (err) {
      showToast(err.message || 'Could not update progress.', 'error')
    }
  }

  const handleDeleteGoal = async (goal) => {
    try {
      await deleteLearningGoal(goal.id, user.id)
      setGoals((prev) => prev.filter((g) => g.id !== goal.id))
      showToast('Goal deleted.', 'info')
    } catch (err) {
      showToast(err.message || 'Could not delete goal.', 'error')
    }
  }

  const existingNames = new Set(skills.map((s) => s.skill_name.toLowerCase()))
  const recommendedSkills = catalog.filter((c) => !existingNames.has(c.name.toLowerCase())).slice(0, 6)

  return (
    <AppLayout title="Grow — Skills & Learning Goals" subtitle="Track your capabilities and personal milestones">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 22 }}>
        {/* Left: Skills Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="bu-card" style={{ padding: 22 }}>
            <h2 style={{ fontSize: '1.12rem', marginBottom: 14 }}>Your Skills ({skills.length})</h2>
            <form onSubmit={handleAddSkill} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              <input
                className="bu-input"
                placeholder="Add a skill (e.g., React, Figma, Writing)"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
                <select className="bu-select" value={skillCat} onChange={(e) => setSkillCat(e.target.value)}>
                  <option value="technical">Technical</option>
                  <option value="non-technical">Non-Technical</option>
                </select>
                <select className="bu-select" value={skillProf} onChange={(e) => setSkillProf(e.target.value)}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <Button type="submit" loading={savingSkill}>
                  <Plus size={16} /> Add
                </Button>
              </div>
            </form>

            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading skills...</p>
            ) : skills.length === 0 ? (
              <EmptyState
                icon={Sprout}
                title="No skills added yet"
                description="Add your current skills or pick from the recommended catalog below."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {skills.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      padding: 12,
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-alt)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.94rem' }}>{s.skill_name}</strong>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{s.category}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <select
                        aria-label={`Proficiency for ${s.skill_name}`}
                        className="bu-select"
                        style={{ padding: '6px 10px', fontSize: '0.82rem', width: 'auto' }}
                        value={s.proficiency}
                        onChange={(e) => handleProficiencyChange(s, e.target.value)}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(s)}
                        aria-label={`Remove ${s.skill_name}`}
                        style={{ background: 'none', border: 'none', color: '#d9483b', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {recommendedSkills.length > 0 && (
            <div className="bu-card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: 10 }}>Recommended Skills to Add</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {recommendedSkills.map((c) => (
                  <Button
                    key={c.id}
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSkillName(c.name)
                      setSkillCat(c.category)
                    }}
                  >
                    + {c.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="bu-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <BookOpen size={18} color="#84C233" />
              <h3 style={{ fontSize: '1rem' }}>Curated Learning Resources</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LEARNING_RESOURCES.map((res) => (
                <a
                  key={res.url}
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: 12,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-alt)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{res.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{res.topic}</div>
                  </div>
                  <Badge tone="green">Open &rarr;</Badge>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Learning Goals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="bu-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Target size={19} color="#F7931E" />
              <h2 style={{ fontSize: '1.12rem' }}>Learning Goals ({goals.length})</h2>
            </div>

            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <input
                className="bu-input"
                placeholder="Goal title (e.g., Build 2 React micro-projects)"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                required
              />
              <textarea
                rows={2}
                className="bu-textarea"
                placeholder="Notes or milestones..."
                value={goalDesc}
                onChange={(e) => setGoalDesc(e.target.value)}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input
                  className="bu-input"
                  placeholder="Skill tag (optional)"
                  value={goalTag}
                  onChange={(e) => setGoalTag(e.target.value)}
                />
                <input
                  type="date"
                  className="bu-input"
                  aria-label="Target date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                />
              </div>
              <Button type="submit" loading={savingGoal}>
                <Plus size={16} /> Create Learning Goal
              </Button>
            </form>

            {goals.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No learning goals yet"
                description="Set a measurable skill goal with a target date to track your progress."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {goals.map((g) => (
                  <div
                    key={g.id}
                    style={{
                      padding: 16,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-alt)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <strong style={{ fontSize: '0.98rem' }}>{g.title}</strong>
                        {g.description && (
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                            {g.description}
                          </p>
                        )}
                      </div>
                      <Badge tone={g.status === 'completed' ? 'green' : 'yellow'}>
                        {g.status === 'completed' ? 'Completed' : `${g.progress}%`}
                      </Badge>
                    </div>

                    <div
                      style={{
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: 'var(--border-subtle)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${g.progress}%`,
                          height: '100%',
                          backgroundColor: 'var(--brand-green)',
                          transition: 'width 200ms ease',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Target: {formatDate(g.target_date)} {g.skill_tag ? `• ${g.skill_tag}` : ''}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="10"
                          aria-label={`Progress for ${g.title}`}
                          value={g.progress}
                          onChange={(e) => handleProgressUpdate(g, e.target.value)}
                        />
                        {g.status !== 'completed' && (
                          <Button size="sm" variant="secondary" onClick={() => handleProgressUpdate(g, 100)}>
                            <CheckCircle2 size={14} /> Complete
                          </Button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteGoal(g)}
                          aria-label={`Delete ${g.title}`}
                          style={{ background: 'none', border: 'none', color: '#d9483b', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
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
