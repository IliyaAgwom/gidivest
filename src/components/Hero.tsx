"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import HeroChart from "./HeroChart";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 md:pt-32 pb-20 lg:pb-32 px-4 sm:px-6 lg:px-8">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10"
        >
          <div className="inline-flex items-center space-x-2 bg-white/10 dark:bg-navy-800/50 backdrop-blur-md px-4 py-2 rounded-full border border-navy-200 dark:border-navy-700 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-medium text-navy-700 dark:text-navy-200">The New Standard in Crypto Trading</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-navy-900 dark:text-white mb-6 leading-tight">
            Dominate the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Crypto Market</span>
          </h1>
          
          <p className="text-lg md:text-xl text-navy-600 dark:text-navy-300 mb-8 max-w-2xl leading-relaxed">
            Access real-time market insights, secure high-yield crypto investments, and intelligent portfolio management—all in one elite platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center space-x-2 group">
              <span>Start Investing</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white dark:bg-navy-800 text-navy-900 dark:text-white border border-navy-200 dark:border-navy-700 hover:bg-navy-50 dark:hover:bg-navy-700 rounded-xl font-semibold transition-all">
              Explore Opportunities
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 hidden lg:block"
        >
          {/* Live Crypto Chart */}
          <HeroChart />
        </motion.div>
      </div>
    </section>
  );
}
