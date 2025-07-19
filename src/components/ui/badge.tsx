
import * as React from "react"
import { cn } from "@/lib/utils"
import { BadgeProps, badgeVariants } from "./badge.utils"

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"
