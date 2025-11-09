"use client"

import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { PointerHighlight } from '@/components/ui/pointer-highlight'
import { ContainerScrollAnimation } from '@/components/ui/container-scroll-animation'
import { Spotlight } from '@/components/ui/spotlight'

export default function Hero() {
  // small SVG noise texture encoded at runtime to create a subtle grain overlay
  const noiseSvg = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
      <filter id='noise'><feTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>
      <rect width='100%' height='100%' filter='url(#noise)' opacity='0.4' />
    </svg>
  `);

  return (
  <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-visible pt-16">
      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="rgba(28, 146, 210, 0.3)"
      />

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-200 text-primary-600 text-sm font-medium shadow-sm">
            <Sparkles className="w-4 h-4" />
            Powered by NVIDIA NeMo
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative inline-block text-5xl sm:text-6xl lg:text-8xl font-bold mb-8 text-black"
        >
          {/* blurred blobs for the hero title (under the text) */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div
              className="absolute w-72 h-72 rounded-full opacity-55 filter blur-3xl mix-blend-screen"
              style={{
                left: '-3rem',
                top: '35%',
                background:
                  'radial-gradient(circle at 30% 30%, #1c92d2 0%, #f2fcfe 65%, transparent 80%)',
                transform: 'translateY(-8%)',
              }}
            />

            <div
              className="absolute w-56 h-56 rounded-full opacity-60 filter blur-2xl mix-blend-screen"
              style={{
                right: '-3rem',
                top: '8%',
                background:
                  'radial-gradient(circle at 70% 30%, #C4E0E5 0%, rgba(196,224,229,0.9) 60%, transparent 85%)',
                transform: 'translateY(-6%)',
              }}
            />

            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml;utf8,${noiseSvg}")`,
                backgroundSize: '200% 200%',
                mixBlendMode: 'overlay',
                pointerEvents: 'none',
              }}
            />
          </div>
          <PointerHighlight>
            <span className="text-black">Adjacent</span>
          </PointerHighlight>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl sm:text-2xl lg:text-3xl text-black mb-12 font-medium"
        >
          AI agents that listen, plan, and execute your next sprint — automatically
        </motion.p>
        {/* Animated container below the hero */}
        <div className="mt-8 relative z-50 -mb-20">
          <ContainerScrollAnimation />
        </div>

        {/* Decorative background removed per request */}
      </div>
    </section>
  )
}

