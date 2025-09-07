import React from 'react';

export const SearchIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <span className={className} style={style}>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  </span>
);
