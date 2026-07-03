"use client";

import { useEffect, useState } from "react";
import { User, Mail, Shield, Calendar, Loader2, CheckCircle, Globe } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess(data.message || "Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setShowPasswordForm(false), 2000);
      } else {
        setPasswordError(data.error || "Failed to update password.");
      }
    } catch (err) {
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

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
              <Globe className="w-5 h-5 text-navy-500 dark:text-navy-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wide">Country</p>
              <p className="text-navy-900 dark:text-white font-semibold mt-0.5">{user?.country || "Unknown"}</p>
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

      {/* Security section */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm p-6">
        <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-4">Security</h3>
        
        {!showPasswordForm ? (
          <button 
            onClick={() => setShowPasswordForm(true)}
            className="w-full py-3 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-600 dark:text-navy-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors font-medium bg-navy-50 dark:bg-navy-900/50"
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {passwordSuccess}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 focus:ring-2 focus:ring-emerald-500 outline-none text-navy-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 focus:ring-2 focus:ring-emerald-500 outline-none text-navy-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 focus:ring-2 focus:ring-emerald-500 outline-none text-navy-900 dark:text-white"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                className="flex-1 py-3 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-600 dark:text-navy-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
              >
                {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
