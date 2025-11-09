"use client";

import { motion } from "framer-motion";
import { Check, Zap, Building2, Rocket } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      icon: Rocket,
      bullets: [
        "Up to 5 uploads / month",
        "Basic AI extraction",
        "Kanban dashboard",
        "Community support",
      ],
      featured: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      icon: Zap,
      bullets: [
        "Unlimited uploads",
        "Advanced AI suggestions",
        "Slack/email integrations",
        "Priority support",
        "Custom workflows",
      ],
      featured: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      icon: Building2,
      bullets: [
        "SSO & analytics",
        "Dedicated support",
        "Custom solutions",
        "SLA guarantees",
        "Team training",
      ],
      featured: false,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your team's needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-2xl ${
                  plan.featured
                    ? "bg-gradient-to-b from-blue-600 to-cyan-600 text-white shadow-2xl scale-105 border-2 border-blue-400"
                    : "bg-white border-2 border-gray-200"
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <Icon
                    className={`w-12 h-12 mx-auto mb-4 ${
                      plan.featured ? "text-white" : "text-blue-600"
                    }`}
                  />
                  <h3
                    className={`text-2xl font-bold mb-2 ${
                      plan.featured ? "text-white" : "text-black"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className={`text-5xl font-bold ${
                        plan.featured ? "text-white" : "text-black"
                      }`}
                    >
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span
                        className={`text-sm ${
                          plan.featured ? "text-blue-100" : "text-gray-600"
                        }`}
                      >
                        /{plan.period}
                      </span>
                    )}
                  </div>
                  {plan.price === "Custom" && (
                    <span
                      className={`text-sm ${
                        plan.featured ? "text-blue-100" : "text-gray-600"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          plan.featured ? "text-blue-200" : "text-green-500"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          plan.featured ? "text-blue-50" : "text-gray-700"
                        }`}
                      >
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                    plan.featured
                      ? "bg-white text-blue-600 hover:bg-blue-50 shadow-lg"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {plan.name === "Free" ? "Start Free" : "Contact Sales"}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
