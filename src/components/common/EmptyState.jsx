import { Sprout } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Sprout,
  title = 'Nothing here yet',
  description,
  action,
}) {
  return (
    <div
      className="bu-card"
      style={{
        padding: '40px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        className="bu-leaf-tile"
        style={{
          width: 56,
          height: 56,
          backgroundColor: 'var(--bg-badge-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--brand-green)',
        }}
      >
        <Icon size={26} />
      </div>
      <h4 style={{ fontSize: '1.05rem' }}>{title}</h4>
      {description && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 400 }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 6 }}>{action}</div>}
    </div>
  )
}
