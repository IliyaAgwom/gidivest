"use client";

import { useEffect, useState } from "react";
import { Users, DollarSign, ArrowUpFromLine, ArrowDownToLine, Activity, Loader2, TrendingUp, Ban } from "lucide-react";
import Link from "next/link";

type Stats = {
  totalUsers: number;
  bannedUsers: number;
  totalBalance: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  approvedDeposits: number;
};

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then(r => r.json()),
      fetch("/api/admin/transactions").then(r => r.json()),
    ]).then(([users, transactions]) => {
      const bannedUsers = users.filter((u: any) => u.banned).length;
      const totalBalance = users.reduce((sum: number, u: any) => sum + u.walletBalance, 0);
      const pendingDeposits = transactions.filter((t: any) => t.type === "DEPOSIT" && t.status === "PENDING").length;
      const pendingWithdrawals = transactions.filter((t: any) => t.type === "WITHDRAWAL" && t.status === "PENDING").length;
      const approvedDeposits = transactions.filter((t: any) => t.type === "DEPOSIT" && t.status === "APPROVED").length;

      setStats({
        totalUsers: users.length,
        bannedUsers,
        totalBalance,
        pendingDeposits,
        pendingWithdrawals,
        approvedDeposits,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  const cards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: <Users className="w-6 h-6" />,
      color: "text-emerald-400",
      bg: "bg-emerald-900/50",
      href: "/admin/users",
    },
    {
      label: "Total Wallet Balance",
      value: `$${(stats?.totalBalance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: "text-gold-400",
      bg: "bg-gold-900/50",
      href: "/admin/users",
    },
    {
      label: "Pending Deposits",
      value: stats?.pendingDeposits ?? 0,
      icon: <ArrowDownToLine className="w-6 h-6" />,
      color: "text-blue-400",
      bg: "bg-blue-900/50",
      href: "/admin/deposits",
    },
    {
      label: "Pending Withdrawals",
      value: stats?.pendingWithdrawals ?? 0,
      icon: <ArrowUpFromLine className="w-6 h-6" />,
      color: "text-red-400",
      bg: "bg-red-900/50",
      href: "/admin/withdrawals",
    },
    {
      label: "Approved Deposits",
      value: stats?.approvedDeposits ?? 0,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "text-emerald-400",
      bg: "bg-emerald-900/50",
      href: "/admin/deposits",
    },
    {
      label: "Banned Accounts",
      value: stats?.bannedUsers ?? 0,
      icon: <Ban className="w-6 h-6" />,
      color: "text-red-400",
      bg: "bg-red-900/50",
      href: "/admin/users",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
        <p className="text-navy-400">Live system statistics and pending actions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <Link key={i} href={card.href} className="bg-navy-800 p-6 rounded-2xl border border-navy-700 hover:border-emerald-600/50 transition-colors group block">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`p-3 ${card.bg} rounded-xl ${card.color} group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <h3 className="text-navy-300 font-medium">{card.label}</h3>
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-navy-800 rounded-2xl border border-navy-700 overflow-hidden">
          <div className="p-6 border-b border-navy-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5 text-emerald-500" /> Pending Deposits
            </h3>
            <Link href="/admin/deposits" className="text-sm text-emerald-400 hover:text-emerald-300">View All →</Link>
          </div>
          <div className="p-6">
            {stats?.pendingDeposits === 0 ? (
              <p className="text-navy-400 text-sm">No pending deposits. ✅</p>
            ) : (
              <p className="text-yellow-400 font-bold text-lg">{stats?.pendingDeposits} deposit(s) awaiting approval.</p>
            )}
          </div>
        </div>

        <div className="bg-navy-800 rounded-2xl border border-navy-700 overflow-hidden">
          <div className="p-6 border-b border-navy-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowUpFromLine className="w-5 h-5 text-red-400" /> Pending Withdrawals
            </h3>
            <Link href="/admin/withdrawals" className="text-sm text-emerald-400 hover:text-emerald-300">View All →</Link>
          </div>
          <div className="p-6">
            {stats?.pendingWithdrawals === 0 ? (
              <p className="text-navy-400 text-sm">No pending withdrawals. ✅</p>
            ) : (
              <p className="text-red-400 font-bold text-lg">{stats?.pendingWithdrawals} withdrawal(s) awaiting processing.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-navy-800 rounded-2xl border border-navy-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" /> Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/users" className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg font-medium transition-colors text-sm">👥 Manage Users</Link>
          <Link href="/admin/fund" className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors text-sm">💰 Fund User Account</Link>
          <Link href="/admin/deposits" className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm">📥 Review Deposits</Link>
          <Link href="/admin/withdrawals" className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm">📤 Process Withdrawals</Link>
          <Link href="/admin/settings" className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-lg font-medium transition-colors text-sm">⚙️ Platform Settings</Link>
        </div>
      </div>
    </div>
  );
}
