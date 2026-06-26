"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Wallet, ArrowDownToLine, ArrowUpFromLine, Activity, Loader2 } from "lucide-react";
import Link from "next/link";
import TrendingInvestments from "@/components/TrendingInvestments";

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

      {/* Trending Investments Section */}
      <TrendingInvestments userBalance={user?.walletBalance ?? 0} />

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-navy-200 dark:border-navy-700">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">Recent Transactions</h3>
        </div>
        <div className="p-6">
          {user?.transactions && user.transactions.length > 0 ? (
            <table className="w-full text-left">
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
                        <ArrowDownToLine className="w-4 h-4 mr-2 text-emerald-500" />
                      ) : (
                        <ArrowUpFromLine className="w-4 h-4 mr-2 text-red-400" />
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
