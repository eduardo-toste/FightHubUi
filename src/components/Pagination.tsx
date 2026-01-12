import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalElements?: number
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalElements 
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i)
  
  // Mostrar apenas 5 páginas por vez
  const getVisiblePages = () => {
    if (totalPages <= 5) return pages
    
    if (currentPage < 3) return pages.slice(0, 5)
    if (currentPage > totalPages - 3) return pages.slice(totalPages - 5)
    
    return pages.slice(currentPage - 2, currentPage + 3)
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[var(--fh-card)] rounded-xl border border-[var(--fh-border)]">
      {totalElements !== undefined && (
        <div className="text-sm text-[var(--fh-muted)]">
          Total: <span className="font-semibold text-[var(--fh-body)]">{totalElements}</span> registros
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-xl border border-[var(--fh-border)] hover:bg-[var(--fh-gray-50)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft size={20} />
        </button>

        {currentPage > 2 && totalPages > 5 && (
          <>
            <button
              onClick={() => onPageChange(0)}
              className="px-4 py-2 rounded-xl border border-[var(--fh-border)] hover:bg-[var(--fh-gray-50)] transition-colors"
            >
              1
            </button>
            <span className="px-2 text-[var(--fh-muted)]">...</span>
          </>
        )}

        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-xl border transition-colors ${
              currentPage === page
                ? 'bg-[var(--fh-primary)] text-white border-[var(--fh-primary)]'
                : 'border-[var(--fh-border)] hover:bg-[var(--fh-gray-50)]'
            }`}
          >
            {page + 1}
          </button>
        ))}

        {currentPage < totalPages - 3 && totalPages > 5 && (
          <>
            <span className="px-2 text-[var(--fh-muted)]">...</span>
            <button
              onClick={() => onPageChange(totalPages - 1)}
              className="px-4 py-2 rounded-xl border border-[var(--fh-border)] hover:bg-[var(--fh-gray-50)] transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="p-2 rounded-xl border border-[var(--fh-border)] hover:bg-[var(--fh-gray-50)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Próxima página"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
