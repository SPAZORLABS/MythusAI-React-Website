// components/ui/dropdown-menu.tsx
import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

// ============ Types ============
interface DropdownMenuContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

interface RadioGroupContextType {
  value: string;
  onValueChange: (value: string) => void;
}

// ============ Contexts ============
const DropdownMenuContext = createContext<DropdownMenuContextType | undefined>(undefined);
const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined);

// ============ Hooks ============
const useDropdownMenu = () => {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('Dropdown components must be used within DropdownMenu');
  }
  return context;
};

const useRadioGroup = () => {
  const context = useContext(RadioGroupContext);
  return context;
};

// Custom hook for click outside detection
const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
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

    // Delay to avoid immediate trigger
    setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [ref, handler, enabled]);
};

// ============ Root Component ============
interface DropdownMenuProps {
  children: ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  }, [onOpenChange]);

  useClickOutside(contentRef, () => handleOpenChange(false), isOpen);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleOpenChange(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleOpenChange]);

  return (
    <DropdownMenuContext.Provider
      value={{
        isOpen,
        setIsOpen: handleOpenChange,
        triggerRef,
        contentRef,
      }}
    >
      {children}
    </DropdownMenuContext.Provider>
  );
};

// ============ Trigger Component ============
interface DropdownMenuTriggerProps {
  children: ReactNode;
  asChild?: boolean;
  className?: string;
}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  asChild = false,
  className = '',
}) => {
  const { isOpen, setIsOpen, triggerRef } = useDropdownMenu();

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ref: triggerRef,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      'aria-expanded': isOpen,
      'aria-haspopup': 'menu',
    });
  }

  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={className}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      type="button"
    >
      {children}
    </button>
  );
};

// ============ Content Component ============
interface DropdownMenuContentProps {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  className = '',
  align = 'end',
  sideOffset = 4,
}) => {
  const { isOpen, contentRef, triggerRef } = useDropdownMenu();
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
      role="menu"
      className={`
        fixed z-50 min-w-[8rem] overflow-hidden rounded-md border border-border 
        bg-popover p-1 text-popover-foreground shadow-md
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

// ============ Menu Item Component ============
interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
}) => {
  const { setIsOpen } = useDropdownMenu();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none
        transition-colors focus:bg-accent focus:text-accent-foreground
        ${disabled ? 'pointer-events-none opacity-50' : 'hover:bg-accent cursor-pointer'}
        ${className}
      `}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
};

// ============ Radio Group Components ============
interface DropdownMenuRadioGroupProps {
  children: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
}

export const DropdownMenuRadioGroup: React.FC<DropdownMenuRadioGroupProps> = ({
  children,
  value,
  onValueChange,
}) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div role="radiogroup">{children}</div>
    </RadioGroupContext.Provider>
  );
};

interface DropdownMenuRadioItemProps {
  children: ReactNode;
  value: string;
  className?: string;
}

export const DropdownMenuRadioItem: React.FC<DropdownMenuRadioItemProps> = ({
  children,
  value,
  className = '',
}) => {
  const { setIsOpen } = useDropdownMenu();
  const radioGroup = useRadioGroup();

  if (!radioGroup) {
    throw new Error('DropdownMenuRadioItem must be used within DropdownMenuRadioGroup');
  }

  const isSelected = radioGroup.value === value;

  const handleClick = () => {
    radioGroup.onValueChange(value);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="menuitemradio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none
        transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent cursor-pointer
        ${className}
      `}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && (
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="currentColor"
            className="h-2 w-2"
          >
            <circle cx="4" cy="4" r="4" />
          </svg>
        )}
      </span>
      {children}
    </div>
  );
};

// ============ Separator Component ============
interface DropdownMenuSeparatorProps {
  className?: string;
}

export const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({
  className = '',
}) => {
  return <div role="separator" className={`-mx-1 my-1 h-px bg-border ${className}`} />;
};

// ============ Label Component ============
interface DropdownMenuLabelProps {
  children: ReactNode;
  className?: string;
}

export const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-2 py-1.5 text-sm font-semibold ${className}`}>
      {children}
    </div>
  );
};

// ============ Exports ============
export default {
  Root: DropdownMenu,
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  RadioGroup: DropdownMenuRadioGroup,
  RadioItem: DropdownMenuRadioItem,
  Separator: DropdownMenuSeparator,
  Label: DropdownMenuLabel,
};
