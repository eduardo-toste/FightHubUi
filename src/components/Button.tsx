/* eslint-disable react/prop-types */
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  loading?: boolean
}

export default function Button({
  variant = 'primary',
  className = '',
  children,
  loading = false,
  ...rest
}: ButtonProps) {
  const base = 'fh-btn'
  const variantClass =
    variant === 'primary' ? 'fh-btn-primary' : 
    variant === 'secondary' ? 'fh-btn-secondary' :
    variant === 'ghost' ? 'fh-btn-ghost' :
    variant === 'outline' ? 'fh-btn-outline' : 'fh-btn-secondary'
  const isDisabled = rest.disabled || loading

  return (
    <button className={`${base} ${variantClass} ${className}`} disabled={isDisabled} {...rest}>
      {loading && (
        <span className="inline-flex items-center mr-2">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </span>
      )}
      {children}
    </button>
  )
}

export { Button }
