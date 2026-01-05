import React from 'react';

const StatCard: React.FC<{
  title: string;
  value?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}> = ({ title, value, subtitle, icon }) => {
  return (
    <div className="fh-card flex items-center gap-4 p-4">
      <div className="w-12 h-12 rounded-full bg-[var(--fh-divider)] flex items-center justify-center text-[var(--fh-body)]">
        {icon ?? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 2h8v2a4 4 0 0 1-4 4 4 4 0 0 1-4-4V2z" />
            <path d="M5 8h14v2a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8z" />
            <path d="M9 20h6" />
          </svg>
        )}
      </div>
      <div>
        <div className="text-sm font-semibold text-[var(--fh-text)]">
          {title}
        </div>
        <div className="text-2xl font-extrabold text-[var(--fh-body)]">
          {value ?? '-'}
        </div>
        {subtitle && (
          <div className="text-sm text-[var(--fh-muted)]">{subtitle}</div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
