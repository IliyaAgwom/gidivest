"use client";

import { useEffect, useState } from "react";
import { User, Mail, Shield, Calendar, Loader2, CheckCircle } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => { setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
    </div>
  );

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "HV";

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">My Profile</h1>
        <p className="text-navy-600 dark:text-navy-400 mt-1">Your account information and settings.</p>
      </div>

      {/* Avatar & Name Card */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm p-8 flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {initials}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white">{user?.name || "—"}</h2>
          <p className="text-navy-500 dark:text-navy-400">{user?.email}</p>
          <span className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            user?.role === "ADMIN"
              ? "bg-gold-500/20 text-gold-600 dark:text-gold-400"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
          }`}>
            <Shield className="w-3.5 h-3.5" />
            {user?.role === "ADMIN" ? "Administrator" : "Investor"}
          </span>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-navy-200 dark:border-navy-700">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">Account Details</h3>
        </div>
        <div className="divide-y divide-navy-100 dark:divide-navy-700">
          <div className="flex items-center gap-4 p-6">
            <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-900 flex items-center justify-center">
              <User className="w-5 h-5 text-navy-500 dark:text-navy-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wide">Full Name</p>
              <p className="text-navy-900 dark:text-white font-semibold mt-0.5">{user?.name || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6">
            <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-900 flex items-center justify-center">
              <Mail className="w-5 h-5 text-navy-500 dark:text-navy-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wide">Email Address</p>
              <p className="text-navy-900 dark:text-white font-semibold mt-0.5">{user?.email || "—"}</p>
            </div>
            <div className="ml-auto">
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6">
            <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-900 flex items-center justify-center">
              <Shield className="w-5 h-5 text-navy-500 dark:text-navy-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wide">Account Role</p>
              <p className="text-navy-900 dark:text-white font-semibold mt-0.5">{user?.role === "ADMIN" ? "Administrator" : "Investor"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6">
            <div className="w-10 h-10 rounded-xl bg-navy-50 dark:bg-navy-900 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-navy-500 dark:text-navy-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wide">Account ID</p>
              <p className="text-navy-900 dark:text-white font-mono text-sm mt-0.5">{user?.id?.slice(0, 16)}...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security section placeholder */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm p-6">
        <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-4">Security</h3>
        <button className="w-full py-3 border-2 border-dashed border-navy-200 dark:border-navy-700 rounded-xl text-navy-500 dark:text-navy-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors font-medium">
          Change Password (coming soon)
        </button>
      </div>
    </div>
  );
}
