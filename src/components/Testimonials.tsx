"use client";

import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Tech Executive",
    content: "HughVest completely transformed how I manage my wealth. The AI recommendations have consistently outperformed my previous advisor, and the interface is incredibly intuitive.",
    growth: "+24.5%",
    timeframe: "in 12 months",
    image: "SJ"
  },
  {
    name: "Hugh Jackman",
    role: "CEO & Founder",
    content: "I built HughVest because I wanted a platform that treated every investor with the luxury and security of a private wealth manager. Watching our users achieve their dreams is the ultimate return on investment.",
    growth: "$500M+",
    timeframe: "Assets Managed",
    imageUrl: "/hugh.jpg" // The user will place the picture here
  },
  {
    name: "Elena Rodriguez",
    role: "Freelance Designer",
    content: "As someone new to investing, HughVest's education hub and automated portfolio rebalancing gave me the confidence to start building my financial future securely.",
    growth: "+15.8%",
    timeframe: "in 9 months",
    image: "ER"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-navy-50 dark:bg-navy-900/50 relative overflow-hidden border-y border-navy-100 dark:border-navy-800">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-gold-500/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-navy-900 dark:text-white mb-6">
            Trusted by the <span className="text-emerald-600 dark:text-emerald-400">Best</span>
          </h2>
          <p className="text-xl text-navy-600 dark:text-navy-300">
            Join thousands of individuals who are accelerating their wealth generation with HughVest's intelligent platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => {
            const isCenter = idx === 1; // Highlight the middle testimonial (Hugh)

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className={`relative p-8 rounded-3xl border flex flex-col h-full transition-transform duration-500 hover:-translate-y-2 ${
                  isCenter 
                    ? "bg-navy-900 border-emerald-500 shadow-2xl shadow-emerald-500/20 lg:-mt-4 lg:mb-4" 
                    : "bg-white dark:bg-navy-800 border-navy-200 dark:border-navy-700 shadow-lg"
                }`}
              >
                <div className="absolute top-6 right-8">
                  <Quote className={`w-10 h-10 opacity-20 ${isCenter ? 'text-emerald-400' : 'text-navy-900 dark:text-white'}`} />
                </div>

                <div className="flex space-x-1 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 fill-current ${isCenter ? 'text-gold-400' : 'text-gold-500'}`} />
                  ))}
                </div>
                
                <p className={`text-lg leading-relaxed mb-10 flex-grow ${isCenter ? 'text-navy-100' : 'text-navy-700 dark:text-navy-200'}`}>
                  "{t.content}"
                </p>
                
                <div className={`flex items-center justify-between pt-6 border-t ${isCenter ? 'border-navy-700' : 'border-navy-100 dark:border-navy-700'}`}>
                  <div className="flex items-center space-x-4">
                    {t.imageUrl ? (
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-500 relative bg-navy-800">
                         {/* Fallback image style in case actual image is missing */}
                         <div className="absolute inset-0 flex items-center justify-center text-xs text-white">Hugh</div>
                         {/* We use an img tag instead of next/image just to prevent build errors if the user forgets to add the file, but next/image is better. We'll use a standard img tag for safety here */}
                         <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover relative z-10" />
                      </div>
                    ) : (
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner ${isCenter ? 'bg-emerald-500' : 'bg-navy-800 dark:bg-navy-700'}`}>
                        {t.image}
                      </div>
                    )}
                    <div>
                      <h4 className={`font-bold ${isCenter ? 'text-white' : 'text-navy-900 dark:text-white'}`}>{t.name}</h4>
                      <p className={`text-sm ${isCenter ? 'text-emerald-400' : 'text-navy-500 dark:text-navy-400'}`}>{t.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-xl ${isCenter ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{t.growth}</p>
                    <p className={`text-xs ${isCenter ? 'text-navy-300' : 'text-navy-500 dark:text-navy-400'}`}>{t.timeframe}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
