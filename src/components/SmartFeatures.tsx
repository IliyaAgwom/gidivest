"use client";

import { Bot, BarChart2, TrendingUp, Target } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "AI Investment Assistant",
    description: "Receive personalized recommendations, risk profiling, and market opportunity alerts tailored to your unique financial situation.",
    icon: <Bot className="w-6 h-6 text-emerald-500" />,
  },
  {
    title: "Portfolio Management",
    description: "Track performance in real-time, analyze asset allocation, and automatically rebalance your investments to stay on target.",
    icon: <BarChart2 className="w-6 h-6 text-emerald-500" />,
  },
  {
    title: "Market Intelligence",
    description: "Stay ahead with live market news, economic insights, trending assets, and expert investment forecasts.",
    icon: <TrendingUp className="w-6 h-6 text-emerald-500" />,
  },
  {
    title: "Goal-Based Investing",
    description: "Create structured plans for retirement, education funds, or property purchases with intelligent wealth projections.",
    icon: <Target className="w-6 h-6 text-emerald-500" />,
  },
];

export default function SmartFeatures() {
  return (
    <section id="features" className="py-20 bg-navy-50 dark:bg-navy-900/40 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-navy-900 dark:text-white mb-6">
              Smart Features for <br/> <span className="text-emerald-600 dark:text-emerald-400">Intelligent Investors</span>
            </h2>
            <p className="text-lg text-navy-600 dark:text-navy-300 mb-8 leading-relaxed">
              Martcapp combines advanced technology with financial expertise to give you a competitive edge. Our platform provides the tools you need to make informed decisions and grow your wealth automatically.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className="bg-white dark:bg-navy-800 p-6 rounded-2xl shadow-sm border border-navy-100 dark:border-navy-700">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h4 className="font-bold text-navy-900 dark:text-white mb-2">{feature.title}</h4>
                  <p className="text-sm text-navy-600 dark:text-navy-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* AI Assistant Mockup UI */}
            <div className="glass-card rounded-3xl p-8 bg-white/80 dark:bg-navy-800/80 backdrop-blur-xl border border-white dark:border-navy-700 shadow-2xl">
              <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-navy-100 dark:border-navy-700">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 dark:text-white text-lg">Martcapp AI</h3>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Online • Analyzing Markets</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-navy-50 dark:bg-navy-900/50 p-4 rounded-2xl rounded-tl-none inline-block max-w-[80%] border border-navy-100 dark:border-navy-700">
                  <p className="text-navy-800 dark:text-navy-200 text-sm leading-relaxed">
                    Based on your "Retirement 2045" goal, I recommend rebalancing your portfolio. Increasing ETF exposure by 5% could improve your risk-adjusted returns given current market volatility.
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <div className="bg-emerald-600 text-white p-4 rounded-2xl rounded-tr-none inline-block max-w-[80%] shadow-md">
                    <p className="text-sm leading-relaxed">
                      Show me the projected impact of this rebalance over the next 5 years.
                    </p>
                  </div>
                </div>

                <div className="bg-navy-50 dark:bg-navy-900/50 p-4 rounded-2xl rounded-tl-none max-w-[90%] border border-navy-100 dark:border-navy-700">
                  <p className="text-navy-800 dark:text-navy-200 text-sm mb-4">
                    Here is the 5-year projection comparison:
                  </p>
                  {/* Miniature projection chart */}
                  <div className="h-24 w-full bg-white dark:bg-navy-800 rounded-xl relative overflow-hidden flex items-end p-2 gap-2">
                     <div className="w-full h-[60%] bg-navy-200 dark:bg-navy-700 rounded-t-sm"></div>
                     <div className="w-full h-[70%] bg-emerald-400/50 rounded-t-sm"></div>
                     <div className="w-full h-[85%] bg-emerald-500 rounded-t-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
