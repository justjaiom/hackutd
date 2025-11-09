"use client"

import React, { useEffect, useRef, useState } from "react"

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode
}

export function ScrollVelocityContainer({ children, className, ...rest }: ContainerProps) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  )
}

type RowProps = {
  children?: React.ReactNode
  baseVelocity?: number // higher means faster
  direction?: 1 | -1
  overlap?: number // pixels to overlap items by
}

// JS-driven marquee that measures the content and duplicates it until it fills
// the container so the animation is seamless. Adds optional overlap between items.
export function ScrollVelocityRow({
  children,
  baseVelocity = 10,
  direction = 1,
  overlap = 8,
}: RowProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [copies, setCopies] = useState(1)

  useEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    const measure = () => {
      const containerWidth = container.clientWidth || 0
      const contentWidth = track.scrollWidth || 0

      // If content width is 0 (no children yet), skip
      if (contentWidth === 0) return

      // We want enough copies so that contentWidth * copies >= containerWidth * 2
      // (we translate by 50% in keyframes)
      const needed = Math.max(1, Math.ceil((containerWidth * 2) / contentWidth))
      setCopies(needed)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(container)
    ro.observe(track)
    return () => ro.disconnect()
  }, [children])

  // We'll drive scroll via requestAnimationFrame to allow seamless looping
  // and avoid keyframe teleport/retrace issues when content sizes change.
  const trackStyle: React.CSSProperties = {
    display: "flex",
    gap: `-${overlap}px`,
    alignItems: "center",
    whiteSpace: "nowrap",
    willChange: "transform",
  }

  const wrapperStyle: React.CSSProperties = {
    overflow: "hidden",
  }

  // Render copies+1 (to ensure seamless loop)
  const blocks: React.ReactNode[] = []
  for (let i = 0; i < copies + 1; i++) {
    blocks.push(
      <div key={i} className="sv-block" style={{ display: "inline-flex" }}>
        {children}
      </div>
    )
  }

  // Use RAF to update transform continuously. We measure the width of a
  // single block and use modulo arithmetic so the visual track never
  // jumps/teleports when it loops.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let mounted = true
    let last = performance.now()
    let pos = 0
    let rafId: number | null = null

    const getSingleBlockWidth = () => {
      const b = track.querySelector<HTMLDivElement>('.sv-block')
      return b ? b.offsetWidth : 0
    }

    const step = (time: number) => {
      if (!mounted) return
      const dt = (time - last) / 1000
      last = time

      // speed scaling: baseVelocity is a relative speed; scale to px/sec
      const speedPxPerSec = Math.max(1, Math.abs(baseVelocity)) * 20
      const dirFactor = direction === -1 ? -1 : 1
      pos += dt * speedPxPerSec * dirFactor

      const bW = getSingleBlockWidth()
      const loopWidth = bW * (copies || 1)

      if (loopWidth > 0) {
        // normalize into [0, loopWidth)
        pos = ((pos % loopWidth) + loopWidth) % loopWidth
        track.style.transform = `translateX(${-pos}px)`
      }

      rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)

    return () => {
      mounted = false
      if (rafId != null) cancelAnimationFrame(rafId)
      if (track) track.style.transform = ''
    }
  }, [copies, baseVelocity, direction, children])

  return (
    <div ref={containerRef} style={wrapperStyle} className="w-full">
      <div ref={trackRef} style={trackStyle} aria-hidden>
        {blocks}
      </div>
    </div>
  )
}

export default ScrollVelocityContainer
