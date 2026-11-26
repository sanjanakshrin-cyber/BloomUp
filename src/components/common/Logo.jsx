export default function Logo({ showText = true, size = 36 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="32" cy="34" r="22" stroke="#F7931E" strokeWidth="6" />
        <path
          d="M32 38C32 25 42 15 54 15C54 27 45 38 32 38Z"
          fill="#84C233"
        />
        <path
          d="M32 38C32 28 24 20 14 20C14 30 22 38 32 38Z"
          fill="#F6C827"
        />
        <path
          d="M32 38V50"
          stroke="var(--brand-brown)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span
          style={{
            fontWeight: 800,
            fontSize: '1.28rem',
            letterSpacing: '-0.02em',
            color: 'var(--text-heading)',
          }}
        >
          Bloom<span style={{ color: 'var(--brand-green)' }}>Up</span>
        </span>
      )}
    </span>
  )
}
