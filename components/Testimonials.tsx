"use client";

import { motion } from "framer-motion";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "Really like the idea, can't wait to see how you guys build it!",
      name: 'Chris "The Wiz"',
      designation: "Project Research Engineer",
      src: "/pickone.png",
    },
    {
      quote:
        "I like how you use the different agents to go about solving the challenge!",
      name: "Muthu Venkataraman",
      designation: "Data Science Group Manager, VP",
      src: "/picktwo.png",
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
