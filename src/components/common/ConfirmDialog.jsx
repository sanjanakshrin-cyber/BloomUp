import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm action',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={420}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 22 }}>
        {description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
