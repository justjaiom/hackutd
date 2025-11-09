"use client";

import { motion } from "framer-motion";

export default function Integrations() {
  const logos = [
    { name: "Zoom", src: "/zoom-logo.png" },
    { name: "Google Meet", src: "/googlemeets.png" },
    { name: "Supabase", src: "/supabase-icon.png" },
    { name: "Slack", src: "/slack.png" },
    { name: "PowerPoint", src: "/Microsoft-PowerPoint-Logo.png" },
    { name: "PDF", src: "/pdf.png" },
    { name: "Google Calendar", src: "/Google_Calendar_icon_(2020).svg.png" },
  ];

  // Duplicate logos for seamless scrolling
  const duplicatedLogos = [...logos, ...logos];

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

        {/* Row scrolling left */}
        <div className="relative overflow-hidden mb-8">
          {/* Fade overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
          
          <div className="flex animate-scroll-left">
            {duplicatedLogos.map((logo, idx) => (
              <div
                key={`left-${idx}`}
                className="flex-shrink-0 w-32 h-20 mx-4 bg-white rounded-lg flex items-center justify-center"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="object-contain w-24 h-12"
                  aria-hidden={idx >= logos.length}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row scrolling right */}
        <div className="relative overflow-hidden">
          {/* Fade overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
          
          <div className="flex animate-scroll-right">
            {duplicatedLogos.map((logo, idx) => (
              <div
                key={`right-${idx}`}
                className="flex-shrink-0 w-32 h-20 mx-4 bg-white rounded-lg flex items-center justify-center"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="object-contain w-24 h-12"
                  aria-hidden={idx >= logos.length}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Need a custom integration?</p>
          <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200">
            Request Integration
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 20s linear infinite;
        }

        .animate-scroll-right {
          animation: scroll-right 20s linear infinite;
        }
      `}</style>
    </section>
  );
}