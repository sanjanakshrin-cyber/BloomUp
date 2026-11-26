export function Skeleton({ width = '100%', height = 18, style = {} }) {
  return <div className="bu-skeleton" style={{ width, height, ...style }} />
}

export function CardSkeleton() {
  return (
    <div className="bu-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton width="45%" height={14} />
      <Skeleton width="80%" height={22} />
      <Skeleton width="100%" height={14} />
      <Skeleton width="65%" height={14} />
    </div>
  )
}
