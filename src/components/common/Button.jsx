import { Loader2 } from 'lucide-react'
import './Button.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`bu-btn bu-btn-${variant} bu-btn-${size} ${
        fullWidth ? 'bu-btn-full' : ''
      } ${className}`}
      {...props}
    >
      {loading && <Loader2 size={16} className="bu-btn-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}
