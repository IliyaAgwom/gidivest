"use client";

import { useEffect, useState } from "react";
import { Wallet, Bitcoin, Copy, CheckCheck, ArrowDownToLine, ArrowUpFromLine, Loader2 } from "lucide-react";
import Link from "next/link";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  cryptoType: string;
  status: string;
  createdAt: string;
};

export default function WalletPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => { setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const statusColors: Record<string, string> = {
    APPROVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
    </div>
  );

  const deposits = user?.transactions?.filter((t: Transaction) => t.type === "DEPOSIT") || [];
  const withdrawals = user?.transactions?.filter((t: Transaction) => t.type === "WITHDRAWAL") || [];
  const totalDeposited = deposits.filter((t: Transaction) => t.status === "APPROVED").reduce((s: number, t: Transaction) => s + t.amount, 0);
  const totalWithdrawn = withdrawals.filter((t: Transaction) => t.status === "APPROVED").reduce((s: number, t: Transaction) => s + t.amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">My Wallet</h1>
        <p className="text-navy-600 dark:text-navy-400 mt-1">Your crypto wallet overview and transaction history.</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-2xl shadow-lg text-white">
          <Wallet className="w-8 h-8 mb-4 opacity-80" />
          <p className="text-emerald-100 text-sm font-medium">Available Balance</p>
          <h2 className="text-3xl font-bold mt-1">
            ${(user?.walletBalance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </h2>
        </div>

        <div className="bg-white dark:bg-navy-800 p-6 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm">
          <ArrowDownToLine className="w-7 h-7 text-emerald-500 mb-4" />
          <p className="text-navy-500 dark:text-navy-400 text-sm font-medium">Total Deposited</p>
          <h2 className="text-3xl font-bold text-navy-900 dark:text-white mt-1">
            ${totalDeposited.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </h2>
        </div>

        <div className="bg-white dark:bg-navy-800 p-6 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm">
          <ArrowUpFromLine className="w-7 h-7 text-red-400 mb-4" />
          <p className="text-navy-500 dark:text-navy-400 text-sm font-medium">Total Withdrawn</p>
          <h2 className="text-3xl font-bold text-navy-900 dark:text-white mt-1">
            ${totalWithdrawn.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-4">
        <Link
          href="/dashboard/deposit"
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors"
        >
          <ArrowDownToLine className="w-5 h-5" /> Deposit Crypto
        </Link>
        <Link
          href="/dashboard/withdraw"
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-navy-800 dark:bg-navy-700 hover:bg-navy-700 text-white font-semibold rounded-xl transition-colors"
        >
          <ArrowUpFromLine className="w-5 h-5" /> Withdraw Funds
        </Link>
      </div>

      {/* All Transactions */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-navy-200 dark:border-navy-700">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">All Transactions</h3>
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
                {user.transactions.map((tx: Transaction) => (
                  <tr key={tx.id}>
                    <td className="py-4 text-navy-900 dark:text-white font-medium">
                      <span className="flex items-center gap-2">
                        {tx.type === "DEPOSIT"
                          ? <ArrowDownToLine className="w-4 h-4 text-emerald-500" />
                          : <ArrowUpFromLine className="w-4 h-4 text-red-400" />}
                        {tx.type === "DEPOSIT" ? "Deposit" : "Withdrawal"}
                      </span>
                    </td>
                    <td className="py-4 text-navy-600 dark:text-navy-400">{tx.cryptoType}</td>
                    <td className="py-4 text-navy-900 dark:text-white font-medium">
                      ${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 text-navy-600 dark:text-navy-400 text-sm">
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
              <Bitcoin className="w-12 h-12 text-navy-300 dark:text-navy-600 mx-auto mb-4" />
              <p className="text-navy-500 dark:text-navy-400 font-medium">No transactions yet</p>
              <Link href="/dashboard/deposit" className="mt-4 inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                Make First Deposit
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
