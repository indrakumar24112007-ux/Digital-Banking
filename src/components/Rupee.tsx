import React from 'react';

interface RupeeProps {
  className?: string;
}

export const Rupee: React.FC<RupeeProps> = ({ className = 'w-3.5 h-3.5 inline-block -mt-0.5 mr-0.5 shrink-0' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="INR"
    >
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="M6 13h3a5 5 0 0 0 0-10" />
      <path d="M6 13l8.5 8" />
    </svg>
  );
};
