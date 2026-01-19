import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-700 text-gray-200 border border-gray-600",
        secondary: "bg-gray-600 text-gray-300 border border-gray-500",
        success: "bg-green-500/20 text-green-300 border border-green-400/30",
        warning: "bg-orange-500/20 text-orange-300 border border-orange-400/30",
        destructive: "bg-red-500/20 text-red-300 border border-red-400/30",
        info: "bg-blue-500/20 text-blue-300 border border-blue-400/30",
        outline: "text-gray-300 border border-gray-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
