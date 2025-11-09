"use client"

import { motion } from 'framer-motion'

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      bullets: ['Up to 5 uploads / month', 'Basic AI extraction', 'Kanban dashboard'],
    },
    {
      name: 'Pro',
      price: '$29',
      bullets: ['Unlimited uploads', 'Advanced AI suggestions', 'Slack/email integrations'],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      bullets: ['SSO & analytics', 'Dedicated support', 'Custom solutions'],
    },
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
          Pricing
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {plans.map((p) => (
            <div key={p.name} className="p-6 rounded-2xl border border-gray-100 bg-white/60 text-center">
              <h3 className="text-lg font-medium mb-2">{p.name}</h3>
              <div className="text-2xl font-bold mb-4">{p.price}</div>
              <ul className="space-y-2 mb-4 text-sm text-gray-600">
                {p.bullets.map((b) => (
                  <li key={b}>• {b}</li>
                ))}
              </ul>
              <a className="inline-block px-4 py-2 rounded-md bg-primary text-white" href="#">
                {p.name === 'Free' ? 'Start Free' : 'Contact Sales'}
              </a>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
