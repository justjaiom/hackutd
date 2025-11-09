'use client'

import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Integrations from '@/components/Integrations'
import Testimonials from '@/components/Testimonials'
import Pricing from '@/components/Pricing'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'
import FloatingParticles from '@/components/ui/floating-particles'

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 overflow-hidden">
      <Navbar />
      
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-50/30 via-white to-cyan-50/20 pointer-events-none -z-10" />
      
      {/* Floating Particles */}
      <FloatingParticles />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <Hero />

        {/* Features Section - with generous spacing */}
        <div className="relative">
          <Features />
        </div>

        {/* How It Works - Timeline Section */}
        <div className="relative bg-white">
          <HowItWorks />
        </div>

        {/* Integrations Section */}
        <div className="relative">
          <Integrations />
        </div>

        {/* Testimonials Section */}
        <div className="relative">
          <Testimonials />
        </div>

        {/* Pricing Section */}
        <div className="relative">
          <Pricing />
        </div>

        {/* CTA Section */}
        <div className="relative">
          <CTA />
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </main>
  )
}

