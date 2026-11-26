import { useCallback, useEffect, useMemo, useState } from 'react'
import { HeartHandshake, Search } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import EmptyState from '../components/common/EmptyState'
import { CardSkeleton } from '../components/common/Skeleton'
import OpportunityCard from '../components/opportunities/OpportunityCard'
import OpportunityDetailModal from '../components/opportunities/OpportunityDetailModal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Badge from '../components/common/Badge'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  applyToOpportunity,
  listMyApplications,
  listOpportunities,
  listStudentSkills,
  listVolunteeringRecords,
  withdrawApplication,
} from '../services/bloomupService'
import { scoreOpportunity } from '../utils/recommendations'
import { formatDate } from '../utils/formatters'

export default function ImpactPage() {
  const { user, profile } = useAuth()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [opportunities, setOpportunities] = useState([])
  const [applications, setApplications] = useState([])
  const [skills, setSkills] = useState([])
  const [records, setRecords] = useState([])

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [workMode, setWorkMode] = useState('All')

  const [selectedOpp, setSelectedOpp] = useState(null)
  const [withdrawTarget, setWithdrawTarget] = useState(null)
  const [withdrawing, setWithdrawing] = useState(false)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const [opps, apps, studentSkills, volRecords] = await Promise.all([
        listOpportunities('impact'),
        listMyApplications(user.id),
        listStudentSkills(user.id),
        listVolunteeringRecords(user.id),
      ])
      setOpportunities(opps)
      setApplications(apps)
      setSkills(studentSkills)
      setRecords(volRecords)
    } catch (err) {
      showToast(err.message || 'Failed to load volunteering drives.', 'error')
    } finally {
      setLoading(false)
    }
  }, [user?.id, showToast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const appByOppId = useMemo(() => {
    const map = new Map()
    applications.forEach((a) => map.set(a.opportunity_id, a))
    return map
  }, [applications])

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(opportunities.map((o) => o.category)))],
    [opportunities]
  )

  const filtered = useMemo(() => {
    return opportunities
      .map((o) => scoreOpportunity(o, profile, skills))
      .filter((o) => {
        if (category !== 'All' && o.category !== category) return false
        if (workMode !== 'All' && o.work_mode !== workMode) return false
        if (search.trim()) {
          const q = search.toLowerCase()
          const hay = `${o.title} ${o.description} ${o.organization} ${o.location}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => b.matchScore - a.matchScore)
  }, [opportunities, profile, skills, category, workMode, search])

  const handleApply = async (opp, message) => {
    try {
      const created = await applyToOpportunity({
        studentId: user.id,
        opportunityId: opp.id,
        message,
        opportunityTitle: opp.title,
      })
      setApplications((prev) => [created, ...prev.filter((a) => a.opportunity_id !== opp.id)])
      showToast('Volunteering application submitted!', 'success')
    } catch (err) {
      showToast(err.message || 'Could not submit application.', 'error')
      throw err
    }
  }

  const confirmWithdraw = async () => {
    if (!withdrawTarget) return
    setWithdrawing(true)
    try {
      const updated = await withdrawApplication({
        applicationId: withdrawTarget.id,
        studentId: user.id,
        opportunityTitle: withdrawTarget.opportunity?.title || 'Volunteering',
      })
      setApplications((prev) =>
        prev.map((a) => (a.id === updated.id ? { ...a, status: 'withdrawn' } : a))
      )
      showToast('Application withdrawn.', 'info')
      setWithdrawTarget(null)
    } catch (err) {
      showToast(err.message || 'Could not withdraw application.', 'error')
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <AppLayout
      title="Impact — Community & Volunteering"
      subtitle="Contribute to meaningful causes and track verified hours"
    >
      {/* Impact Summary */}
      <div
        className="bu-card"
        style={{
          padding: 18,
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              Verified Hours
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {Number(profile?.volunteering_hours || 0)} hrs
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              Impact Points
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-orange)' }}>
              {profile?.impact_points || 0} pts
            </div>
          </div>
        </div>
        <Badge tone="orange">
          Hours &amp; points are awarded only after organizer verification
        </Badge>
      </div>

      {/* Filters */}
      <div
        className="bu-card"
        style={{
          padding: 16,
          marginBottom: 22,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
        }}
      >
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            className="bu-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search causes or cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="bu-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>{c === 'All' ? 'All Causes' : c}</option>
          ))}
        </select>

        <select className="bu-select" value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
          <option value="All">Remote &amp; In-Person</option>
          <option value="in-person">In-Person</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      {/* Opportunities Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="No volunteering drives match your filters"
          description="Adjust your cause or location filter to explore more community opportunities."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
          {filtered.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              application={appByOppId.get(opp.id)}
              onView={setSelectedOpp}
              onApply={setSelectedOpp}
              onWithdraw={setWithdrawTarget}
            />
          ))}
        </div>
      )}

      {/* Contribution History */}
      <div className="bu-card" style={{ padding: 22, marginTop: 26 }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Verified Contribution History</h2>
        {records.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Once you complete a volunteering opportunity and an organizer verifies it, your hours and
            impact points will appear here.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {records.map((rec) => (
              <div
                key={rec.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingBottom: 10,
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '0.9rem',
                }}
              >
                <div>
                  <strong>{rec.opportunity?.title || 'Community Drive'}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {rec.opportunity?.organization} • Verified {formatDate(rec.verified_at)}
                  </div>
                </div>
                <Badge tone="orange">
                  {rec.hours_logged} hrs • +{rec.points_awarded} pts
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <OpportunityDetailModal
        opportunity={selectedOpp}
        application={selectedOpp ? appByOppId.get(selectedOpp.id) : null}
        isOpen={Boolean(selectedOpp)}
        onClose={() => setSelectedOpp(null)}
        onSubmitApplication={handleApply}
      />

      <ConfirmDialog
        isOpen={Boolean(withdrawTarget)}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={confirmWithdraw}
        loading={withdrawing}
        title="Withdraw Application"
        description={`Withdraw your pending volunteering application for "${withdrawTarget?.opportunity?.title || 'this drive'}"?`}
        confirmLabel="Withdraw"
      />
    </AppLayout>
  )
}
