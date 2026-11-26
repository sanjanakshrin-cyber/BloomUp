export default function Badge({ children, tone = 'green', className = '' }) {
  const tones = {
    green: { bg: 'var(--bg-badge-green)', color: '#5c8f1d' },
    yellow: { bg: 'var(--bg-badge-yellow)', color: '#a88108' },
    orange: { bg: 'var(--bg-badge-orange)', color: '#c46b09' },
    brown: { bg: 'var(--bg-badge-brown)', color: 'var(--text-secondary)' },
    red: { bg: 'rgba(217, 72, 59, 0.14)', color: '#d9483b' },
  }
  const style = tones[tone] || tones.green

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 'var(--radius-pill)',
        fontSize: '0.76rem',
        fontWeight: 700,
        backgroundColor: style.bg,
        color: style.color,
        lineHeight: 1.3,
      }}
    >
      {children}
    </span>
  )
}
