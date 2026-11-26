import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message, type = 'success', duration = 3800) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((prev) => [...prev, { id, message, type }])
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration)
      }
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="bu-toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`bu-toast bu-toast-${t.type}`}>
            {t.type === 'success' && (
              <CheckCircle2 size={18} color="#84C233" style={{ flexShrink: 0, marginTop: 2 }} />
            )}
            {t.type === 'error' && (
              <AlertCircle size={18} color="#e05246" style={{ flexShrink: 0, marginTop: 2 }} />
            )}
            {t.type === 'info' && (
              <Info size={18} color="#F6C827" style={{ flexShrink: 0, marginTop: 2 }} />
            )}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 2,
              }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
