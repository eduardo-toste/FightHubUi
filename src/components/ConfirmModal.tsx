import React from 'react'
import ReactDOM from 'react-dom'
import { AlertTriangle, X } from 'lucide-react'

export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning'
}: ConfirmModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const variantStyles = {
    danger: {
      icon: 'text-red-600',
      iconBg: 'bg-red-100',
      button: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      icon: 'text-orange-600',
      iconBg: 'bg-orange-100',
      button: 'bg-orange-600 hover:bg-orange-700 text-white'
    },
    info: {
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100',
      button: 'bg-gradient-to-r from-[var(--fh-primary)] to-[var(--fh-primary-dark)] hover:shadow-lg text-white'
    }
  }

  const styles = variantStyles[variant]

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--fh-card)] rounded-xl shadow-2xl max-w-md w-full border border-[var(--fh-border)] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-start gap-4">
            <div 
              className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}
            >
              <AlertTriangle className={styles.icon} size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--fh-text)]">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--fh-muted)] hover:text-[var(--fh-text)] transition-colors p-1 rounded-lg hover:bg-[var(--fh-divider)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <p className="text-[var(--fh-body)] leading-relaxed pl-16">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[var(--fh-divider)]/30 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--fh-text)] hover:bg-[var(--fh-divider)] rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export { ConfirmModal }
