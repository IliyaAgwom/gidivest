"use client";

import { Building2, LineChart, Bitcoin, PieChart, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const investmentTypes = [
  {
    title: "Stocks",
    description: "Global stock market access with real-time trading and portfolio diversification.",
    icon: <LineChart className="w-8 h-8 text-emerald-500" />,
  },
  {
    title: "Real Estate",
    description: "Fractional property investments providing rental income and asset appreciation.",
    icon: <Building2 className="w-8 h-8 text-navy-500 dark:text-navy-400" />,
  },
  {
    title: "Cryptocurrency",
    description: "Secure crypto investing with advanced market analytics and digital asset management.",
    icon: <Bitcoin className="w-8 h-8 text-gold-500" />,
  },
  {
    title: "Mutual Funds & ETFs",
    description: "Professionally managed, risk-balanced options for diversified portfolios.",
    icon: <PieChart className="w-8 h-8 text-emerald-600" />,
  },
  {
    title: "Fixed Income",
    description: "Stable returns through bonds and treasury investments for lower-risk profiles.",
    icon: <ShieldCheck className="w-8 h-8 text-navy-600 dark:text-navy-300" />,
  }
];

export default function Investments() {
  return (
    <section id="investments" className="py-20 bg-white dark:bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 dark:text-white mb-4">
            Diverse Investment Opportunities
          </h2>
          <p className="text-lg text-navy-600 dark:text-navy-300">
            Build a robust, diversified portfolio with access to multiple asset classes, expertly curated for optimal growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {investmentTypes.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card bg-navy-50 dark:bg-navy-800 rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 border border-navy-100 dark:border-navy-700"
            >
              <div className="w-16 h-16 bg-white dark:bg-navy-900 rounded-xl flex items-center justify-center shadow-sm mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-navy-900 dark:text-white mb-3">
                {item.title}
              </h3>
              <p className="text-navy-600 dark:text-navy-300 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
