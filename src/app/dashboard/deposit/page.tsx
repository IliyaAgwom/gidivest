"use client";

import { useState } from "react";
import { Copy, CheckCircle2, Bitcoin } from "lucide-react";

export default function DepositPage() {
  const [copied, setCopied] = useState(false);
  
  // These would typically come from the database (AdminSettings)
  const cryptoAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  
  const handleCopy = () => {
    navigator.clipboard.writeText(cryptoAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Deposit Funds</h1>
        <p className="text-navy-600 dark:text-navy-400">Add funds to your portfolio via cryptocurrency transfer.</p>
      </div>

      <div className="bg-white dark:bg-navy-800 p-8 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm">
        <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-6">1. Send Cryptocurrency</h3>
        
        <div className="flex flex-col items-center justify-center p-6 bg-navy-50 dark:bg-navy-900 rounded-xl border border-navy-100 dark:border-navy-700 mb-8">
          <div className="w-48 h-48 bg-white p-2 rounded-lg mb-4">
             {/* Placeholder for QR Code */}
             <div className="w-full h-full border-4 border-navy-900 rounded flex items-center justify-center bg-gray-100">
               <span className="text-xs font-bold text-gray-500">QR CODE</span>
             </div>
          </div>
          
          <p className="text-sm font-medium text-navy-600 dark:text-navy-400 mb-2">Send Bitcoin (BTC) to this address:</p>
          <div className="flex items-center space-x-2 bg-white dark:bg-navy-800 px-4 py-2 rounded-lg border border-navy-200 dark:border-navy-700 w-full max-w-md">
            <Bitcoin className="w-5 h-5 text-gold-500 shrink-0" />
            <code className="text-sm text-navy-900 dark:text-white flex-1 truncate">{cryptoAddress}</code>
            <button onClick={handleCopy} className="p-2 hover:bg-navy-50 dark:hover:bg-navy-700 rounded-md transition-colors">
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-navy-500" />}
            </button>
          </div>
          <p className="text-xs text-red-500 mt-3 font-medium">Send ONLY Bitcoin (BTC) to this address. Other assets will be lost.</p>
        </div>

        <hr className="border-navy-200 dark:border-navy-700 mb-8" />

        <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-6">2. Confirm Deposit</h3>
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">Amount Sent (in USD value)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-navy-500">$</span>
              <input
                type="number"
                className="block w-full pl-8 pr-3 py-3 border border-navy-200 dark:border-navy-700 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">Transaction Hash (TxID)</label>
            <input
              type="text"
              className="block w-full px-4 py-3 border border-navy-200 dark:border-navy-700 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="e.g. f4184fc596403b9d638783cf57adfe4c..."
            />
            <p className="text-xs text-navy-500 mt-2">Providing the transaction hash helps us verify your deposit faster.</p>
          </div>

          <button className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors mt-4">
            Submit Deposit Request
          </button>
        </form>
      </div>
    </div>
  );
}
