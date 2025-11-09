"use client"

import { motion } from 'framer-motion'

export default function Features() {
  const features = [
    {
      title: 'Multi-Format Support',
      desc: 'Meetings, PDFs, slides.',
    },
    {
      title: 'Smart Task Extraction',
      desc: 'AI reads, understands, and summarizes content.',
    },
    {
      title: 'Agile-Ready Dashboard',
      desc: 'Kanban and priority views for easy project tracking.',
    },
    {
      title: 'Collaboration & Assignment',
      desc: 'Automatic suggestions or manual assignment.',
    },
    {
      title: 'Real-Time Updates',
      desc: 'Syncs tasks as content is added or edited.',
    },
  ]

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-center mb-8"
        >
          Features
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f) => (
            <div key={f.title} className="p-6 bg-white/60 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-medium mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
