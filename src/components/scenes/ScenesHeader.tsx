import React from 'react';
import { cn } from '@/lib/utils';

interface ScenesHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

const ScenesHeader: React.FC<ScenesHeaderProps> = ({ title = 'Scenes', subtitle, className, children }) => {
  return (
    <div className={cn('w-full bg-black text-white border-b border-border px-6 py-4', className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold truncate">{title}</h2>
          {subtitle ? <p className="text-sm text-white/70 mt-1 truncate">{subtitle}</p> : null}
        </div>
        {children ? <div className="flex items-center gap-2 shrink-0">{children}</div> : null}
      </div>
    </div>
  );
};

export default ScenesHeader;