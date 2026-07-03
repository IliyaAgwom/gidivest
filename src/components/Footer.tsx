"use client";

import Link from "next/link";
import { Twitter, Linkedin, Facebook, Instagram } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    return null;
  }
  return (
    <footer className="bg-navy-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl leading-none">M</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Martcapp
              </span>
            </Link>
            <p className="text-navy-300 leading-relaxed max-w-sm mb-6">
              Empowering individuals and businesses to build wealth through intelligent investment solutions, advanced analytics, and secure portfolio management.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">Investment Solutions</h4>
            <ul className="space-y-4 text-navy-300">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Stocks & ETFs</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Real Estate</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Cryptocurrency</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Fixed Income</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Retirement Planning</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">Resources</h4>
            <ul className="space-y-4 text-navy-300">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Education Hub</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Market Intelligence</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Webinars</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-6">Company</h4>
            <ul className="space-y-4 text-navy-300">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Security Center</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          
        </div>

        <div className="border-t border-navy-800 pt-8 flex flex-col md:flex-row justify-between items-center text-navy-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Martcapp Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span>SEC Compliant</span>
            <span>Bank-Level Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
