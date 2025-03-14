
import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  as?: React.ElementType;
}

export function ResponsiveContainer({
  children,
  className,
  spacing = 'md',
  as: Component = 'div',
  ...props
}: ResponsiveContainerProps) {
  const isMobile = useIsMobile();
  
  const getSpacing = () => {
    if (spacing === 'none') return '';
    
    if (isMobile) {
      switch (spacing) {
        case 'xs': return 'space-y-1';
        case 'sm': return 'space-y-2';
        case 'md': return 'space-y-3';
        case 'lg': return 'space-y-4';
        default: return 'space-y-2';
      }
    } else {
      switch (spacing) {
        case 'xs': return 'space-y-2';
        case 'sm': return 'space-y-4';
        case 'md': return 'space-y-6';
        case 'lg': return 'space-y-8';
        default: return 'space-y-6';
      }
    }
  };

  return (
    <Component
      className={cn(
        'w-full mobile-container',
        getSpacing(),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
