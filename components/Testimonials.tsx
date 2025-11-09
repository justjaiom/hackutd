"use client"

import { motion } from 'framer-motion'

export default function Testimonials() {
  const quotes = [
    {
      q: 'Adjacent cut our post-meeting follow-ups by 70%. It’s like having a virtual project manager.',
      who: 'Project Lead, Marketing Team',
    },
    {
      q: 'Finally, all our tasks from documents and meetings are in one place. No more lost action items.',
      who: 'PM, Software Team',
    },
    {
      q: 'The AI suggestions are surprisingly accurate. It actually saves me time every day.',
      who: 'Team Lead, Design Studio',
    },
  ]

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-center mb-8"
        >
          Testimonials
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {quotes.map((t, i) => (
            <blockquote key={i} className="p-6 rounded-2xl border border-gray-100 bg-white/60">
              <p className="text-gray-800">“{t.q}”</p>
              <footer className="mt-4 text-sm text-gray-600">— {t.who}</footer>
            </blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
