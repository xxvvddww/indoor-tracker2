
import * as React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveTitle({
  children,
  className,
  level = 1,
  size,
  ...props
}: ResponsiveTitleProps) {
  const isMobile = useIsMobile();
  
  const getSizeClass = () => {
    if (size) {
      // User-specified size overrides automatic sizing
      if (isMobile) {
        switch (size) {
          case 'xs': return 'text-sm';
          case 'sm': return 'text-base';
          case 'md': return 'text-lg';
          case 'lg': return 'text-xl';
          case 'xl': return 'text-2xl';
        }
      } else {
        switch (size) {
          case 'xs': return 'text-base';
          case 'sm': return 'text-lg';
          case 'md': return 'text-xl';
          case 'lg': return 'text-2xl';
          case 'xl': return 'text-3xl';
        }
      }
    }
    
    // Default sizing based on heading level
    if (isMobile) {
      switch (level) {
        case 1: return 'text-xl';
        case 2: return 'text-lg';
        case 3: return 'text-base';
        case 4: return 'text-sm';
        case 5:
        case 6: return 'text-xs';
      }
    } else {
      switch (level) {
        case 1: return 'text-3xl';
        case 2: return 'text-2xl';
        case 3: return 'text-xl';
        case 4: return 'text-lg';
        case 5: return 'text-base';
        case 6: return 'text-sm';
      }
    }
  };
  
  const Component = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <Component
      className={cn(
        'font-bold tracking-tight',
        getSizeClass(),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
