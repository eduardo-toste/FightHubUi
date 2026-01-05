import React from 'react';

export default function Skeleton({
  className = 'h-6 w-full',
}: {
  className?: string;
}) {
  return <div className={`fh-skeleton ${className} rounded-md`} />;
}
