"use client";

import Link from "next/link";
import { LayoutDashboard, Users, ArrowDownToLine, ArrowUpFromLine, Mail, Settings, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Users & Balances", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
    { name: "Deposits", href: "/admin/deposits", icon: <ArrowDownToLine className="w-5 h-5" /> },
    { name: "Withdrawals", href: "/admin/withdrawals", icon: <ArrowUpFromLine className="w-5 h-5" /> },
    { name: "Mailing", href: "/admin/mail", icon: <Mail className="w-5 h-5" /> },
    { name: "Settings", href: "#", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-navy-900 text-white">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-navy-800 border-r border-navy-700 flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/" className="flex items-center space-x-2">
             <div className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded uppercase tracking-widest">Admin</div>
             <span className="text-xl font-bold tracking-tight">HughVest</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? "bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/20" 
                    : "text-navy-300 hover:bg-navy-700 hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-navy-700">
          <Link href="/login" className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900/30 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Admin Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-navy-800 border-b border-navy-700 flex items-center justify-between px-8">
           <h2 className="text-lg font-semibold">Control Panel</h2>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
