"use client";

import { useEffect, useState } from "react";
import { Users, Ban, CheckCircle, Loader2, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  walletBalance: number;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBan = async (id: string, currentStatus: boolean) => {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !currentStatus }),
      });
      await fetchUsers();
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
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-navy-400">View and manage platform users, balances, and access.</p>
      </div>

      <div className="bg-navy-800 rounded-2xl border border-navy-700 overflow-hidden">
        <div className="p-6 border-b border-navy-700 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-white font-semibold">
            <Users className="w-5 h-5 text-emerald-500" />
            <span>Registered Users</span>
          </div>
          <button onClick={() => router.push("/admin/fund")} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <DollarSign className="w-4 h-4" />
            <span>Manual Funding Tool</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-navy-400 text-sm border-b border-navy-700">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Balance</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-navy-750 transition-colors">
                  <td className="p-4 text-white font-medium">{user.name || "N/A"}</td>
                  <td className="p-4 text-navy-300">{user.email}</td>
                  <td className="p-4 text-emerald-400 font-bold">${user.walletBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                  <td className="p-4">
                    {user.banned ? (
                      <span className="px-2.5 py-1 bg-red-900/40 text-red-400 rounded-full text-xs font-semibold border border-red-800/50">Banned</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-900/40 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-800/50">Active</span>
                    )}
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button
                      disabled={actionLoading === user.id || user.role === "ADMIN"}
                      onClick={() => toggleBan(user.id, user.banned)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
                        user.banned 
                          ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30" 
                          : "bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30"
                      }`}
                    >
                      {actionLoading === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : user.banned ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                      <span>{user.banned ? "Unban" : "Ban"}</span>
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-navy-400">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
