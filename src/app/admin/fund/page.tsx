"use client";

import { useState } from "react";
import { Loader2, DollarSign, Search, CheckCircle } from "lucide-react";

export default function AdminFundPage() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [userResult, setUserResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [funding, setFunding] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const searchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUserResult(null);
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/users/search?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      setUserResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addFunds = async () => {
    if (!userResult || !amount) return;
    setFunding(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userResult.id, amount: parseFloat(amount) }),
      });

      if (!res.ok) throw new Error("Failed to add funds");
      const data = await res.json();
      setSuccess(`Successfully added $${amount} to ${userResult.name}'s wallet. New Balance: $${data.balance}`);
      setUserResult({ ...userResult, walletBalance: data.balance });
      setAmount("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFunding(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white">Fund User Wallet</h1>
        <p className="text-navy-600 dark:text-navy-400 mt-2">Search for a user and add funds directly to their wallet balance.</p>
      </div>

      <div className="bg-white dark:bg-navy-800 p-6 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm">
        <form onSubmit={searchUser} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="User Email Address"
              required
              className="w-full pl-10 pr-4 py-3 bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-navy-900 dark:bg-white text-white dark:text-navy-900 rounded-xl font-semibold hover:bg-navy-800 dark:hover:bg-navy-100 transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Search"}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {userResult && (
        <div className="bg-white dark:bg-navy-800 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-navy-900 dark:text-white">{userResult.name}</h3>
            <p className="text-navy-500 dark:text-navy-400 text-sm">{userResult.email}</p>
            <div className="mt-4 p-4 bg-navy-50 dark:bg-navy-900 rounded-xl">
              <p className="text-sm font-medium text-navy-500 dark:text-navy-400">Current Wallet Balance</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${userResult.walletBalance?.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-navy-900 dark:text-white">Amount to Add (USD)</label>
            <div className="relative">
              <DollarSign className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000.00"
                className="w-full pl-10 pr-4 py-3 bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white font-medium"
              />
            </div>
            <button
              onClick={addFunds}
              disabled={funding || !amount}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {funding ? <Loader2 className="w-5 h-5 animate-spin" /> : <DollarSign className="w-5 h-5" />}
              {funding ? "Processing..." : "Add Funds to Wallet"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
