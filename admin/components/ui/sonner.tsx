"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-gray-900 group-[.toaster]:text-gray-100 group-[.toaster]:border-gray-700 group-[.toaster]:shadow-xl",
          description: "group-[.toast]:text-gray-400",
          actionButton:
            "group-[.toast]:bg-emerald-600 group-[.toast]:text-white group-[.toast]:hover:bg-emerald-500",
          cancelButton:
            "group-[.toast]:bg-gray-700 group-[.toast]:text-gray-300 group-[.toast]:hover:bg-gray-600",
          success:
            "group-[.toaster]:bg-gray-900 group-[.toaster]:border-emerald-600/50",
          error:
            "group-[.toaster]:bg-gray-900 group-[.toaster]:border-red-600/50",
          warning:
            "group-[.toaster]:bg-gray-900 group-[.toaster]:border-amber-600/50",
          info:
            "group-[.toaster]:bg-gray-900 group-[.toaster]:border-blue-600/50",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
