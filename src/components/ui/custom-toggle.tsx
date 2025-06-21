"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium relative disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none transition-[color,box-shadow] whitespace-nowrap " +
    // underline effect
    "before:content-[''] before:absolute before:left-1/2 before:-translate-x-1/2 before:bottom-0 before:w-[15%] before:h-[2px] before:bg-pink-500 before:rounded-full before:transition-all before:duration-300 before:scale-x-100 before:origin-center " +
    // hover underline expands to 75%
    "hover:before:w-[55%] hover:before:opacity-100 hover:before:bg-pink-500 hover:text-inherit " +
    // active (clicked/on) underline expands to 85%, no bg
    "data-[state=on]:before:w-[102%] data-[state=on]:before:bg-pink-500 data-[state=on]:before:opacity-100 data-[state=on]:text-inherit",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-xs",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
