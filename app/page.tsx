'use client'

import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Tracks from '@/components/Tracks'
import Overview from '@/components/Overview'
import HowItWorks from '@/components/HowItWorks'
import Agents from '@/components/Agents'
import Vision from '@/components/Vision'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <Navbar />
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20 pointer-events-none" />
      <div className="relative z-10">
        <Hero />
        <div id="overview">
          <Tracks />
          <Overview />
        </div>
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <div id="agents">
          <Agents />
        </div>
        <div id="vision">
          <Vision />
        </div>
        <Footer />
      </div>
    </main>
  )
}

