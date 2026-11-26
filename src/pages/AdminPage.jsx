import { useCallback, useEffect, useState } from 'react'
import {
  CheckCircle2,
  ClipboardList,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import EmptyState from '../components/common/EmptyState'
import { CardSkeleton } from '../components/common/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  assignTaskToStudent,
  createOpportunity,
  deleteOpportunity,
  listAllApplicationsForAdmin,
  listAllOpportunitiesForAdmin,
  listStudentsForAdmin,
  updateApplicationStatus,
  updateOpportunityStatus,
  verifyAndCompleteApplication,
} from '../services/bloomupService'
import { formatCurrency, formatDate } from '../utils/formatters'

export default function AdminPage() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [opportunities, setOpportunities] = useState([])
  const [students, setStudents] = useState([])
  const [applications, setApplications] = useState([])

  // Create Task / Opportunity Form
  const [oppType, setOppType] = useState('earn')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Web Development')
  const [organization, setOrganization] = useState('BloomUp Partner')
  const [skillsText, setSkillsText] = useState('React, JavaScript')
  const [paymentAmount, setPaymentAmount] = useState('1500')
  const [impactPoints, setImpactPoints] = useState('100')
  const [durationHours, setDurationHours] = useState('4')
  const [workMode, setWorkMode] = useState('remote')
  const [location, setLocation] = useState('Remote')
  const [deadline, setDeadline] = useState('')
  const [creating, setCreating] = useState(false)

  // Direct Assign Form
  const [assignStudentId, setAssignStudentId] = useState('')
  const [assignOppId, setAssignOppId] = useState('')
  const [assignNote, setAssignNote] = useState('')
  const [assigning, setAssigning] = useState(false)

  const [busyAppId, setBusyAppId] = useState(null)

  const loadAdminData = useCallback(async () => {
    setLoading(true)
    try {
      const [oppsData, studentsData, appsData] = await Promise.all([
        listAllOpportunitiesForAdmin(),
        listStudentsForAdmin(),
        listAllApplicationsForAdmin(),
      ])
      setOpportunities(oppsData)
      setStudents(studentsData)
      setApplications(appsData)
      if (studentsData.length > 0 && !assignStudentId) {
        setAssignStudentId(studentsData[0].id)
      }
      const openOpps = oppsData.filter((o) => o.status === 'open')
      if (openOpps.length > 0 && !assignOppId) {
        setAssignOppId(openOpps[0].id)
      }
    } catch (err) {
      showToast(err.message || 'Failed to load admin workspace.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast, assignStudentId, assignOppId])

  useEffect(() => {
    loadAdminData()
  }, [loadAdminData])

  const handleCreateOpportunity = async (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      showToast('Title and description are required.', 'error')
      return
    }
    setCreating(true)
    try {
      const created = await createOpportunity({
        type: oppType,
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        organization: organization.trim() || 'BloomUp Partner',
        required_skills: skillsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        payment_amount: oppType === 'earn' ? Number(paymentAmount) || 0 : 0,
        currency: 'INR',
        impact_points: oppType === 'impact' ? Number(impactPoints) || 0 : 0,
        duration_hours: oppType === 'impact' ? Number(durationHours) || 1 : 0,
        work_mode: workMode,
        location: location.trim() || 'Remote',
        deadline: deadline ? new Date(deadline).toISOString() : null,
        status: 'open',
        is_demo: false,
        created_by: user.id,
      })
      setOpportunities((prev) => [created, ...prev])
      setTitle('')
      setDescription('')
      showToast('Task / Opportunity created!', 'success')
    } catch (err) {
      showToast(err.message || 'Could not create opportunity.', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleAssignTask = async (e) => {
    e.preventDefault()
    if (!assignStudentId || !assignOppId) {
      showToast('Select both a student and an open task.', 'error')
      return
    }
    const targetOpp = opportunities.find((o) => o.id === assignOppId)
    setAssigning(true)
    try {
      const assigned = await assignTaskToStudent({
        studentId: assignStudentId,
        opportunityId: assignOppId,
        opportunityTitle: targetOpp?.title || 'Assigned Task',
        note: assignNote,
      })
      setApplications((prev) => [assigned, ...prev.filter((a) => a.id !== assigned.id)])
      setAssignNote('')
      showToast('Task assigned to student!', 'success')
    } catch (err) {
      showToast(err.message || 'Could not assign task.', 'error')
    } finally {
      setAssigning(false)
    }
  }

  const handleStatusChange = async (app, nextStatus) => {
    setBusyAppId(app.id)
    try {
      const updated = await updateApplicationStatus(app.id, nextStatus)
      setApplications((prev) => prev.map((a) => (a.id === app.id ? updated : a)))
      showToast(`Application marked as ${nextStatus}.`, 'info')
    } catch (err) {
      showToast(err.message || 'Status update failed.', 'error')
    } finally {
      setBusyAppId(null)
    }
  }

  const handleVerifyComplete = async (app) => {
    setBusyAppId(app.id)
    try {
      await verifyAndCompleteApplication(app.id)
      await loadAdminData()
      showToast(
        app.opportunity?.type === 'earn'
          ? `Verified! Credited ${formatCurrency(app.opportunity.payment_amount)} (virtual tracked reward) to student.`
          : `Verified! Credited +${app.opportunity?.impact_points || 0} impact pts to student.`,
        'success'
      )
    } catch (err) {
      showToast(err.message || 'Verification failed.', 'error')
    } finally {
      setBusyAppId(null)
    }
  }

  const handleToggleOppStatus = async (opp) => {
    const next = opp.status === 'open' ? 'closed' : 'open'
    try {
      const updated = await updateOpportunityStatus(opp.id, next)
      setOpportunities((prev) => prev.map((o) => (o.id === opp.id ? updated : o)))
      showToast(`Opportunity ${next}.`, 'info')
    } catch (err) {
      showToast(err.message || 'Could not update opportunity.', 'error')
    }
  }

  const handleDeleteOpp = async (opp) => {
    try {
      await deleteOpportunity(opp.id)
      setOpportunities((prev) => prev.filter((o) => o.id !== opp.id))
      setApplications((prev) => prev.filter((a) => a.opportunity_id !== opp.id))
      showToast('Opportunity deleted.', 'info')
    } catch (err) {
      showToast(err.message || 'Could not delete opportunity.', 'error')
    }
  }

  const openOpportunities = opportunities.filter((o) => o.status === 'open')

  return (
    <AppLayout
      title="Admin Console — Task & Reward Manager"
      subtitle="Create tasks, assign them to students, and verify completion to credit virtual earnings & impact points"
    >
      {/* Top Info Banner */}
      <div
        className="bu-card"
        style={{
          padding: 16,
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={20} color="#84C233" />
          <span style={{ fontSize: '0.92rem', fontWeight: 700 }}>
            Admin Mode Active — Virtual rewards (`₹` &amp; Impact Points) are credited only when you click{' '}
            <em>Verify &amp; Complete</em>.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Badge tone="green">{students.length} Students</Badge>
          <Badge tone="yellow">{openOpportunities.length} Open Tasks</Badge>
          <Badge tone="orange">{applications.length} Applications / Assignments</Badge>
        </div>
      </div>

      {/* Create Task + Direct Assign Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Create Opportunity / Task */}
        <form className="bu-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }} onSubmit={handleCreateOpportunity}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} color="#84C233" />
            <h2 style={{ fontSize: '1.08rem' }}>Create New Task / Opportunity</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="bu-field">
              <label className="bu-label" htmlFor="adm-type">Pillar</label>
              <select id="adm-type" className="bu-select" value={oppType} onChange={(e) => setOppType(e.target.value)}>
                <option value="earn">Earn (Paid Micro-Gig)</option>
                <option value="impact">Impact (Volunteering)</option>
              </select>
            </div>
            <div className="bu-field">
              <label className="bu-label" htmlFor="adm-cat">Category</label>
              <input id="adm-cat" className="bu-input" value={category} onChange={(e) => setCategory(e.target.value)} required />
            </div>
          </div>

          <div className="bu-field">
            <label className="bu-label" htmlFor="adm-title">Task Title *</label>
            <input
              id="adm-title"
              className="bu-input"
              placeholder="e.g., Build Responsive Event Card Component"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="bu-field">
            <label className="bu-label" htmlFor="adm-desc">Description *</label>
            <textarea
              id="adm-desc"
              rows={2}
              className="bu-textarea"
              placeholder="Clear deliverable instructions for the student..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="bu-field">
              <label className="bu-label" htmlFor="adm-org">Organization</label>
              <input id="adm-org" className="bu-input" value={organization} onChange={(e) => setOrganization(e.target.value)} />
            </div>
            <div className="bu-field">
              <label className="bu-label" htmlFor="adm-skills">Required Skills (comma-separated)</label>
              <input id="adm-skills" className="bu-input" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
            </div>
          </div>

          {oppType === 'earn' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="bu-field">
                <label className="bu-label" htmlFor="adm-pay">Virtual Reward (INR ₹)</label>
                <input
                  id="adm-pay"
                  type="number"
                  min="0"
                  className="bu-input"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div className="bu-field">
                <label className="bu-label" htmlFor="adm-deadline">Deadline</label>
                <input id="adm-deadline" type="date" className="bu-input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div className="bu-field">
                <label className="bu-label" htmlFor="adm-pts">Impact Points</label>
                <input id="adm-pts" type="number" min="0" className="bu-input" value={impactPoints} onChange={(e) => setImpactPoints(e.target.value)} />
              </div>
              <div className="bu-field">
                <label className="bu-label" htmlFor="adm-hrs">Hours</label>
                <input id="adm-hrs" type="number" min="0.5" step="0.5" className="bu-input" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} />
              </div>
              <div className="bu-field">
                <label className="bu-label" htmlFor="adm-mode">Mode</label>
                <select id="adm-mode" className="bu-select" value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
                  <option value="remote">Remote</option>
                  <option value="in-person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          )}

          <div className="bu-field">
            <label className="bu-label" htmlFor="adm-loc">Location</label>
            <input id="adm-loc" className="bu-input" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <Button type="submit" loading={creating}>
            <Plus size={16} /> Publish Task
          </Button>
        </form>

        {/* Direct Task Assignment + Student Balances */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <form className="bu-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }} onSubmit={handleAssignTask}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserCheck size={18} color="#F7931E" />
              <h2 style={{ fontSize: '1.08rem' }}>Assign Task Directly to Student</h2>
            </div>

            <div className="bu-field">
              <label className="bu-label" htmlFor="assign-student">Select Student</label>
              <select
                id="assign-student"
                className="bu-select"
                value={assignStudentId}
                onChange={(e) => setAssignStudentId(e.target.value)}
              >
                {students.length === 0 ? (
                  <option value="">No student accounts found</option>
                ) : (
                  students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.full_name || st.email} ({st.email})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="bu-field">
              <label className="bu-label" htmlFor="assign-opp">Select Open Task</label>
              <select
                id="assign-opp"
                className="bu-select"
                value={assignOppId}
                onChange={(e) => setAssignOppId(e.target.value)}
              >
                {openOpportunities.length === 0 ? (
                  <option value="">No open tasks available</option>
                ) : (
                  openOpportunities.map((op) => (
                    <option key={op.id} value={op.id}>
                      [{op.type.toUpperCase()}] {op.title} (
                      {op.type === 'earn'
                        ? formatCurrency(op.payment_amount, op.currency)
                        : `+${op.impact_points} pts`}
                      )
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="bu-field">
              <label className="bu-label" htmlFor="assign-note">Assignment Note</label>
              <input
                id="assign-note"
                className="bu-input"
                placeholder="Instructions or milestone note..."
                value={assignNote}
                onChange={(e) => setAssignNote(e.target.value)}
              />
            </div>

            <Button type="submit" loading={assigning} disabled={students.length === 0 || openOpportunities.length === 0}>
              Assign Task to Student
            </Button>
          </form>

          {/* Student Virtual Earnings Overview */}
          <div className="bu-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Users size={18} color="#84C233" />
              <h2 style={{ fontSize: '1.05rem' }}>Student Progress &amp; Virtual Balances</h2>
            </div>
            {students.length === 0 ? (
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>No students registered yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {students.map((st) => (
                  <div
                    key={st.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                      paddingBottom: 8,
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: '0.88rem',
                    }}
                  >
                    <div>
                      <strong>{st.full_name || 'Student'}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{st.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Badge tone="green">{formatCurrency(st.verified_earnings || 0)}</Badge>
                      <Badge tone="orange">{st.impact_points || 0} pts</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applications & Assigned Tasks Verification Queue */}
      <div className="bu-card" style={{ padding: 22, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <ClipboardList size={19} color="#84C233" />
          <h2 style={{ fontSize: '1.1rem' }}>Student Applications &amp; Assigned Tasks</h2>
        </div>

        {loading ? (
          <CardSkeleton />
        ) : applications.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No applications or assignments yet"
            description="Assign a task above or wait for students to apply to open opportunities."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {applications.map((app) => {
              const isEarn = app.opportunity?.type === 'earn'
              const isBusy = busyAppId === app.id
              return (
                <div
                  key={app.id}
                  style={{
                    padding: 16,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-alt)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong>{app.opportunity?.title || 'Task'}</strong>
                      <Badge tone={isEarn ? 'green' : 'orange'}>
                        {isEarn
                          ? formatCurrency(app.opportunity?.payment_amount, app.opportunity?.currency)
                          : `+${app.opportunity?.impact_points || 0} pts`}
                      </Badge>
                      <Badge tone={app.status === 'completed' ? 'green' : app.status === 'accepted' ? 'yellow' : app.status === 'rejected' ? 'red' : 'brown'}>
                        {app.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      Student: <strong>{app.student?.full_name || app.student?.email}</strong> ({app.student?.email}) •{' '}
                      {formatDate(app.created_at)}
                    </div>
                    {app.message && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Note: &ldquo;{app.message}&rdquo;
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {app.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={isBusy}
                          onClick={() => handleStatusChange(app, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={isBusy}
                          onClick={() => handleStatusChange(app, 'rejected')}
                        >
                          <XCircle size={14} /> Reject
                        </Button>
                      </>
                    )}
                    {(app.status === 'pending' || app.status === 'accepted') && (
                      <Button
                        size="sm"
                        variant="primary"
                        loading={isBusy}
                        onClick={() => handleVerifyComplete(app)}
                      >
                        <CheckCircle2 size={14} /> Verify &amp; Complete
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Manage Opportunities List */}
      <div className="bu-card" style={{ padding: 22 }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 14 }}>All Tasks &amp; Opportunities ({opportunities.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                paddingBottom: 10,
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <strong>{opp.title}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {opp.type.toUpperCase()} • {opp.category} • {opp.organization} •{' '}
                  {opp.type === 'earn'
                    ? formatCurrency(opp.payment_amount, opp.currency)
                    : `+${opp.impact_points} pts`}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge tone={opp.status === 'open' ? 'green' : 'brown'}>{opp.status.toUpperCase()}</Badge>
                <Button size="sm" variant="secondary" onClick={() => handleToggleOppStatus(opp)}>
                  {opp.status === 'open' ? 'Close' : 'Reopen'}
                </Button>
                <button
                  type="button"
                  onClick={() => handleDeleteOpp(opp)}
                  aria-label={`Delete ${opp.title}`}
                  style={{ background: 'none', border: 'none', color: '#d9483b', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
