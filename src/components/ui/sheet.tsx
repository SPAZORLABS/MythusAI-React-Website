import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, GripHorizontal, Minimize2, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  modal?: boolean
  dismissible?: boolean
}

export interface SheetContentProps {
  children: React.ReactNode
  className?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl' | '10xl' | 'custom'
  customSize?: string // For custom width/height values like '800px', '90vw', etc.
  resizable?: boolean
  showHandle?: boolean
  showCloseButton?: boolean
  onClose?: () => void
  expandable?: boolean
  defaultExpanded?: boolean
  onExpandChange?: (expanded: boolean) => void
}

export interface SheetHeaderProps {
  children: React.ReactNode
  className?: string
  showClose?: boolean
  onClose?: () => void
}

export interface SheetTitleProps {
  children: React.ReactNode
  className?: string
}

export interface SheetDescriptionProps {
  children: React.ReactNode
  className?: string
}

export interface SheetFooterProps {
  children: React.ReactNode
  className?: string
}

export interface SheetCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  className?: string
  asChild?: boolean
}

const Sheet = ({ open, onOpenChange, children, modal = true, dismissible = true }: SheetProps) => {
  return (
    <Dialog 
      open={open} 
      onClose={dismissible ? () => onOpenChange(false) : () => {}} 
      className="relative z-50"
      static={!modal}
    >
      {children}
    </Dialog>
  )
}

const SheetTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    )
  }
)
SheetTrigger.displayName = "SheetTrigger"

