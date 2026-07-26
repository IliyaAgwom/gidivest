"use client";

import { useEffect, useState } from "react";
import { Settings, Save, Loader2, Link2, Percent, ShieldAlert } from "lucide-react";

type AdminSettings = {
  id: string;
  btcAddress: string;
  ethAddress: string;
  usdtAddress: string;
  investmentPercent: number;
  maintenanceMode: boolean;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingMaint, setTogglingMaint] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          btcAddress: settings?.btcAddress,
          ethAddress: settings?.ethAddress,
          usdtAddress: settings?.usdtAddress,
          investmentPercent: Number(settings?.investmentPercent)
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      setMessage("Settings updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(error.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const toggleMaintenance = async () => {
    if (!settings) return;
    setTogglingMaint(true);
    try {
      const newVal = !settings.maintenanceMode;
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenanceMode: newVal }),
      });
      if (!res.ok) throw new Error("Failed");
      setSettings({ ...settings, maintenanceMode: newVal });
    } catch {
      setMessage("Failed to toggle maintenance mode.");
    } finally {
      setTogglingMaint(false);
    }
  };

  if (loading || !settings) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* ── Maintenance Mode Card ── */}
      <div className={`rounded-2xl border overflow-hidden transition-all ${
        settings.maintenanceMode
          ? "bg-amber-950/30 border-amber-700/50"
          : "bg-navy-800 border-navy-700"
      }`}>
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              settings.maintenanceMode ? "bg-amber-500/20" : "bg-navy-700"
            }`}>
              <ShieldAlert className={`w-5 h-5 ${
                settings.maintenanceMode ? "text-amber-400" : "text-navy-400"
              }`} />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Maintenance Mode</p>
              <p className="text-xs text-navy-400 mt-0.5">
                {settings.maintenanceMode
                  ? "Site is OFFLINE for regular users. Only admins can access."
                  : "Site is live. Toggle to take it offline for users."}
              </p>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            id="maintenance-toggle"
            onClick={toggleMaintenance}
            disabled={togglingMaint}
            aria-pressed={settings.maintenanceMode}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-900 disabled:opacity-50 ${
              settings.maintenanceMode
                ? "bg-amber-500 border-amber-500 focus:ring-amber-500"
                : "bg-navy-600 border-navy-600 focus:ring-emerald-500"
            }`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
              settings.maintenanceMode ? "translate-x-5" : "translate-x-0.5"
            }`} />
          </button>
        </div>

        {settings.maintenanceMode && (
          <div className="px-5 pb-4 text-xs text-amber-400 font-medium flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Maintenance mode is ACTIVE — regular users see the maintenance page.
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
        <p className="text-navy-400">Configure global platform parameters and crypto wallets.</p>
      </div>

      <div className="bg-navy-800 rounded-2xl border border-navy-700 overflow-hidden">
        <div className="p-6 border-b border-navy-700 flex items-center space-x-2 text-white font-semibold">
          <Settings className="w-5 h-5 text-emerald-500" />
          <span>Global Configuration</span>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {message && (
            <div className={`p-4 rounded-xl text-sm font-bold ${message.includes("success") ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800/50" : "bg-red-900/40 text-red-400 border border-red-800/50"}`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-gold-500" /> Investment Parameters
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-navy-300 mb-1">Global Return Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.investmentPercent}
                onChange={(e) => setSettings({ ...settings, investmentPercent: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. 15"
              />
              <p className="text-xs text-navy-400 mt-1">This sets the global return percentage applied to active investments.</p>
            </div>
          </div>

          <hr className="border-navy-700" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-emerald-500" /> Platform Wallets
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-navy-300 mb-1">Bitcoin (BTC) Address</label>
              <input
                type="text"
                value={settings.btcAddress}
                onChange={(e) => setSettings({ ...settings, btcAddress: e.target.value })}
                className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-300 mb-1">Ethereum (ETH) Address</label>
              <input
                type="text"
                value={settings.ethAddress}
                onChange={(e) => setSettings({ ...settings, ethAddress: e.target.value })}
                className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-300 mb-1">Tether (USDT - ERC20) Address</label>
              <input
                type="text"
                value={settings.usdtAddress}
                onChange={(e) => setSettings({ ...settings, usdtAddress: e.target.value })}
                className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center justify-center w-full space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
