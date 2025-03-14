
import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ResponsiveCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  withHoverEffect?: boolean;
  withAnimation?: boolean;
  animationDelay?: number;
  variant?: 'default' | 'glass' | 'outline' | 'glow' | 'gradient' | 'modern' | 'stats';
  accent?: 'default' | 'green' | 'blue' | 'purple' | 'amber' | 'red' | 'orange' | 'teal' | 'cyan';
  icon?: React.ReactNode;
  statValue?: string | number;
  statLabel?: string;
  statSubtext?: string;
}

const ResponsiveCard = React.forwardRef<HTMLDivElement, ResponsiveCardProps>(
  ({ 
    className, 
    title, 
    description, 
    footer, 
    children, 
    withHoverEffect = true,
    withAnimation = false,
    animationDelay = 0,
    variant = 'default',
    accent = 'default',
    icon,
    statValue,
    statLabel,
    statSubtext,
    ...props 
  }, ref) => {
    const animationStyle = withAnimation ? {
      animationDelay: `${animationDelay}ms`,
    } : {};

    const variantStyles = {
      default: "",
      glass: "bg-opacity-20 backdrop-blur-sm border-opacity-20",
      outline: "bg-transparent border-2",
      glow: "shadow-[0_0_20px_rgba(0,255,170,0.15)]",
      gradient: "bg-gradient-to-b from-card/60 to-background border-0",
      modern: "card-modern",
      stats: "card-stats border-0"
    };

    const accentStyles = {
      default: "",
      green: "border-green-500/50",
      blue: "border-blue-500/50",
      purple: "border-purple-500/50",
      amber: "border-amber-500/50",
      red: "border-red-500/50",
      orange: "border-orange-500/50",
      teal: "border-teal-500/50",
      cyan: "border-cyan-500/50"
    };

    const accentGradients = {
      default: "",
      blue: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-700 dark:text-blue-300",
      purple: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 text-purple-700 dark:text-purple-300",
      green: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-green-700 dark:text-green-300",
      amber: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 text-amber-700 dark:text-amber-300",
      red: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 text-red-700 dark:text-red-300",
      orange: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 text-orange-700 dark:text-orange-300",
      teal: "bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 text-teal-700 dark:text-teal-300", 
      cyan: "bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 text-cyan-700 dark:text-cyan-300"
    };

    if (variant === 'stats' && statValue !== undefined && statLabel !== undefined) {
      return (
        <Card 
          ref={ref} 
          className={cn(
            "w-full overflow-hidden", 
            withHoverEffect && "card-hover transform-gpu",
            withAnimation && "animate-fade-in opacity-0",
            variant === 'stats' && accentGradients[accent],
            variantStyles[variant],
            accentStyles[accent],
            className
          )}
          style={animationStyle}
          {...props}
        >
          <div className="p-4 flex flex-col items-center text-center">
            {icon && <div className="mb-3 text-4xl">{icon}</div>}
            <h3 className="text-sm font-medium mb-1">{statLabel}</h3>
            <p className="text-2xl font-bold">{statValue}</p>
            {statSubtext && <p className="text-xs mt-1">{statSubtext}</p>}
          </div>
        </Card>
      );
    }

    return (
      <Card 
        ref={ref} 
        className={cn(
          "w-full overflow-hidden", 
          withHoverEffect && "card-hover transform-gpu",
          withAnimation && "animate-fade-in opacity-0",
          variantStyles[variant],
          accentStyles[accent],
          className
        )}
        style={animationStyle}
        {...props}
      >
        {(title || description) && (
          <CardHeader className="p-3 md:p-4">
            {title && typeof title === "string" ? (
              <CardTitle className="heading-responsive">{title}</CardTitle>
            ) : (
              title
            )}
            {description && typeof description === "string" ? (
              <CardDescription className="text-responsive">{description}</CardDescription>
            ) : (
              description
            )}
          </CardHeader>
        )}
        
        {children && (
          <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
            {children}
          </CardContent>
        )}
        
        {footer && (
          <CardFooter className="p-3 pt-0 md:p-4 md:pt-0">
            {footer}
          </CardFooter>
        )}
      </Card>
    );
  }
);

ResponsiveCard.displayName = "ResponsiveCard";

export { ResponsiveCard };
