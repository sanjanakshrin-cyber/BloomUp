import { useCallback, useEffect, useMemo, useState } from 'react'
import { FileCheck2 } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Modal from '../components/common/Modal'
import { CardSkeleton } from '../components/common/Skeleton'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { listMyApplications, withdrawApplication } from '../services/bloomupService'
import { formatCurrency, formatDate } from '../utils/formatters'

export default function ApplicationsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [detailApp, setDetailApp] = useState(null)
  const [withdrawTarget, setWithdrawTarget] = useState(null)
  const [withdrawing, setWithdrawing] = useState(false)

  const loadApps = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const data = await listMyApplications(user.id)
      setApplications(data)
    } catch (err) {
      showToast(err.message || 'Failed to load applications.', 'error')
    } finally {
      setLoading(false)
    }
  }, [user?.id, showToast])

  useEffect(() => {
    loadApps()
  }, [loadApps])

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      if (typeFilter !== 'all' && a.opportunity?.type !== typeFilter) return false
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      return true
    })
  }, [applications, typeFilter, statusFilter])

  const statusTone = {
    pending: 'yellow',
    accepted: 'green',
    completed: 'green',
    rejected: 'red',
    withdrawn: 'brown',
  }

  const handleWithdraw = async () => {
    if (!withdrawTarget) return
    setWithdrawing(true)
    try {
      await withdrawApplication({
        applicationId: withdrawTarget.id,
        studentId: user.id,
        opportunityTitle: withdrawTarget.opportunity?.title || 'Opportunity',
      })
      setApplications((prev) =>
        prev.map((a) => (a.id === withdrawTarget.id ? { ...a, status: 'withdrawn' } : a))
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
      title="My Applications"
      subtitle="Unified tracker for all your Earn micro-gigs and Impact volunteering applications"
    >
      <div
        className="bu-card"
        style={{
          padding: 16,
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <select
          aria-label="Filter by category"
          className="bu-select"
          style={{ maxWidth: 220 }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Pillars (Earn &amp; Impact)</option>
          <option value="earn">Earn (Micro-Gigs)</option>
          <option value="impact">Impact (Volunteering)</option>
        </select>

        <select
          aria-label="Filter by status"
          className="bu-select"
          style={{ maxWidth: 220 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No applications found"
          description="Apply to micro-gigs in Earn or volunteering drives in Impact to track them here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((app) => {
            const opp = app.opportunity
            const isEarn = opp?.type === 'earn'
            return (
              <div
                key={app.id}
                className="bu-card"
                style={{
                  padding: 18,
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '1.02rem' }}>{opp?.title || 'Opportunity'}</strong>
                    <Badge tone={isEarn ? 'green' : 'orange'}>
                      {isEarn ? 'Earn' : 'Impact'} • {opp?.category}
                    </Badge>
                    <Badge tone={statusTone[app.status] || 'brown'}>
                      {app.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    {opp?.organization} • Applied on {formatDate(app.created_at)} •{' '}
                    {isEarn
                      ? `Reward: ${formatCurrency(opp?.payment_amount, opp?.currency)}`
                      : `Impact: +${opp?.impact_points || 0} pts (${opp?.duration_hours || 0} hrs)`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="sm" variant="secondary" onClick={() => setDetailApp(app)}>
                    View Details
                  </Button>
                  {app.status === 'pending' && (
                    <Button size="sm" variant="ghost" onClick={() => setWithdrawTarget(app)}>
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={Boolean(detailApp)}
        onClose={() => setDetailApp(null)}
        title={detailApp?.opportunity?.title || 'Application Details'}
      >
        {detailApp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.93rem' }}>
            <div>
              <strong>Status:</strong>{' '}
              <Badge tone={statusTone[detailApp.status] || 'brown'}>
                {detailApp.status.toUpperCase()}
              </Badge>
            </div>
            <div>
              <strong>Organization:</strong> {detailApp.opportunity?.organization}
            </div>
            <div>
              <strong>Applied Date:</strong> {formatDate(detailApp.created_at)}
            </div>
            <div>
              <strong>Your Application Message:</strong>
              <p
                style={{
                  marginTop: 6,
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-alt)',
                  color: 'var(--text-secondary)',
                }}
              >
                {detailApp.message || 'No message provided.'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(withdrawTarget)}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={handleWithdraw}
        loading={withdrawing}
        title="Withdraw Application"
        description={`Withdraw your pending application for "${withdrawTarget?.opportunity?.title}"?`}
        confirmLabel="Withdraw"
      />
    </AppLayout>
  )
}
