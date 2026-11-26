import { useState } from 'react'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import Modal from '../common/Modal'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatCurrency, formatDate } from '../../utils/formatters'

export default function OpportunityDetailModal({
  opportunity,
  application,
  isOpen,
  onClose,
  onSubmitApplication,
}) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!opportunity) return null

  const isEarn = opportunity.type === 'earn'
  const alreadyApplied = Boolean(application && application.status !== 'withdrawn')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setSubmitting(true)
    try {
      await onSubmitApplication(opportunity, message.trim())
      setMessage('')
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={opportunity.title} maxWidth={600}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <Badge tone={isEarn ? 'green' : 'orange'}>{opportunity.category}</Badge>
          <Badge tone="brown">{opportunity.work_mode}</Badge>
          {opportunity.is_demo && <Badge tone="yellow">Demo Opportunity</Badge>}
        </div>

        <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
          Organization: <span style={{ color: 'var(--text-primary)' }}>{opportunity.organization}</span>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.65 }}>
          {opportunity.description}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
            padding: 14,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-alt)',
            fontSize: '0.88rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={16} color="#84C233" /> {opportunity.location}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} color="#F7931E" /> Deadline: {formatDate(opportunity.deadline)}
          </div>
          {isEarn ? (
            <div style={{ fontWeight: 800, color: 'var(--brand-green)' }}>
              Reward: {formatCurrency(opportunity.payment_amount, opportunity.currency)}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} color="#84C233" /> {opportunity.duration_hours} hrs
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={16} color="#F6C827" /> {opportunity.available_slots} slots • +{opportunity.impact_points} pts
              </div>
            </>
          )}
        </div>

        <div>
          <div className="bu-label" style={{ marginBottom: 6 }}>Required Skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(opportunity.required_skills || []).map((skill) => (
              <Badge key={skill} tone="green">{skill}</Badge>
            ))}
          </div>
        </div>

        {alreadyApplied ? (
          <div
            style={{
              padding: 14,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-badge-green)',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            Application Status: <span style={{ textTransform: 'uppercase' }}>{application.status}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="bu-field">
              <label className="bu-label" htmlFor="app-msg">Why are you a great fit? *</label>
              <textarea
                id="app-msg"
                rows={3}
                className="bu-textarea"
                placeholder="Briefly share your relevant skills, coursework, or motivation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <Button type="submit" fullWidth loading={submitting}>
              Submit Application
            </Button>
          </form>
        )}
      </div>
    </Modal>
  )
}
