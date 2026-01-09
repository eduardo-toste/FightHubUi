import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose: () => void
}

export default function Toast({ type, message, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation to complete
  }

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
      textColor: 'text-white',
      borderColor: 'border-green-600',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
      textColor: 'text-white',
      borderColor: 'border-red-600',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-gradient-to-r from-[var(--fh-primary-light)] to-[var(--fh-primary)]',
      textColor: 'text-white',
      borderColor: 'border-[var(--fh-primary)]',
    },
    info: {
      icon: Info,
      bgColor: 'bg-gradient-to-r from-[var(--fh-accent)] to-[var(--fh-accent-light)]',
      textColor: 'text-white',
      borderColor: 'border-[var(--fh-accent)]',
    },
  }

  const { icon: Icon, bgColor, textColor, borderColor } = config[type]

  return (
    <div
      className={`
        ${bgColor} ${textColor} ${borderColor}
        min-w-[320px] max-w-md rounded-lg shadow-2xl border-l-4
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon size={24} className="flex-shrink-0 mt-0.5" />
        <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
        <button
          onClick={handleClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}
