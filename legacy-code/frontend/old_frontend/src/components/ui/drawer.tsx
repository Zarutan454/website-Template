
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export const Drawer = ({
  open,
  onOpenChange,
  children,
}: DrawerProps) => {
  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={() => onOpenChange?.(false)}
        />
      )}
      {children}
    </>
  );
}

const drawerVariants = cva(
  "fixed z-50 bg-background w-full shadow-lg transition-transform duration-300 ease-in-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b",
        bottom: "inset-x-0 bottom-0 border-t",
        left: "inset-y-0 left-0 h-full border-r",
        right: "inset-y-0 right-0 h-full border-l",
      },
    },
    defaultVariants: {
      side: "bottom",
    },
  }
)

export interface DrawerContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof drawerVariants> {
  open?: boolean;
  onClose?: () => void;
}

const DrawerContent = React.forwardRef<
  HTMLDivElement,
  DrawerContentProps
>(({ className, side = "bottom", open, onClose, ...props }, ref) => {
  const translateClasses = {
    top: open ? "translate-y-0" : "-translate-y-full",
    bottom: open ? "translate-y-0" : "translate-y-full",
    left: open ? "translate-x-0" : "-translate-x-full",
    right: open ? "translate-x-0" : "translate-x-full",
  }

  const [touchStart, setTouchStart] = React.useState<number | null>(null)
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragOffset, setDragOffset] = React.useState(0)
  
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    if (!open) return
    setIsDragging(true)
    setTouchEnd(null)
    setDragOffset(0)
    if (side === "bottom" || side === "top") {
      setTouchStart(e.targetTouches[0].clientY)
    } else {
      setTouchStart(e.targetTouches[0].clientX)
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !open || !isDragging) return
    
    let currentTouch
    let offset
    
    if (side === "bottom") {
      currentTouch = e.targetTouches[0].clientY
      offset = currentTouch - touchStart
      if (offset < 0) offset = 0
    } else if (side === "top") {
      currentTouch = e.targetTouches[0].clientY
      offset = touchStart - currentTouch
      if (offset < 0) offset = 0
    } else if (side === "left") {
      currentTouch = e.targetTouches[0].clientX
      offset = touchStart - currentTouch
      if (offset < 0) offset = 0
    } else { // right
      currentTouch = e.targetTouches[0].clientX
      offset = currentTouch - touchStart
      if (offset < 0) offset = 0
    }
    
    setTouchEnd(currentTouch)
    setDragOffset(offset)
  }

  const onTouchEnd = () => {
    if (!touchStart || !open || !isDragging) return
    setIsDragging(false)
    
    if (!touchEnd || Math.abs(dragOffset) < minSwipeDistance) {
      setDragOffset(0)
      return
    }
    
    if (onClose) {
      onClose()
    }
  }

  const getInlineStyles = () => {
    if (!isDragging || dragOffset === 0) return {}
    
    let transform = ""
    
    if (side === "bottom") {
      transform = `translateY(${dragOffset}px)`
    } else if (side === "top") {
      transform = `translateY(-${dragOffset}px)`
    } else if (side === "left") {
      transform = `translateX(-${dragOffset}px)`
    } else if (side === "right") {
      transform = `translateX(${dragOffset}px)`
    }
    
    return { transform }
  }

  return (
    <div
      ref={ref}
      className={cn(
        drawerVariants({ side }),
        translateClasses[side],
        "rounded-t-[10px]",
        className
      )}
      style={getInlineStyles()}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {props.children}
    </div>
  )
})
DrawerContent.displayName = "DrawerContent"

export {
  DrawerContent,
}
