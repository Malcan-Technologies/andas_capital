"use client"

import * as React from "react"
import * as ReactDOM from "react-dom"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
}

function Tooltip({ children, content, side = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null)
  const triggerRef = React.useRef<HTMLDivElement>(null)

  const calculatePosition = React.useCallback(() => {
    if (!triggerRef.current) return null
    
    const rect = triggerRef.current.getBoundingClientRect()
    const tooltipWidth = 320
    const tooltipHeight = 60
    const padding = 8
    
    let top = 0
    let left = 0
    
    switch (side) {
      case "top":
        top = rect.top - tooltipHeight - padding
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        break
      case "bottom":
        top = rect.bottom + padding
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        break
      case "left":
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.left - tooltipWidth - padding
        break
      case "right":
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.right + padding
        break
    }
    
    // Keep tooltip within viewport
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding))
    top = Math.max(padding, top)
    
    return { top, left }
  }, [side])

  const handleMouseEnter = React.useCallback(() => {
    const pos = calculatePosition()
    if (pos) {
      setPosition(pos)
      setIsVisible(true)
    }
  }, [calculatePosition])

  const handleMouseLeave = React.useCallback(() => {
    setIsVisible(false)
    setPosition(null)
  }, [])

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && position && typeof window !== "undefined" && ReactDOM.createPortal(
        <div
          style={{ 
            top: position.top, 
            left: position.left,
            position: 'fixed',
            zIndex: 9999,
            width: 320,
            padding: '8px 12px',
            fontSize: '12px',
            color: '#e5e7eb',
            backgroundColor: '#111827',
            border: '1px solid #374151',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </div>
  )
}

export { Tooltip }
