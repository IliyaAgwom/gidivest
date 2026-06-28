"use client";

import Link from "next/link";
import { LayoutDashboard, Users, ArrowDownToLine, ArrowUpFromLine, Mail, Settings, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/admin", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Users & Balances", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
    { name: "Deposits", href: "/admin/deposits", icon: <ArrowDownToLine className="w-5 h-5" /> },
    { name: "Withdrawals", href: "/admin/withdrawals", icon: <ArrowUpFromLine className="w-5 h-5" /> },
    { name: "Mailing", href: "/admin/mail", icon: <Mail className="w-5 h-5" /> },
    { name: "Settings", href: "/admin/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-navy-900 text-white relative">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-navy-800 border-r border-navy-700 flex-col z-30 transform transition-transform duration-300 ease-in-out md:transform-none md:flex ${
        isMobileMenuOpen ? "translate-x-0 flex" : "-translate-x-full hidden md:flex"
      }`}>
        <div className="p-6 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
             <div className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded uppercase tracking-widest">Admin</div>
             <span className="text-xl font-bold tracking-tight">HughVest</span>
          </Link>
          <button className="md:hidden text-navy-400" onClick={() => setIsMobileMenuOpen(false)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
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
      <main className="flex-1 overflow-y-auto w-full">
        <header className="h-16 bg-navy-800 border-b border-navy-700 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 w-full">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden text-navy-300"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-lg font-semibold">Control Panel</h2>
          </div>
        </header>

        <div className="p-4 md:p-8 w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
