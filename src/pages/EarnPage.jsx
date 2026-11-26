import { useCallback, useEffect, useMemo, useState } from 'react'
import { Briefcase, Search } from 'lucide-react'
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
  withdrawApplication,
} from '../services/bloomupService'
import { scoreOpportunity } from '../utils/recommendations'
import { formatCurrency } from '../utils/formatters'

export default function EarnPage() {
  const { user, profile } = useAuth()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [gigs, setGigs] = useState([])
  const [applications, setApplications] = useState([])
  const [skills, setSkills] = useState([])

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [minPay, setMinPay] = useState('0')
  const [skillFilter, setSkillFilter] = useState('')
  const [sortBy, setSortBy] = useState('recommended')

  const [selectedOpp, setSelectedOpp] = useState(null)
  const [withdrawTarget, setWithdrawTarget] = useState(null)
  const [withdrawing, setWithdrawing] = useState(false)

  const loadData = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const [opps, apps, studentSkills] = await Promise.all([
        listOpportunities('earn'),
        listMyApplications(user.id),
        listStudentSkills(user.id),
      ])
      setGigs(opps)
      setApplications(apps)
      setSkills(studentSkills)
    } catch (err) {
      showToast(err.message || 'Failed to load micro-gigs.', 'error')
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
    () => ['All', ...Array.from(new Set(gigs.map((g) => g.category)))],
    [gigs]
  )

  const filteredGigs = useMemo(() => {
    const scored = gigs.map((g) => scoreOpportunity(g, profile, skills))
    return scored
      .filter((g) => {
        if (category !== 'All' && g.category !== category) return false
        if (Number(g.payment_amount) < Number(minPay)) return false
        if (
          skillFilter.trim() &&
          !(g.required_skills || []).some((s) =>
            s.toLowerCase().includes(skillFilter.trim().toLowerCase())
          )
        ) {
          return false
        }
        if (search.trim()) {
          const q = search.toLowerCase()
          const hay = `${g.title} ${g.description} ${g.organization} ${g.category}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'pay_desc') return Number(b.payment_amount) - Number(a.payment_amount)
        if (sortBy === 'deadline_asc') {
          return new Date(a.deadline || '2099-01-01') - new Date(b.deadline || '2099-01-01')
        }
        return b.matchScore - a.matchScore
      })
  }, [gigs, profile, skills, category, minPay, skillFilter, search, sortBy])

  const handleApply = async (opp, message) => {
    try {
      const created = await applyToOpportunity({
        studentId: user.id,
        opportunityId: opp.id,
        message,
        opportunityTitle: opp.title,
      })
      setApplications((prev) => [created, ...prev.filter((a) => a.opportunity_id !== opp.id)])
      showToast('Application submitted!', 'success')
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
        opportunityTitle: withdrawTarget.opportunity?.title || 'Opportunity',
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
      title="Earn — Paid Micro-Gigs"
      subtitle="Turn your skills into verified experience and rewards"
    >
      {/* Earnings Summary Banner */}
      <div
        className="bu-card"
        style={{
          padding: 18,
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div>
          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            Your Verified Earnings
          </span>
          <div style={{ fontSize: '1.45rem', fontWeight: 800 }}>
            {formatCurrency(profile?.verified_earnings || 0)}
          </div>
        </div>
        <Badge tone="green">
          Rewards are credited only after verified gig completion
        </Badge>
      </div>

      {/* Filters */}
      <div
        className="bu-card"
        style={{
          padding: 16,
          marginBottom: 22,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
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
            placeholder="Search gigs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="bu-select" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
          ))}
        </select>

        <select className="bu-select" value={minPay} onChange={(e) => setMinPay(e.target.value)}>
          <option value="0">Any Pay</option>
          <option value="2000">₹2,000+</option>
          <option value="3000">₹3,000+</option>
          <option value="5000">₹5,000+</option>
        </select>

        <input
          className="bu-input"
          placeholder="Filter by skill (e.g. React)"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
        />

        <select className="bu-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="recommended">Sort: Recommended</option>
          <option value="pay_desc">Sort: Highest Pay</option>
          <option value="deadline_asc">Sort: Earliest Deadline</option>
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredGigs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No matching micro-gigs"
          description="Try clearing your filters or search terms to see more opportunities."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
          {filteredGigs.map((opp) => (
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
        description={`Are you sure you want to withdraw your pending application for "${withdrawTarget?.opportunity?.title || 'this gig'}"?`}
        confirmLabel="Withdraw"
      />
    </AppLayout>
  )
}
