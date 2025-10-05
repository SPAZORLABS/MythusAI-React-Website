// components/ui/popover.tsx
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PopoverContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const PopoverContext = createContext<PopoverContextType | undefined>(undefined);

const usePopover = () => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover components must be used within Popover');
  }
  return context;
};

// Click outside hook
const useClickOutside = (
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [ref, handler, enabled]);
};

interface PopoverProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Popover: React.FC<PopoverProps> = ({ children, open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setIsOpen = (open: boolean) => {
    if (!isControlled) {
      setInternalOpen(open);
    }
    onOpenChange?.(open);
  };

  useClickOutside(contentRef, () => setIsOpen(false), isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen, triggerRef, contentRef }}>
      {children}
    </PopoverContext.Provider>
  );
};

interface PopoverTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children, asChild = false }) => {
  const { isOpen, setIsOpen, triggerRef } = usePopover();

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: triggerRef,
      onClick: handleClick,
      'aria-expanded': isOpen,
    });
  }

  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      onClick={handleClick}
      aria-expanded={isOpen}
      type="button"
    >
      {children}
    </button>
  );
};

interface PopoverContentProps {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export const PopoverContent: React.FC<PopoverContentProps> = ({
  children,
  className = '',
  align = 'center',
  sideOffset = 4,
}) => {
  const { isOpen, contentRef, triggerRef } = usePopover();
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      
      let left = triggerRect.left;
      
      if (align === 'end') {
        left = triggerRect.right;
      } else if (align === 'center') {
        left = triggerRect.left + triggerRect.width / 2;
      }

      setPosition({
        top: triggerRect.bottom + sideOffset,
        left: left,
      });
    }
  }, [isOpen, align, sideOffset, triggerRef]);

  if (!isOpen) return null;

  const alignClass = {
    start: 'origin-top-left',
    center: 'origin-top -translate-x-1/2',
    end: 'origin-top-right -translate-x-full',
  }[align];

  return createPortal(
    <div
      ref={contentRef}
      className={`
        fixed z-50 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none
        animate-in fade-in-0 zoom-in-95 
        ${alignClass} ${className}
      `}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {children}
    </div>,
    document.body
  );
};

export default {
  Root: Popover,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
};
