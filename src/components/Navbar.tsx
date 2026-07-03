"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/user/me")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setUser(data);
        }
      })
      .catch(() => {});
  }, []);

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-navy-900/80 backdrop-blur-lg border-b border-navy-200 dark:border-navy-800 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl leading-none">M</span>
              </div>
              <span className="text-2xl font-bold text-navy-900 dark:text-white tracking-tight">
                Martcapp
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#investments" className="text-navy-600 dark:text-navy-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors">
              Investments
            </Link>
            <div className="relative group cursor-pointer">
              <div className="flex items-center space-x-1 text-navy-600 dark:text-navy-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors">
                <span>Features</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <Link href="#pricing" className="text-navy-600 dark:text-navy-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors">
              Pricing
            </Link>
            <Link href="#resources" className="text-navy-600 dark:text-navy-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors">
              Resources
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Link href="/dashboard" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-navy-600 dark:text-navy-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold transition-colors px-4 py-2">
                  Log In
                </Link>
                <Link href="/register" className="bg-navy-900 dark:bg-white text-white dark:text-navy-900 hover:bg-navy-800 dark:hover:bg-navy-100 px-5 py-2.5 rounded-lg font-semibold transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-navy-600 dark:text-navy-300"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-navy-900 border-b border-navy-200 dark:border-navy-800 absolute top-20 left-0 right-0 p-4 shadow-lg">
          <div className="flex flex-col space-y-4">
             <Link href="#investments" className="font-medium text-navy-900 dark:text-white">Investments</Link>
             <Link href="#features" className="font-medium text-navy-900 dark:text-white">Features</Link>
             <Link href="#pricing" className="font-medium text-navy-900 dark:text-white">Pricing</Link>
             <hr className="border-navy-200 dark:border-navy-700" />
             {user ? (
               <Link href="/dashboard" className="w-full text-center bg-emerald-600 text-white rounded-lg py-3 font-semibold flex items-center justify-center gap-2">
                 <LayoutDashboard className="w-5 h-5" /> Go to Dashboard
               </Link>
             ) : (
               <>
                 <Link href="/login" className="font-medium text-navy-900 dark:text-white mb-2">Log In</Link>
                 <Link href="/register" className="w-full text-center bg-emerald-600 text-white rounded-lg py-3 font-semibold">Get Started</Link>
               </>
             )}
          </div>
        </div>
      )}
    </nav>
  );
}
