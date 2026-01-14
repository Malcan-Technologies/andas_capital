"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    return (
      <label
        className={cn(
          "relative inline-flex items-center cursor-pointer",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            "w-11 h-6 bg-gray-600 rounded-full peer",
            "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50",
            "peer-checked:after:translate-x-full peer-checked:after:border-white",
            "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
            "after:bg-white after:border-gray-300 after:border after:rounded-full",
            "after:h-5 after:w-5 after:transition-all",
            "peer-checked:bg-blue-600",
            className
          )}
        />
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
