import React from 'react';

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ children, className = '', header, footer }) => {
  return (
    <div className={`fh-card ${className}`}>
      {header && (
        <div className="p-4 border-b border-[var(--fh-divider)]">{header}</div>
      )}
      <div className="p-4">{children}</div>
      {footer && (
        <div className="p-4 border-t border-[var(--fh-divider)]">{footer}</div>
      )}
    </div>
  );
};

export default Card;
