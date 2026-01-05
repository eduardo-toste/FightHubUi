import React from 'react'

const AuthCard: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className = '' }) => {
  return (
    <div
      className={`auth-card bg-[var(--fh-card)] border border-[var(--fh-border)] rounded-[16px] shadow-card p-8 ${className}`}
      role="region"
      aria-labelledby="auth-title"
    >
      {children}
    </div>
  )
}

export default AuthCard
