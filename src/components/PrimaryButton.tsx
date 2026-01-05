import React from 'react'

type PrimaryButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  className?: string
}

export default function PrimaryButton({ loading = false, children, className = '', ...rest }: PrimaryButtonProps) {
  return (
    <button
      className={`fh-btn-primary w-full inline-flex items-center justify-center ${className}`}
      disabled={rest.disabled || loading}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
      )}
      <span>{children}</span>
    </button>
  )
}
