"use client";

import Link from "next/link";
import { LayoutDashboard, Wallet, ArrowDownToLine, ArrowUpFromLine, User, LogOut, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import WeatherWidget from "@/components/WeatherWidget";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => setUser(data))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Deposit", href: "/dashboard/deposit", icon: <ArrowDownToLine className="w-5 h-5" /> },
    { name: "Withdraw", href: "/dashboard/withdraw", icon: <ArrowUpFromLine className="w-5 h-5" /> },
    { name: "My Wallet", href: "/dashboard/wallet", icon: <Wallet className="w-5 h-5" /> },
    { name: "Profile", href: "/dashboard/profile", icon: <User className="w-5 h-5" /> },
  ];

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "HV";

  return (
    <div className="flex h-screen bg-navy-50 dark:bg-navy-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-navy-800 border-r border-navy-200 dark:border-navy-700 flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">H</span>
            </div>
            <span className="text-xl font-bold text-navy-900 dark:text-white tracking-tight">HughVest</span>
          </Link>
        </div>

        {/* User info */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 p-3 bg-navy-50 dark:bg-navy-900/50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-navy-900 dark:text-white truncate">{user?.name || "Loading..."}</p>
              <p className="text-xs text-navy-500 dark:text-navy-400 truncate">{user?.email || ""}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "text-navy-600 dark:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-700/50"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-navy-200 dark:border-navy-700">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-60"
          >
            {loggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white dark:bg-navy-800 border-b border-navy-200 dark:border-navy-700 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-navy-900 dark:text-white">Investor Dashboard</h2>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <WeatherWidget />
            </div>
            <span className="text-sm text-navy-600 dark:text-navy-400 hidden sm:block font-medium border-l border-navy-200 dark:border-navy-700 pl-4">{user?.name}</span>
            <Link href="/dashboard/profile" className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold hover:bg-emerald-700 transition-colors shadow-sm">
              {initials}
            </Link>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
