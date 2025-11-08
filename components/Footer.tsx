'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold gradient-text mb-2">Adjacent</h3>
            <p className="text-gray-400 text-sm">
              AI-Powered Collaborative Project Manager
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <a
              href="#"
              className="w-10 h-10 rounded-lg bg-gray-900/50 border border-gray-800/50 flex items-center justify-center hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all duration-300"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5 text-gray-400" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-lg bg-gray-900/50 border border-gray-800/50 flex items-center justify-center hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5 text-gray-400" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-lg bg-gray-900/50 border border-gray-800/50 flex items-center justify-center hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all duration-300"
              aria-label="Email"
            >
              <Mail className="w-5 h-5 text-gray-400" />
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 pt-8 border-t border-gray-800/50 text-center text-sm text-gray-500"
        >
          <p>© 2024 Adjacent. Built for HackUTD.</p>
        </motion.div>
      </div>
    </footer>
  )
}

