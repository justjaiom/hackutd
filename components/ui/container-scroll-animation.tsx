"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import React from "react"

type Props = {
  src?: string
  alt?: string
  className?: string
  children?: React.ReactNode
}

export function ContainerScrollAnimation({
  src = "/kanban.jpg",
  alt = "kanban",
  className,
  children,
}: Props) {
  return (
    <div
      className={cn(
        "relative w-full max-w-4xl mx-auto overflow-hidden rounded-lg z-50",
        className,
      )}
    >
      <motion.div
        className="relative h-64 sm:h-80 md:h-96 w-full"
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Image src={src} alt={alt} fill className="object-cover" />
        {/* optional overlay content */}
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
