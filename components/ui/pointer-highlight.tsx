import React from 'react'

type Props = {
  children: React.ReactNode
  className?: string
}

// Named export so callers can import { PointerHighlight } from the path
export function PointerHighlight({ children, className = '' }: Props) {
  return (
    // outer container is inline-flex and provides the padding so the background
    // fills a proper rectangular box behind the text (not just tightly behind glyphs)
    <span className={`relative inline-flex items-center px-3 py-1.5 group ${className}`}>
      {/* background box positioned behind the padded container and styled as an "error" box */}
      <span className="absolute inset-0 bg-red-50 border border-red-300 rounded-md z-0 transform scale-100 group-hover:scale-100 transition-transform duration-200 origin-left shadow-sm" />
      <span className="relative z-10 inline-block">{children}</span>
    </span>
  )
}

export default PointerHighlight
