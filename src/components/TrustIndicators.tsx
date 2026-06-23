"use client";

import { CheckCircle2, Lock, Users, DollarSign, ActivitySquare } from "lucide-react";

export default function TrustIndicators() {
  const stats = [
    {
      icon: <DollarSign className="w-6 h-6 text-emerald-500" />,
      value: "$500M+",
      label: "Assets Managed",
    },
    {
      icon: <Users className="w-6 h-6 text-navy-500 dark:text-navy-400" />,
      value: "100,000+",
      label: "Active Investors",
    },
    {
      icon: <ActivitySquare className="w-6 h-6 text-emerald-600" />,
      value: "12.4%",
      label: "Avg. Annual Return",
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-gold-500" />,
      value: "99.9%",
      label: "Platform Uptime",
    },
  ];

  return (
    <section className="py-12 bg-navy-50 dark:bg-navy-900/50 border-y border-navy-100 dark:border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-8">
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center space-x-4 bg-white dark:bg-navy-800 p-4 pr-8 rounded-2xl shadow-sm border border-navy-200 dark:border-navy-700 hover:shadow-md transition-shadow">
              <img src="/ceo.jpg" alt="Hugh Jackman, CEO" className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-emerald-500 shadow-sm" />
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-bold text-navy-900 dark:text-white leading-tight">Hugh Jackman</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-1">Chief Executive Officer</span>
              </div>
            </div>

            <div className="flex items-center space-x-6">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold text-navy-900 dark:text-white">Bank-Level Security</span>
              </div>
              <span className="text-sm text-navy-600 dark:text-navy-400">256-bit encryption</span>
            </div>
            <div className="h-10 w-px bg-navy-200 dark:bg-navy-700 hidden md:block"></div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <ShieldIcon className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold text-navy-900 dark:text-white">SEC Compliant</span>
              </div>
              <span className="text-sm text-navy-600 dark:text-navy-400">Fully regulated</span>
            </div>
          </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 w-full xl:w-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center md:items-start">
                <div className="mb-2 bg-white dark:bg-navy-800 p-2 rounded-lg shadow-sm">
                  {stat.icon}
                </div>
                <h4 className="text-2xl font-bold text-navy-900 dark:text-white">{stat.value}</h4>
                <p className="text-sm font-medium text-navy-600 dark:text-navy-400">{stat.label}</p>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
