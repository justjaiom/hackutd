"use client"
import Image from "next/image"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"
import React, { useRef } from "react"

type Props = {
  src?: string
  alt?: string
  className?: string
  children?: React.ReactNode
  showImage?: boolean
  imageClassName?: string
  useNativeImg?: boolean
  titleComponent?: React.ReactNode
}

export function ContainerScrollAnimation({
  src = "/kanban.jpg",
  alt = "kanban",
  className,
  children,
  showImage = true,
  imageClassName,
  useNativeImg = false,
  titleComponent,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  // how tilted the card starts (degrees)
  const START_TILT = 40

  // scroll-driven tilt: START_TILT -> 0 as the element scrolls into view
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] })
  const scrollTilt = useTransform(scrollYProgress, [0, 1], [START_TILT, 0])
  const scrollTiltSpring = useSpring(scrollTilt, { stiffness: 90, damping: 20 })

  return (
    <div
      ref={containerRef}
      style={{ perspective: 1200 }}
      className={cn(
        "relative w-full max-w-4xl mx-auto overflow-hidden rounded-lg z-50",
        className,
      )}
    >
      {titleComponent ? (
        <div className="absolute inset-x-0 top-6 z-20 flex justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-4xl">{titleComponent}</div>
        </div>
      ) : null}

      <motion.div
        className="relative h-[32rem] sm:h-[40rem] md:h-[48rem] w-full"
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.0, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {showImage ? (
          <motion.div
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d", rotateX: scrollTiltSpring }}
            initial={{ rotateX: START_TILT }}
            whileInView={{ rotateX: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {useNativeImg ? (
              <img src={src} alt={alt} className={cn("absolute inset-0 w-full h-full object-cover", imageClassName)} />
            ) : (
              <Image src={src} alt={alt} fill className={cn("object-cover", imageClassName)} />
            )}
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="w-full h-full rounded-md overflow-hidden bg-gradient-to-r from-indigo-50 via-indigo-100 to-purple-50 flex items-center justify-center">
              <div className="text-center px-6 py-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Hero visual disabled</h3>
                <p className="text-sm text-gray-600">Image is turned off  pass <code>showImage</code> or children to display content here.</p>
              </div>
            </div>
          </div>
        )}

        {children ? (
          <div className="absolute inset-0 flex items-end p-6">
            <div className="bg-black/50 text-white rounded-md px-4 py-2">{children}</div>
          </div>
        ) : null}
      </motion.div>
    </div>
  )
}

export default ContainerScrollAnimation

// alias for other imports expecting ContainerScroll
export const ContainerScroll = ContainerScrollAnimation
