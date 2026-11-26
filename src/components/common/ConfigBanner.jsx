import { AlertTriangle } from 'lucide-react'

export default function ConfigBanner() {
  return (
    <div
      role="alert"
      style={{
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-badge-yellow)',
        border: '1px solid var(--brand-yellow)',
        color: 'var(--text-primary)',
        fontSize: '0.88rem',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        marginBottom: 18,
      }}
    >
      <AlertTriangle size={18} color="#c46b09" style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <strong>Supabase not configured.</strong> Copy <code>.env.example</code> to{' '}
        <code>.env</code> and add <code>VITE_SUPABASE_URL</code> and{' '}
        <code>VITE_SUPABASE_ANON_KEY</code> to enable real authentication and database persistence.
      </div>
    </div>
  )
}
