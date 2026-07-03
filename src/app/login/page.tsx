"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials.");
        return;
      }

      // Redirect based on role
      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-50 dark:bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl border border-navy-200 dark:border-navy-700 bg-white/80 dark:bg-navy-800/80 backdrop-blur-lg shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">M</span>
            </div>
            <span className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight">Martcapp</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white mb-2">Welcome Back</h1>
          <p className="text-navy-600 dark:text-navy-400">Sign in to manage your portfolio</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-navy-400" />
              </div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-navy-200 dark:border-navy-700 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 dark:text-navy-300 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-navy-400" />
              </div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-3 border border-navy-200 dark:border-navy-700 rounded-xl bg-white dark:bg-navy-900 text-navy-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Signing In...</>
            ) : (
              <>Sign In <ArrowRight className="ml-2 w-5 h-5" /></>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-600 dark:text-navy-400">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-500">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
