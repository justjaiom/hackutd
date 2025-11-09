"use client"

import { motion } from 'framer-motion'

export default function Integrations() {
  const items = [
    'Zoom & Google Meet',
    'Supabase',
    'Slack / Email',
    'PowerPoint & PDF',
  ]

  return (
    <section className="py-16 bg-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-center mb-8"
        >
          Integrations
        </motion.h2>

        <motion.ul
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center"
        >
          {items.map((it) => (
            <li key={it} className="p-4 rounded-lg border border-gray-100 text-sm">
              {it}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
