import { Calendar, MapPin, Sparkles } from 'lucide-react'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatCurrency, formatDate } from '../../utils/formatters'

export default function OpportunityCard({
  opportunity,
  application,
  onView,
  onApply,
  onWithdraw,
}) {
  const isEarn = opportunity.type === 'earn'
  const statusTone = {
    pending: 'yellow',
    accepted: 'green',
    completed: 'green',
    rejected: 'red',
    withdrawn: 'brown',
  }

  return (
    <article
      className="bu-card bu-card-interactive"
      style={{
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <Badge tone={isEarn ? 'green' : 'orange'}>{opportunity.category}</Badge>
            {opportunity.is_demo && <Badge tone="brown">Demo</Badge>}
          </div>
          {isEarn ? (
            <strong style={{ color: 'var(--brand-green)', fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
              {formatCurrency(opportunity.payment_amount, opportunity.currency)}
            </strong>
          ) : (
            <Badge tone="orange">+{opportunity.impact_points} pts</Badge>
          )}
        </div>

        <h3 style={{ fontSize: '1.08rem' }}>{opportunity.title}</h3>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontWeight: 700 }}>
          {opportunity.organization}
        </p>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {opportunity.description}
        </p>

        {opportunity.matchReason && opportunity.matchScore > 0 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#5c8f1d',
            }}
          >
            <Sparkles size={14} /> {opportunity.matchReason}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(opportunity.required_skills || []).slice(0, 3).map((skill) => (
            <span
              key={skill}
              style={{
                fontSize: '0.75rem',
                padding: '3px 9px',
                borderRadius: 999,
                backgroundColor: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-subtle)',
                fontWeight: 600,
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={14} /> {opportunity.location || opportunity.work_mode}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={14} /> {formatDate(opportunity.deadline || opportunity.event_date)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button variant="secondary" size="sm" onClick={() => onView(opportunity)} style={{ flex: 1 }}>
            Details
          </Button>
          {application && application.status !== 'withdrawn' ? (
            <>
              <Badge tone={statusTone[application.status] || 'brown'}>
                {application.status.toUpperCase()}
              </Badge>
              {application.status === 'pending' && onWithdraw && (
                <Button variant="ghost" size="sm" onClick={() => onWithdraw(application)}>
                  Withdraw
                </Button>
              )}
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => onApply(opportunity)} style={{ flex: 1 }}>
              Apply Now
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
