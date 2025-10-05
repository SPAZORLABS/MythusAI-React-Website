import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "elevated" | "glass";
type Size = "sm" | "md" | "lg";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  size?: Size;
  bordered?: boolean;
  hoverable?: boolean;
}

/**
 * Card - container with multiple visual variants and sizes.
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", size = "md", bordered = false, hoverable = false, ...props }, ref) => {
    const variantStyles: Record<Variant, string> = {
      default: "bg-card text-card-foreground border-transparent",
      elevated: "bg-white text-card-foreground shadow-sm dark:bg-neutral-900",
      glass: "bg-white/60 backdrop-blur-sm dark:bg-black/40 border-transparent",
    };

    const sizeStyles: Record<Size, string> = {
      sm: "rounded-md",
      md: "rounded-lg",
      lg: "rounded-xl",
    };

    const borderClass = bordered ? "border" : "border-transparent";
    const hoverClass = hoverable ? "hover:shadow-lg transition-shadow" : "";

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          sizeStyles[size],
          variantStyles[variant],
          borderClass,
          hoverClass,
          "ring-0",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

/* ----------------- Header ----------------- */

interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  compact?: boolean;
}

/**
 * CardHeader - includes optional title, subtitle, and actions (right-aligned).
 */
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({ className, title, subtitle, actions, compact = false, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-start justify-between gap-4 w-full",
        compact ? "py-3 px-4" : "py-4 px-6",
        className
      )}
      {...props}
    >
      <div className="min-w-0 w-full">
        {title ? <CardTitle className="mb-0">{title}</CardTitle> : null}
        {subtitle ? <CardDescription className="mt-1">{subtitle}</CardDescription> : null}
        {/* allow children fallback for custom header content */}
        {!title && !subtitle ? children : null}
      </div>

      {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
});
CardHeader.displayName = "CardHeader";

/* ----------------- Title ----------------- */

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: "base" | "lg";
}

/**
 * CardTitle - consistent typography for card headings
 */
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(({ className, size = "base", children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "leading-tight tracking-tight text-foreground",
      size === "lg" ? "text-xl font-semibold" : "text-lg font-semibold",
      className
    )}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

/* ----------------- Description ----------------- */

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, children, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props}>
    {children}
  </p>
));
CardDescription.displayName = "CardDescription";

/* ----------------- Content ----------------- */

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
}

/**
 * CardContent - body area, supports compact mode (less padding).
 */
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({ className, compact = false, ...props }, ref) => (
  <div ref={ref} className={cn(compact ? "px-4 pb-4 pt-0" : "p-4", "min-h-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

/* ----------------- Footer ----------------- */

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
}

/**
 * CardFooter - action area, aligned to the end by default.
 */
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(({ className, compact = false, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-end gap-3 border-t",
      compact ? "py-3 px-4 border-border/50" : "py-4 px-6 border-border",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
