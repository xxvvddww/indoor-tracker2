
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
  variant?: 'default' | 'glass' | 'outline' | 'glow';
  accent?: 'default' | 'green' | 'blue' | 'purple' | 'amber';
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
    };

    const accentStyles = {
      default: "",
      green: "border-green-500 text-green-500",
      blue: "border-blue-500 text-blue-500",
      purple: "border-purple-500 text-purple-500",
      amber: "border-amber-500 text-amber-500",
    };

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
