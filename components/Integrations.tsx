"use client";

import { motion } from "framer-motion";
import { Video, Database, MessageSquare, FileText, Calendar, Code } from "lucide-react";

export default function Integrations() {
  const items = [
    {
      name: "Zoom & Google Meet",
      icon: Video,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      name: "Supabase",
      icon: Database,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      name: "Slack & Email",
      icon: MessageSquare,
      gradient: "from-purple-500 to-pink-600",
    },
    {
      name: "PowerPoint & PDF",
      icon: FileText,
      gradient: "from-orange-500 to-red-600",
    },
    {
      name: "Calendar Apps",
      icon: Calendar,
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      name: "Developer APIs",
      icon: Code,
      gradient: "from-indigo-500 to-purple-600",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Seamless Integrations
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with the tools you already use every day
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-2xl bg-white border-2 border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                <div className="relative flex flex-col items-center text-center">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {item.name}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-4">
            Need a custom integration?
          </p>
          <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200">
            Request Integration
          </button>
        </motion.div>
      </div>
    </section>
  );
}
