"use client";

import { useState } from "react";
import RealTimeChart from "./RealTimeChart";
import { TrendingUp, Clock, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const TRENDING_ASSETS = [
  // Short Term
  { symbol: "NVDA", name: "Nvidia Corp", price: 850.25, term: "Short", change: "+4.5%" },
  { symbol: "TSLA", name: "Tesla Inc", price: 175.40, term: "Short", change: "+2.1%" },
  { symbol: "COIN", name: "Coinbase Global", price: 210.15, term: "Short", change: "+6.8%" },
  { symbol: "MSTR", name: "MicroStrategy", price: 1450.00, term: "Short", change: "+8.2%" },
  { symbol: "PLTR", name: "Palantir Tech", price: 23.50, term: "Short", change: "+1.5%" },
  { symbol: "DOGE", name: "Dogecoin", price: 0.16, term: "Short", change: "+12.4%" },
  
  // Medium Term
  { symbol: "BTC", name: "Bitcoin", price: 68500.00, term: "Medium", change: "+1.2%" },
  { symbol: "ETH", name: "Ethereum", price: 3500.20, term: "Medium", change: "+0.8%" },
  { symbol: "AAPL", name: "Apple Inc", price: 170.85, term: "Medium", change: "-0.5%" },
  { symbol: "MSFT", name: "Microsoft Corp", price: 420.30, term: "Medium", change: "+0.3%" },
  { symbol: "AMZN", name: "Amazon.com", price: 180.50, term: "Medium", change: "+1.1%" },
  { symbol: "META", name: "Meta Platforms", price: 505.20, term: "Medium", change: "+2.4%" },
  { symbol: "GOOGL", name: "Alphabet Inc", price: 155.40, term: "Medium", change: "+0.9%" },
  
  // Long Term
  { symbol: "SPY", name: "S&P 500 ETF", price: 520.10, term: "Long", change: "+0.2%" },
  { symbol: "QQQ", name: "Invesco QQQ", price: 445.60, term: "Long", change: "+0.4%" },
  { symbol: "VTI", name: "Vanguard Total Stock", price: 260.80, term: "Long", change: "+0.2%" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", price: 410.50, term: "Long", change: "+0.1%" },
  { symbol: "JNJ", name: "Johnson & Johnson", price: 155.20, term: "Long", change: "-0.2%" },
  { symbol: "JPM", name: "JPMorgan Chase", price: 195.40, term: "Long", change: "+0.5%" },
  { symbol: "V", name: "Visa Inc", price: 280.15, term: "Long", change: "+0.3%" },
];

export default function TrendingInvestments({ userBalance }: { userBalance: number }) {
  const [selectedAsset, setSelectedAsset] = useState(TRENDING_ASSETS[0]);
  const [investAmount, setInvestAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const amount = parseFloat(investAmount);

    if (!amount || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (amount > userBalance) {
      setError("Insufficient wallet balance.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/investments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetSymbol: selectedAsset.symbol,
          assetName: selectedAsset.name,
          amount,
          term: selectedAsset.term,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to invest.");
      }

      setSuccess(`Successfully invested $${amount} in ${selectedAsset.symbol}!`);
      setInvestAmount("");
      
      // Refresh user data in dashboard
      setTimeout(() => {
        router.refresh();
      }, 2000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top 20 List */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-navy-200 dark:border-navy-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Top 20 USA Trending
            </h3>
            <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">Select an asset to view its real-time chart and invest.</p>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row h-[600px]">
          {/* List Sidebar */}
          <div className="w-full lg:w-1/3 border-r border-navy-200 dark:border-navy-700 overflow-y-auto bg-navy-50/50 dark:bg-navy-900/20">
            {["Short", "Medium", "Long"].map((term) => (
              <div key={term}>
                <div className="sticky top-0 bg-navy-100/90 dark:bg-navy-800/90 backdrop-blur-md px-4 py-2 text-xs font-bold text-navy-500 dark:text-navy-400 uppercase tracking-wider z-10 border-y border-navy-200 dark:border-navy-700">
                  {term} Term
                </div>
                {TRENDING_ASSETS.filter(a => a.term === term).map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => { setSelectedAsset(asset); setError(""); setSuccess(""); }}
                    className={`w-full text-left px-4 py-4 border-b border-navy-100 dark:border-navy-800 transition-colors flex justify-between items-center ${
                      selectedAsset.symbol === asset.symbol 
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-l-emerald-500" 
                        : "hover:bg-white dark:hover:bg-navy-800 border-l-4 border-l-transparent"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-navy-900 dark:text-white">{asset.symbol}</div>
                      <div className="text-xs text-navy-500 dark:text-navy-400 truncate max-w-[120px]">{asset.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-navy-900 dark:text-white">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      <div className={`text-xs font-medium ${asset.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                        {asset.change}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Chart & Invest Section */}
          <div className="w-full lg:w-2/3 p-6 flex flex-col bg-white dark:bg-navy-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-navy-900 dark:text-white">{selectedAsset.symbol}</h2>
                <p className="text-navy-500 dark:text-navy-400">{selectedAsset.name}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm font-medium text-emerald-500 flex items-center justify-end gap-1">
                  <TrendingUp className="w-4 h-4" /> Real-time Market Data
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-[300px] bg-navy-50 dark:bg-navy-900 rounded-2xl border border-navy-200 dark:border-navy-700 p-4 mb-6">
              <RealTimeChart symbol={selectedAsset.symbol} basePrice={selectedAsset.price} />
            </div>

            {/* Invest Form */}
            <div className="bg-navy-50 dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-700">
              <h4 className="font-bold text-navy-900 dark:text-white mb-4">Invest in {selectedAsset.symbol}</h4>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {success}
                </div>
              )}

              <form onSubmit={handleInvest} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 font-bold">$</div>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-16 py-3 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setInvestAmount(userBalance.toString())}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase"
                  >
                    Max
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-70 flex justify-center items-center gap-2 whitespace-nowrap"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clock className="w-5 h-5" />}
                  {loading ? "Processing" : `Invest in ${selectedAsset.term} Term`}
                </button>
              </form>
              <div className="mt-3 text-xs text-navy-500 dark:text-navy-400 flex justify-between">
                <span>Available Balance: <strong className="text-navy-900 dark:text-white">${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
                <span>Term: <strong>{selectedAsset.term}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
