"use client";

import { useEffect, useState } from "react";
import { ArrowUpFromLine, CheckCircle, XCircle, Loader2 } from "lucide-react";

type Transaction = {
  id: string;
  user: { name: string; email: string };
  amount: number;
  cryptoType: string;
  status: string;
  createdAt: string;
  type: string;
};

export default function AdminWithdrawalsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/admin/transactions");
      const data = await res.json();
      setTransactions(data.filter((t: Transaction) => t.type === "WITHDRAWAL"));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(id);
    try {
      await fetch("/api/admin/transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      await fetchTransactions();
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Withdrawal Requests</h1>
        <p className="text-navy-400">Review and process user withdrawal requests.</p>
      </div>

      <div className="bg-navy-800 rounded-2xl border border-navy-700 overflow-hidden">
        <div className="p-6 border-b border-navy-700 flex items-center space-x-2 text-white font-semibold">
          <ArrowUpFromLine className="w-5 h-5 text-red-400" />
          <span>All Withdrawals</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-navy-400 text-sm border-b border-navy-700">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Asset/Fee</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-navy-750 transition-colors">
                  <td className="p-4 text-navy-300 text-sm">
                    {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{tx.user.name || "Unknown"}</span>
                      <span className="text-xs text-navy-400">{tx.user.email}</span>
                    </div>
                  </td>
                  <td className="p-4 text-red-400 font-bold">${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-white font-medium">{tx.cryptoType}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      tx.status === "APPROVED" ? "bg-emerald-900/40 text-emerald-400 border-emerald-800/50" :
                      tx.status === "REJECTED" ? "bg-red-900/40 text-red-400 border-red-800/50" :
                      "bg-yellow-900/40 text-yellow-400 border-yellow-800/50"
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    {tx.status === "PENDING" && (
                      <>
                        <button
                          disabled={actionLoading === tx.id}
                          onClick={() => handleAction(tx.id, "APPROVED")}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 transition-colors"
                        >
                          {actionLoading === tx.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          <span>Approve</span>
                        </button>
                        <button
                          disabled={actionLoading === tx.id}
                          onClick={() => handleAction(tx.id, "REJECTED")}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 transition-colors"
                        >
                          {actionLoading === tx.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-navy-400">No withdrawal requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
