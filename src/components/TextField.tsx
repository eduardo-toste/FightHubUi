import React from 'react'

type TextFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'ref'> & {
  label?: string
  id: string
  error?: string | undefined
  icon?: React.ReactNode
  trailing?: React.ReactNode
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, id, error, icon, trailing, ...rest }, ref) => {
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
            ref={ref}
            className={`fh-input ${icon ? 'pl-10' : ''} ${trailing ? 'pr-12' : ''} ${error ? 'fh-input-error' : ''}`}
            {...rest}
          />
        </div>

        {error && <div className="mt-1 text-sm text-red-600">{error}</div>}
      </div>
    )
  }
)

TextField.displayName = 'TextField'

export default TextField
