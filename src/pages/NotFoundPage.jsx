import { Link } from 'react-router-dom'
import { Sprout, ArrowLeft } from 'lucide-react'
import Button from '../components/common/Button'

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-canvas)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        className="bu-card bu-fade-up"
        style={{
          maxWidth: 460,
          width: '100%',
          padding: 40,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div
          className="bu-leaf-tile"
          style={{
            width: 64,
            height: 64,
            backgroundColor: 'var(--bg-badge-green)',
            color: 'var(--brand-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sprout size={30} />
        </div>
        <h1 style={{ fontSize: '2.4rem' }}>404</h1>
        <h2 style={{ fontSize: '1.2rem' }}>Page not found</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" style={{ marginTop: 8 }}>
          <Button variant="primary">
            <ArrowLeft size={16} /> Back to BloomUp Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
