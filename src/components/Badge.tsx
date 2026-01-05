import React from 'react';

export default function Badge({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={`fh-badge ${className}`}>{children}</span>;
}
