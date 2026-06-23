"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Clock, Zap, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WithdrawPage() {
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [cryptoType, setCryptoType] = useState("BTC");
  const [walletAddress, setWalletAddress] = useState("");
  const [withdrawalType, setWithdrawalType] = useState("STANDARD");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        setUserBalance(data.walletBalance || 0);
        setLoading(false);
      });
  }, []);

  const parsedAmount = parseFloat(amount) || 0;
  const expressFee = parsedAmount * 0.4;
  const totalRequired = withdrawalType === "EXPRESS" ? parsedAmount + expressFee : parsedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!parsedAmount || parsedAmount <= 0) {
      setError("Please enter a valid amount to withdraw.");
      return;
    }

    if (!walletAddress) {
      setError("Please provide a receiving wallet address.");
      return;
    }

    if (totalRequired > userBalance) {
      setError(`Insufficient balance. You need $${totalRequired.toLocaleString("en-US", { minimumFractionDigits: 2 })} to cover this withdrawal and associated fees.`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/withdraw/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          cryptoType,
          walletAddress,
          withdrawalType,
          totalRequired,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit withdrawal request.");
      }

      setSuccess(`Withdrawal request submitted successfully. Processing time: ${withdrawalType === "EXPRESS" ? "24 Hours" : "60 Days"}`);
      setAmount("");
      setWalletAddress("");
      
      // Update balance locally
      setUserBalance(prev => prev - totalRequired);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Withdraw Funds</h1>
        <p className="text-navy-600 dark:text-navy-400">Request a withdrawal to your personal crypto wallet.</p>
      </div>

      <div className="bg-white dark:bg-navy-800 p-8 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm">
        
        <div className="flex items-start p-4 bg-navy-50 dark:bg-navy-900 rounded-xl mb-8">
           <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 mr-3 shrink-0" />
           <div>
             <h4 className="text-sm font-bold text-navy-900 dark:text-white">Available Balance: ${userBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h4>
             <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">Ensure your receiving address is correct. Transactions cannot be reversed.</p>
           </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Withdrawal Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300">Processing Speed</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col gap-2 transition-colors ${withdrawalType === "STANDARD" ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-navy-200 dark:border-navy-700 hover:border-emerald-300"}`}>
                <input type="radio" name="speed" value="STANDARD" checked={withdrawalType === "STANDARD"} onChange={(e) => setWithdrawalType(e.target.value)} className="sr-only" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-navy-900 dark:text-white flex items-center gap-2"><Clock className="w-4 h-4 text-navy-500" /> Standard</span>
                  <span className="text-xs font-semibold px-2 py-1 bg-navy-200 dark:bg-navy-700 rounded-md">60 Days</span>
                </div>
                <p className="text-xs text-navy-500 dark:text-navy-400">Standard processing queue. Free of charge.</p>
              </label>

              <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col gap-2 transition-colors ${withdrawalType === "EXPRESS" ? "border-gold-500 bg-gold-50/50 dark:bg-gold-900/10" : "border-navy-200 dark:border-navy-700 hover:border-gold-300"}`}>
                <input type="radio" name="speed" value="EXPRESS" checked={withdrawalType === "EXPRESS"} onChange={(e) => setWithdrawalType(e.target.value)} className="sr-only" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-navy-900 dark:text-white flex items-center gap-2"><Zap className="w-4 h-4 text-gold-500" /> Express</span>
                  <span className="text-xs font-semibold px-2 py-1 bg-gold-100 text-gold-700 dark:bg-gold-900/40 dark:text-gold-400 rounded-md">24 Hours</span>
                </div>
                <p className="text-xs text-navy-500 dark:text-navy-400">Priority processing. Requires 40% security deposit fee.</p>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">Withdrawal Amount (USD)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-navy-500">$</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-8 pr-16 py-3 border border-navy-200 dark:border-navy-700 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="0.00"
              />
              <button
                type="button"
                onClick={() => {
                  if (withdrawalType === "EXPRESS") {
                    setAmount((userBalance / 1.4).toFixed(2));
                  } else {
                    setAmount(userBalance.toString());
                  }
                }}
                className="absolute inset-y-0 right-4 text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase"
              >
                Max
              </button>
            </div>
            
            {withdrawalType === "EXPRESS" && parsedAmount > 0 && (
              <div className="mt-3 p-3 bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-lg text-sm">
                <div className="flex justify-between text-navy-600 dark:text-navy-300 mb-1">
                  <span>Withdrawal Amount:</span>
                  <span>${parsedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gold-700 dark:text-gold-400 mb-1 font-medium">
                  <span>Express Fee (40%):</span>
                  <span>${expressFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-navy-900 dark:text-white pt-2 border-t border-gold-200 dark:border-gold-800">
                  <span>Total Deducted from Wallet:</span>
                  <span>${totalRequired.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">Select Cryptocurrency</label>
            <select 
              value={cryptoType}
              onChange={(e) => setCryptoType(e.target.value)}
              className="block w-full px-4 py-3 border border-navy-200 dark:border-navy-700 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            >
               <option value="BTC">Bitcoin (BTC)</option>
               <option value="ETH">Ethereum (ETH)</option>
               <option value="USDT">Tether (USDT - ERC20)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">Your Receiving Wallet Address</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="block w-full px-4 py-3 border border-navy-200 dark:border-navy-700 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="Enter your crypto wallet address"
            />
          </div>

          <button 
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors mt-6 disabled:opacity-70"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Submit Withdrawal Request
          </button>
        </form>
      </div>
    </div>
  );
}
