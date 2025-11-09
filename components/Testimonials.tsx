"use client";

import { motion } from "framer-motion";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "Adjacent cut our post-meeting follow-ups by 70%. It's like having a virtual project manager that never sleeps. The AI understands context better than most humans I work with.",
      name: "Sarah Chen",
      designation: "Project Lead, Marketing Team",
      src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=3687&auto=format&fit=crop",
    },
    {
      quote:
        "Finally, all our tasks from documents and meetings are in one place. No more lost action items or forgotten deadlines. This tool has transformed how we work.",
      name: "Michael Rodriguez",
      designation: "PM, Software Team",
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3687&auto=format&fit=crop",
    },
    {
      quote:
        "The AI suggestions are surprisingly accurate. It actually saves me time every day and helps me prioritize what matters most. I can't imagine going back to our old workflow.",
      name: "Emily Watson",
      designation: "Team Lead, Design Studio",
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of teams who have transformed their workflow with Adjacent
          </p>
        </motion.div>

        <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
      </div>
    </section>
  );
}
