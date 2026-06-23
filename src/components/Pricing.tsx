"use client";

import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-navy-50 dark:bg-navy-900/40 border-t border-navy-100 dark:border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 dark:text-white mb-4">
            Transparent Pricing Plans
          </h2>
          <p className="text-lg text-navy-600 dark:text-navy-300">
            Choose the perfect plan that aligns with your financial goals and investment volume. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-navy-800 p-8 rounded-3xl border border-navy-100 dark:border-navy-700 shadow-sm"
          >
            <h3 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Starter</h3>
            <p className="text-navy-600 dark:text-navy-400 mb-6">Perfect for beginning investors.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-navy-900 dark:text-white">$0</span>
              <span className="text-navy-600 dark:text-navy-400">/mo</span>
            </div>
            <ul className="space-y-4 mb-8">
              {["Basic portfolio tools", "Access to stocks & ETFs", "Standard market insights", "Email support", "0.25% management fee"].map((item, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                  <span className="text-navy-700 dark:text-navy-300">{item}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-xl font-semibold bg-navy-100 dark:bg-navy-700 text-navy-900 dark:text-white hover:bg-navy-200 dark:hover:bg-navy-600 transition-colors">
              Get Started
            </button>
          </motion.div>

          {/* Professional Plan */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-navy-900 dark:bg-navy-800 p-8 rounded-3xl border-2 border-emerald-500 shadow-xl relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
            <p className="text-navy-300 mb-6">Advanced tools for active wealth building.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-white">$29</span>
              <span className="text-navy-300">/mo</span>
            </div>
            <ul className="space-y-4 mb-8">
              {["Advanced analytics & charts", "AI investment recommendations", "Real estate & crypto access", "Priority 24/7 support", "0.15% management fee"].map((item, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-3 shrink-0" />
                  <span className="text-white">{item}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-xl font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
              Upgrade to Pro
            </button>
          </motion.div>

          {/* Elite Wealth Plan */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-navy-800 p-8 rounded-3xl border border-navy-100 dark:border-navy-700 shadow-sm"
          >
            <h3 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Elite Wealth</h3>
            <p className="text-navy-600 dark:text-navy-400 mb-6">For high-net-worth portfolios.</p>
            <div className="mb-8">
              <span className="text-4xl font-bold text-navy-900 dark:text-white">$199</span>
              <span className="text-navy-600 dark:text-navy-400">/mo</span>
            </div>
            <ul className="space-y-4 mb-8">
              {["Dedicated human advisor", "Premium Private Equity deals", "Exclusive market intelligence", "Tax-loss harvesting", "0.05% management fee"].map((item, i) => (
                <li key={i} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 shrink-0" />
                  <span className="text-navy-700 dark:text-navy-300">{item}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-xl font-semibold bg-navy-100 dark:bg-navy-700 text-navy-900 dark:text-white hover:bg-navy-200 dark:hover:bg-navy-600 transition-colors">
              Contact Sales
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
