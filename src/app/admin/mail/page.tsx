"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

export default function AdminMail() {
  const [audience, setAudience] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      alert("Subject and body are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience, subject, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to send broadcast");
      } else {
        alert(data.message || "Emails sent successfully!");
        setSubject("");
        setBody("");
      }
    } catch (err: any) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Mass Mailing & Notifications</h1>
        <p className="text-navy-400">Send market updates, price alerts, or newsletters to your investors.</p>
      </div>

      <div className="bg-navy-800 rounded-2xl border border-navy-700 p-8">
        <form className="space-y-6" onSubmit={handleSend}>
          <div>
            <label className="block text-sm font-medium text-navy-300 mb-1">Audience</label>
            <select 
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="block w-full px-4 py-3 border border-navy-700 rounded-xl bg-navy-900 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            >
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
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="block w-full px-4 py-3 border border-navy-700 rounded-xl bg-navy-900 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="e.g. Weekly Market Update & Price Adjustments"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-300 mb-1">Email Body (Markdown supported)</label>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="block w-full px-4 py-3 border border-navy-700 rounded-xl bg-navy-900 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
              placeholder="Write your email content here. HTML tags like <br/> and <strong> are supported."
            ></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl text-white font-semibold transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span>{loading ? "Sending..." : "Send Campaign"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
