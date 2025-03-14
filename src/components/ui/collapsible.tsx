
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { ChevronDown } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger> & {
    showArrow?: boolean
    customIcon?: React.ReactNode
    preserveState?: boolean
  }
>(({ className, children, showArrow = true, customIcon, preserveState = false, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    className={cn(
      "group flex w-full items-center justify-between transition-all hover:bg-secondary/10 rounded-md",
      className
    )}
    {...props}
  >
    {children}
    {showArrow && !props.asChild && (
      customIcon || <ChevronDown
        className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    )}
  </CollapsiblePrimitive.Trigger>
))
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
      className
    )}
    {...props}
  >
    <div className={cn("pt-0", className)}>{children}</div>
  </CollapsiblePrimitive.Content>
))
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
