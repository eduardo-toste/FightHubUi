import React from 'react'

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  id: string
  error?: string | undefined
  icon?: React.ReactNode
  trailing?: React.ReactNode
  inputRef?: any
}

export default function TextField({ label, id, error, icon, trailing, inputRef, ...rest }: TextFieldProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm text-[var(--fh-body)] mb-1">
          {label}
        </label>
      )}

      <div className={`relative`}>
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fh-muted)]">{icon}</div>}
        {trailing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        )}
        <input
          id={id}
          ref={inputRef}
          className={`fh-input ${icon ? 'pl-10' : ''} ${trailing ? 'pr-12' : ''} ${error ? 'fh-input-error' : ''}`}
          {...(rest as any)}
        />
      </div>

      {error && <div className="mt-1 text-sm text-red-600">{error}</div>}
    </div>
  )
}
