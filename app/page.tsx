'use client'

import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
// Tracks removed per request
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Integrations from '@/components/Integrations'
import Testimonials from '@/components/Testimonials'
import Pricing from '@/components/Pricing'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 overflow-hidden">
      <Navbar />
      <div className="fixed inset-0 bg-gradient-to-b from-sky-50/50 via-white to-orange-50/30 pointer-events-none" />
      <div className="relative z-10">
        <Hero />

        {/* How It Works directly under hero with same gradient background */}
        <div className="relative bg-gradient-to-b from-sky-50/50 via-white to-orange-50/30">
          <HowItWorks />
        </div>
        <Features />
        <Integrations />
        <Testimonials />
        <Pricing />
        <Footer />
      </div>
    </main>
  )
}

