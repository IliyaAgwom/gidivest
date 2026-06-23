"use client";

import { Send } from "lucide-react";

export default function AdminMail() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Mass Mailing & Notifications</h1>
        <p className="text-navy-400">Send market updates, price alerts, or newsletters to your investors.</p>
      </div>

      <div className="bg-navy-800 rounded-2xl border border-navy-700 p-8">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-1">Audience</label>
            <select className="block w-full px-4 py-3 border border-navy-700 rounded-xl bg-navy-900 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
               <option value="all">All Active Investors</option>
               <option value="starter">Starter Plan Members</option>
               <option value="pro">Professional Plan Members</option>
               <option value="elite">Elite Wealth Members</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-1">Subject Line</label>
            <input
              type="text"
              className="block w-full px-4 py-3 border border-navy-700 rounded-xl bg-navy-900 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="e.g. Weekly Market Update & Price Adjustments"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-1">Email Body (Markdown supported)</label>
            <textarea
              rows={8}
              className="block w-full px-4 py-3 border border-navy-700 rounded-xl bg-navy-900 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
              placeholder="Write your email content here..."
            ></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <button className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-semibold transition-colors">
              <Send className="w-5 h-5" />
              <span>Send Campaign</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