const SheetContent = ({ 
  children, 
  className, 
  side = 'right', 
  size = 'lg',
  customSize,
  resizable = false,
  showHandle = false,
  showCloseButton = false,
  onClose,
  expandable = false,
  defaultExpanded = false,
  onExpandChange
}: SheetContentProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // Size configurations
  const sizeClasses = {
    sm: side === 'left' || side === 'right' ? 'w-80' : 'h-80',
    md: side === 'left' || side === 'right' ? 'w-96' : 'h-96', 
    lg: side === 'left' || side === 'right' ? 'w-[32rem]' : 'h-[32rem]',
    xl: side === 'left' || side === 'right' ? 'w-[48rem]' : 'h-[48rem]',
    '2xl': side === 'left' || side === 'right' ? 'w-[56rem]' : 'h-[56rem]',
    '3xl': side === 'left' || side === 'right' ? 'w-[64rem]' : 'h-[64rem]',
    '4xl': side === 'left' || side === 'right' ? 'w-[72rem]' : 'h-[72rem]',
    '5xl': side === 'left' || side === 'right' ? 'w-[80rem]' : 'h-[80rem]',
    '6xl': side === 'left' || side === 'right' ? 'w-[88rem]' : 'h-[88rem]',
    '7xl': side === 'left' || side === 'right' ? 'w-[96rem]' : 'h-[96rem]',
    '8xl': side === 'left' || side === 'right' ? 'w-[104rem]' : 'h-[104rem]',
    '9xl': side === 'left' || side === 'right' ? 'w-[112rem]' : 'h-[112rem]',
    '10xl': side === 'left' || side === 'right' ? 'w-[120rem]' : 'h-[120rem]',
    full: side === 'left' || side === 'right' ? 'w-full' : 'h-full',
    custom: customSize || ''
  }

  const sideClasses = {
    top: "inset-x-0 top-0 border-b",
    right: "inset-y-0 right-0 border-l h-full",
    bottom: "inset-x-0 bottom-0 border-t",
    left: "inset-y-0 left-0 border-r h-full"
  }

  // Handle expand/collapse
  const handleToggleExpand = () => {
    if (!expandable) return
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    onExpandChange?.(newExpanded)
  }

  const sideTransitions = {
    top: {
      enter: "ease-out duration-300",
      enterFrom: "opacity-0 -translate-y-full scale-95",
      enterTo: "opacity-100 translate-y-0 scale-100",
      leave: "ease-in duration-200", 
      leaveFrom: "opacity-100 translate-y-0 scale-100",
      leaveTo: "opacity-0 -translate-y-full scale-95"
    },
    right: {
      enter: "ease-out duration-300",
      enterFrom: "opacity-0 translate-x-full scale-95",
      enterTo: "opacity-100 translate-x-0 scale-100",
      leave: "ease-in duration-200",
      leaveFrom: "opacity-100 translate-x-0 scale-100", 
      leaveTo: "opacity-0 translate-x-full scale-95"
    },
    bottom: {
      enter: "ease-out duration-300",
      enterFrom: "opacity-0 translate-y-full scale-95",
      enterTo: "opacity-100 translate-y-0 scale-100",
      leave: "ease-in duration-200",
      leaveFrom: "opacity-100 translate-y-0 scale-100",
      leaveTo: "opacity-0 translate-y-full scale-95"
    },
    left: {
      enter: "ease-out duration-300", 
      enterFrom: "opacity-0 -translate-x-full scale-95",
      enterTo: "opacity-100 translate-x-0 scale-100",
      leave: "ease-in duration-200",
      leaveFrom: "opacity-100 translate-x-0 scale-100",
      leaveTo: "opacity-0 -translate-x-full scale-95"
    }
  }

  // Handle resize drag
  const handleMouseDown = (_e: React.MouseEvent) => {
    if (!resizable) return
    setIsDragging(true)
    // setDragOffset(side === 'left' || side === 'right' ? e.clientX : e.clientY) // Removed unused state
  }

  useEffect(() => {
    if (!isDragging || !resizable) return

    const handleMouseMove = (_e: MouseEvent) => {
      // Handle resize logic here if needed
      // This is a simplified version - you'd implement actual resizing
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      // setDragOffset(0) // Removed unused state
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, resizable, side])

  return (
    <>
      {/* Backdrop with improved blur and animation */}
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100" 
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
      </Transition.Child>

      {/* Sheet container */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            {...sideTransitions[side]}
          >
            <Dialog.Panel 
              className={cn(
                "fixed shadow-2xl border border-border",
                "flex flex-col overflow-hidden transition-all duration-300",
                "bg-background text-foreground",
                "dark:bg-background dark:text-foreground poppins-text",
                sideClasses[side],
                isExpanded 
                  ? (side === 'left' || side === 'right' ? 'w-full' : 'h-full')
                  : sizeClasses[size],
                className
              )}
              data-expanded={isExpanded}
              style={{
                ...(size === 'custom' && customSize && {
                  [side === 'left' || side === 'right' ? 'width' : 'height']: customSize
                })
              }}
            >
              {/* Resize handle */}
              {resizable && (
                <div
                  className={cn(
                    "absolute bg-border hover:bg-primary/20 transition-colors cursor-resize group",
                    "flex items-center justify-center",
                    side === 'left' && "right-0 top-0 bottom-0 w-1 hover:w-2",
                    side === 'right' && "left-0 top-0 bottom-0 w-1 hover:w-2",
                    side === 'top' && "bottom-0 left-0 right-0 h-1 hover:h-2",
                    side === 'bottom' && "top-0 left-0 right-0 h-1 hover:h-2"
                  )}
                  onMouseDown={handleMouseDown}
                >
                  <div className={cn(
                      "opacity-0 group-hover:opacity-100 transition-opacity",
                      "bg-primary rounded-full",
                    (side === 'left' || side === 'right') ? "w-0.5 h-8" : "h-0.5 w-8"
                  )} />
                </div>
              )}

              {/* Drag handle */}
              {showHandle && (
                <div className={cn(
                  "flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors",
                  side === 'top' || side === 'bottom' ? "h-6 cursor-ns-resize" : "w-6 cursor-ew-resize"
                )}>
                  <GripHorizontal className={cn(
                    "text-muted-foreground",
                    side === 'left' || side === 'right' ? "rotate-90 h-4 w-4" : "h-4 w-4"
                  )} />
                </div>
              )}

              {/* Close button */}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={cn(
                    "absolute top-4 right-4 z-10 rounded-lg p-2",
                    "text-muted-foreground hover:text-foreground",
                    "hover:bg-accent transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "bg-background/80 backdrop-blur-sm border border-border/50",
                    "hover:bg-background hover:border-border"
                  )}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              )}

              {/* Expand/Collapse button */}
              {expandable && (
                <button
                  onClick={handleToggleExpand}
                  className={cn(
                    "absolute top-4 z-10 rounded-lg p-2",
                    "text-muted-foreground hover:text-foreground",
                    "hover:bg-accent transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "bg-background/80 backdrop-blur-sm border border-border/50",
                    "hover:bg-background hover:border-border",
                    showCloseButton ? "right-16" : "right-4"
                  )}
                >
                  {isExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </span>
                </button>
              )}

              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </>
  )
}

const SheetHeader = ({ 
  children, 
  className, 
  showClose = true, 
  onClose 
}: SheetHeaderProps) => {
  return (
    <div className={cn(
      "flex items-center justify-between gap-4 p-6 border-b border-border bg-muted/30",
      "backdrop-blur-sm min-h-[4rem]",
      className
    )}>
      <div className="flex flex-col space-y-1.5 text-left min-w-0 flex-1">
        {children}
      </div>
      {showClose && (
        <button
          onClick={onClose}
          className={cn(
            "rounded-lg p-2 text-muted-foreground hover:text-foreground",
            "hover:bg-accent transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "shrink-0"
          )}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </div>
  )
}

const SheetTitle = ({ children, className }: SheetTitleProps) => {
  return (
    <Dialog.Title className={cn(
      "text-lg font-semibold leading-tight tracking-tight text-foreground",
      className
    )}>
      {children}
    </Dialog.Title>
  )
}

const SheetDescription = ({ children, className }: SheetDescriptionProps) => {
  return (
    <Dialog.Description className={cn(
      "text-sm text-muted-foreground leading-relaxed",
      className
    )}>
      {children}
    </Dialog.Description>
  )
}

const SheetBody = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) => {
  return (
    <div className={cn("flex-1 overflow-y-auto", className)}>
      {children}
    </div>
  )
}

const SheetFooter = ({ children, className }: SheetFooterProps) => {
  return (
    <div className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end gap-3 p-6",
      "border-t border-border bg-muted/20 backdrop-blur-sm",
      className
    )}>
      {children}
    </div>
  )
}

const SheetClose = React.forwardRef<HTMLButtonElement, SheetCloseProps>(
  ({ children, className, asChild = false, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        ...(children.props || {}),
        onClick: (e: React.MouseEvent<Element, MouseEvent>) => {
          (children.props as any)?.onClick?.(e)
          props.onClick?.(e as React.MouseEvent<HTMLButtonElement, MouseEvent>)
        }
      } as any)
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          "bg-secondary text-secondary-foreground hover:bg-secondary h-10 px-4 py-2",
          className
        )}
        {...props}
      >
        {children || "Close"}
      </button>
    )
  }
)
SheetClose.displayName = "SheetClose"

// Additional utility components
const SheetOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
SheetOverlay.displayName = "SheetOverlay"

const SheetPortal = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

// Export everything
export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
  SheetClose,
  SheetOverlay,
  SheetPortal,
}