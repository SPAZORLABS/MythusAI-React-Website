import React, { ReactNode } from 'react';

interface SectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  border?: boolean;
  grid?: boolean;
  cols?: number;
  gap?: string;
}

export function Section({ 
  title, 
  children, 
  className = '', 
  border = true, 
  grid = false, 
  cols = 2,
  gap = 'gap-2'
}: SectionProps) {
  const borderClasses = border ? 'border border-black' : '';
  const gridClasses = grid ? `grid grid-cols-${cols} ${gap}` : '';
  
  return (
    <div className={`${borderClasses} ${className}`}>
      {title && (
        <div className="bg-black text-white text-xs font-bold p-1 text-center uppercase">
          {title}
        </div>
      )}
      <div className={`p-2 ${gridClasses}`}>
        {children}
      </div>
    </div>
  );
}
