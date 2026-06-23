"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Shield, BarChart3, Activity } from "lucide-react";

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
            <span className="text-sm font-medium text-navy-700 dark:text-navy-200">The New Standard in Wealth Management</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-navy-900 dark:text-white mb-6 leading-tight">
            Build Wealth with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Confidence</span>
          </h1>
          
          <p className="text-lg md:text-xl text-navy-600 dark:text-navy-300 mb-8 max-w-2xl leading-relaxed">
            Access diversified investment opportunities, real-time market insights, and intelligent portfolio management—all in one secure platform.
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
          {/* Dashboard Mockup Component */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden bg-white/60 dark:bg-navy-800/60 backdrop-blur-xl border border-white/40 dark:border-navy-700/50 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-navy-500 dark:text-navy-400 font-medium">Total Portfolio Value</p>
                <h3 className="text-3xl font-bold text-navy-900 dark:text-white mt-1">$542,890.00</h3>
              </div>
              <div className="flex items-center space-x-1 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold">+12.4%</span>
              </div>
            </div>

            {/* Mock Chart Area */}
            <div className="h-48 w-full bg-gradient-to-t from-emerald-500/10 to-transparent rounded-xl flex items-end justify-between px-2 pb-2 relative">
               {/* Decorative chart lines */}
               <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,80 Q20,70 40,50 T80,20 L100,10 L100,100 L0,100 Z" fill="url(#grad)" opacity="0.1"/>
                  <path d="M0,80 Q20,70 40,50 T80,20 L100,10" fill="none" stroke="#10b981" strokeWidth="2" />
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
               </svg>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-navy-50 dark:bg-navy-900/50 p-4 rounded-xl border border-navy-100 dark:border-navy-700">
                 <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-navy-600 dark:text-navy-300">Daily Profit</span>
                 </div>
                 <p className="text-xl font-bold text-navy-900 dark:text-white">+$1,240.50</p>
              </div>
              <div className="bg-navy-50 dark:bg-navy-900/50 p-4 rounded-xl border border-navy-100 dark:border-navy-700">
                 <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-gold-500" />
                    <span className="text-sm font-medium text-navy-600 dark:text-navy-300">Risk Score</span>
                 </div>
                 <p className="text-xl font-bold text-navy-900 dark:text-white">Moderate (4.2)</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
