'use client'

import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Agents from '@/components/Agents'
import Vision from '@/components/Vision'
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
        <section id="overview">
          <Hero />
        </section>

        {/* Features Section - with generous spacing */}
        <section id="features" className="relative">
          <Features />
        </section>

        {/* How It Works - Timeline Section */}
        <section id="how-it-works" className="relative bg-white">
          <HowItWorks />
        </section>

        {/* Agents Section */}
        <section id="agents" className="relative">
          <Agents />
        </section>

        {/* Vision Section */}
        <section id="vision" className="relative bg-white">
          <Vision />
        </section>

        {/* Integrations Section */}
        <section id="integrations" className="relative">
          <Integrations />
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="relative">
          <Testimonials />
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="relative">
          <Pricing />
        </section>

        {/* CTA Section */}
        <section id="cta" className="relative">
          <CTA />
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </main>
  )
}

