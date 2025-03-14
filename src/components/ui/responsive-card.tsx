
import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ResponsiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  withHoverEffect?: boolean;
  withAnimation?: boolean;
  animationDelay?: number;
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
    ...props 
  }, ref) => {
    const animationStyle = withAnimation ? {
      animationDelay: `${animationDelay}ms`,
    } : {};

    return (
      <Card 
        ref={ref} 
        className={cn(
          "w-full overflow-hidden", 
          withHoverEffect && "card-hover",
          withAnimation && "animate-fade-in opacity-0",
          className
        )}
        style={animationStyle}
        {...props}
      >
        {(title || description) && (
          <CardHeader className="p-4 md:p-6">
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
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            {children}
          </CardContent>
        )}
        
        {footer && (
          <CardFooter className="p-4 pt-0 md:p-6 md:pt-0">
            {footer}
          </CardFooter>
        )}
      </Card>
    );
  }
);

ResponsiveCard.displayName = "ResponsiveCard";

export { ResponsiveCard };
