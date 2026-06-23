"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowUpRight } from "lucide-react";

// 20 different names for social proof
const withdrawalData = [
  { name: "James T.", amount: "$4,500", coin: "BTC" },
  { name: "Sarah M.", amount: "$12,200", coin: "ETH" },
  { name: "Michael R.", amount: "$890", coin: "USDT" },
  { name: "Elena K.", amount: "$5,400", coin: "BTC" },
  { name: "David L.", amount: "$2,100", coin: "ETH" },
  { name: "Sophia W.", amount: "$15,000", coin: "BTC" },
  { name: "Robert B.", amount: "$3,450", coin: "USDT" },
  { name: "Emma C.", amount: "$7,800", coin: "ETH" },
  { name: "William H.", amount: "$1,250", coin: "BTC" },
  { name: "Olivia P.", amount: "$9,300", coin: "ETH" },
  { name: "Daniel S.", amount: "$6,100", coin: "USDT" },
  { name: "Ava N.", amount: "$4,200", coin: "BTC" },
  { name: "Matthew G.", amount: "$11,500", coin: "ETH" },
  { name: "Isabella F.", amount: "$2,800", coin: "BTC" },
  { name: "Joseph D.", amount: "$8,900", coin: "USDT" },
  { name: "Mia J.", amount: "$5,600", coin: "ETH" },
  { name: "Christopher V.", amount: "$14,200", coin: "BTC" },
  { name: "Charlotte Y.", amount: "$3,100", coin: "ETH" },
  { name: "Andrew A.", amount: "$7,400", coin: "USDT" },
  { name: "Amelia E.", amount: "$10,800", coin: "BTC" },
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
