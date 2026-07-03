"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowUpRight } from "lucide-react";

// 20 different names for social proof
const withdrawalData = [
  { name: "James T.", amount: "$1.4M", coin: "BTC" },
  { name: "Sarah M.", amount: "$3.2M", coin: "ETH" },
  { name: "Michael R.", amount: "$850K", coin: "USDT" },
  { name: "Elena K.", amount: "$2.1M", coin: "BTC" },
  { name: "David L.", amount: "$1.1M", coin: "ETH" },
  { name: "Sophia W.", amount: "$5.0M", coin: "BTC" },
  { name: "Robert B.", amount: "$3.4M", coin: "USDT" },
  { name: "Emma C.", amount: "$2.8M", coin: "ETH" },
  { name: "William H.", amount: "$1.2M", coin: "BTC" },
  { name: "Olivia P.", amount: "$4.3M", coin: "ETH" },
  { name: "Daniel S.", amount: "$6.1M", coin: "USDT" },
  { name: "Ava N.", amount: "$2.2M", coin: "BTC" },
  { name: "Matthew G.", amount: "$1.5M", coin: "ETH" },
  { name: "Isabella F.", amount: "$2.8M", coin: "BTC" },
  { name: "Joseph D.", amount: "$8.9M", coin: "USDT" },
  { name: "Mia J.", amount: "$5.6M", coin: "ETH" },
  { name: "Christopher V.", amount: "$4.2M", coin: "BTC" },
  { name: "Charlotte Y.", amount: "$3.1M", coin: "ETH" },
  { name: "Andrew A.", amount: "$7.4M", coin: "USDT" },
  { name: "Amelia E.", amount: "$10.8M", coin: "BTC" },
];

export default function RecentWithdrawals() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start showing popups after a short delay
    const initialDelay = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Hide the popup after 4 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    // Show the next popup after 8 seconds (4s hidden, then show next)
    const nextTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % withdrawalData.length);
      setIsVisible(true);
    }, 8000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [isVisible, currentIndex]);

  const currentData = withdrawalData[currentIndex];

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white/90 dark:bg-navy-800/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-navy-100 dark:border-navy-700 flex items-center space-x-4 max-w-sm pointer-events-auto"
          >
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-navy-600 dark:text-navy-300">
                <span className="font-bold text-navy-900 dark:text-white">{currentData.name}</span> just withdrew
              </p>
              <div className="flex items-center space-x-1 mt-0.5">
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentData.amount}</span>
                <span className="text-xs font-medium text-navy-500 dark:text-navy-400 pl-1">in {currentData.coin}</span>
              </div>
            </div>
            <div className="text-xs text-navy-400 dark:text-navy-500 shrink-0">
              Just now
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
