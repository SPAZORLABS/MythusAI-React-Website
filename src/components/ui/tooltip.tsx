import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

// Tooltip Provider Context
const TooltipContext = createContext<{
  delayDuration: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  setTriggerElement: (element: HTMLElement | null) => void;
}>({
  delayDuration: 700,
  isOpen: false,
  setIsOpen: () => {},
  handleMouseEnter: () => {},
  handleMouseLeave: () => {},
  setTriggerElement: () => {},
});

export function TooltipProvider({ 
  children, 
  delayDuration = 700 
}: { 
  children: React.ReactNode; 
  delayDuration?: number; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);

  const handleMouseEnter = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    
    const timeout = setTimeout(() => {
      setIsOpen(true);
    }, delayDuration);
    
    setShowTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
      setShowTimeout(null);
    }
    
    const timeout = setTimeout(() => {
      setIsOpen(false);
    }, 100);
    
    setHideTimeout(timeout);
  };

  const contextValue = {
    delayDuration,
    isOpen,
    setIsOpen,
    handleMouseEnter,
    handleMouseLeave,
    setTriggerElement,
  };

  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
    </TooltipContext.Provider>
  );
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const { handleMouseEnter, handleMouseLeave } = useContext(TooltipContext);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
    </div>
  );
}

export function TooltipContent({ 
  children, 
  className = '', 
  side = 'top',
  sideOffset = 4,
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string; 
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { isOpen } = useContext(TooltipContext);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      // Simple positioning - just show above the trigger
      const contentRect = contentRef.current.getBoundingClientRect();
      const triggerElement = document.querySelector('[data-tooltip-trigger="true"]') as HTMLElement;
      
      if (triggerElement) {
        const triggerRect = triggerElement.getBoundingClientRect();
        
        let top = 0;
        let left = 0;
        
        // Default to showing above the trigger
        top = triggerRect.top - contentRect.height - sideOffset;
        left = triggerRect.left + (triggerRect.width / 2) - (contentRect.width / 2);
        
        // Ensure tooltip stays within viewport
        if (top < 0) {
          // If above doesn't fit, show below
          top = triggerRect.bottom + sideOffset;
        }
        if (left < 0) left = 0;
        if (left + contentRect.width > window.innerWidth) {
          left = window.innerWidth - contentRect.width - 10;
        }
        
        setPosition({ top, left });
      }
    }
  }, [isOpen, sideOffset]);

  if (!isOpen) return null;

  return (
    <div
      ref={contentRef}
      className={`
        fixed z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 
        text-sm text-popover-foreground shadow-md animate-in fade-in-0 
        zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 
        data-[state=closed]:zoom-out-95
        ${className}
      `.trim()}
      style={{
        top: position.top,
        left: position.left,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function TooltipTrigger({ 
  children, 
  asChild = false,
  ...props 
}: { 
  children: React.ReactNode; 
  asChild?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { handleMouseEnter, handleMouseLeave, setTriggerElement } = useContext(TooltipContext);
  const triggerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerElement(triggerRef.current);
    }
  }, [setTriggerElement]);

  const triggerProps = {
    ref: triggerRef,
    'data-tooltip-trigger': 'true',
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleMouseEnter,
    onBlur: handleMouseLeave,
    ...props,
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, triggerProps);
  }

  return (
    <div {...(triggerProps as React.HTMLAttributes<HTMLDivElement>)}>
      {children}
    </div>
  );
}

export function TooltipArrow({ 
  className = '', 
  ...props 
}: { 
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`absolute w-2 h-2 bg-popover border-l border-t transform rotate-45 ${className}`}
      {...props}
    />
  );
}