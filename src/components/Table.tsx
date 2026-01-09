import React from 'react'

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
}

export default function Table<T extends { id: string }>({ 
  columns, 
  data, 
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
  onRowClick 
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="bg-[var(--fh-card)] rounded-lg border border-[var(--fh-border)] p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-[var(--fh-divider)] rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-[var(--fh-card)] rounded-lg border border-[var(--fh-border)] p-12 text-center">
        <p className="text-[var(--fh-muted)]">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="bg-[var(--fh-card)] rounded-lg border border-[var(--fh-border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--fh-bg)] border-b border-[var(--fh-border)]">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-semibold text-[var(--fh-body)] uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--fh-border)]">
            {data.map((item) => (
              <tr 
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? 'cursor-pointer hover:bg-[var(--fh-bg)] transition-colors' : ''}
              >
                {columns.map((column) => (
                  <td 
                    key={`${item.id}-${column.key}`}
                    className="px-6 py-4 text-sm text-[var(--fh-body)]"
                  >
                    {column.render 
                      ? column.render(item) 
                      : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
