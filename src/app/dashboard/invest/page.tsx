"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp, TrendingDown, Wallet, Clock, AlertCircle,
  CheckCircle, Loader2, RefreshCw, BarChart2, Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";

/* ─────────────────────────────────────────────
   Asset catalogue — 20 curated investable assets
───────────────────────────────────────────── */
const ASSETS = [
  // Crypto
  { id: "bitcoin",       symbol: "BTC",  name: "Bitcoin",           term: "Medium", type: "Crypto" },
  { id: "ethereum",      symbol: "ETH",  name: "Ethereum",          term: "Medium", type: "Crypto" },
  { id: "solana",        symbol: "SOL",  name: "Solana",            term: "Short",  type: "Crypto" },
  { id: "binancecoin",   symbol: "BNB",  name: "BNB",               term: "Medium", type: "Crypto" },
  { id: "ripple",        symbol: "XRP",  name: "Ripple",            term: "Short",  type: "Crypto" },
  { id: "dogecoin",      symbol: "DOGE", name: "Dogecoin",          term: "Short",  type: "Crypto" },
  { id: "avalanche-2",   symbol: "AVAX", name: "Avalanche",         term: "Medium", type: "Crypto" },
  { id: "chainlink",     symbol: "LINK", name: "Chainlink",         term: "Medium", type: "Crypto" },
  // Stocks / ETFs (using CoinGecko-compatible crypto proxies for live data)
  { id: "cardano",       symbol: "ADA",  name: "Cardano",           term: "Long",   type: "Crypto" },
  { id: "polkadot",      symbol: "DOT",  name: "Polkadot",          term: "Long",   type: "Crypto" },
  { id: "tron",          symbol: "TRX",  name: "Tron",              term: "Short",  type: "Crypto" },
  { id: "shiba-inu",     symbol: "SHIB", name: "Shiba Inu",         term: "Short",  type: "Crypto" },
  { id: "litecoin",      symbol: "LTC",  name: "Litecoin",          term: "Medium", type: "Crypto" },
  { id: "uniswap",       symbol: "UNI",  name: "Uniswap",           term: "Medium", type: "DeFi"   },
  { id: "stellar",       symbol: "XLM",  name: "Stellar",           term: "Long",   type: "Crypto" },
  { id: "near",          symbol: "NEAR", name: "NEAR Protocol",     term: "Medium", type: "Crypto" },
  { id: "aptos",         symbol: "APT",  name: "Aptos",             term: "Short",  type: "Crypto" },
  { id: "arbitrum",      symbol: "ARB",  name: "Arbitrum",          term: "Medium", type: "DeFi"   },
  { id: "optimism",      symbol: "OP",   name: "Optimism",          term: "Medium", type: "DeFi"   },
  { id: "sui",           symbol: "SUI",  name: "Sui",               term: "Short",  type: "Crypto" },
];

const TERM_COLORS: Record<string, string> = {
  Short:  "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Medium: "bg-blue-50  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400",
  Long:   "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

const TYPE_COLORS: Record<string, string> = {
  Crypto: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  DeFi:   "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
};

interface LivePrice {
  id: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
}

type UserInvestment = {
  id: string;
  assetName: string;
  assetSymbol: string;
  amount: number;
  term: string;
  createdAt: string;
};

type UserData = {
  walletBalance: number;
  investments: UserInvestment[];
};

export default function InvestPage() {
  const router = useRouter();

  /* ── Live price state ── */
  const [prices, setPrices]           = useState<Record<string, LivePrice>>({});
  const [pricesLoading, setPricesLoading] = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  /* ── User & active investments ── */
  const [user, setUser]               = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  /* ── Selected asset & invest form ── */
  const [selected, setSelected]       = useState(ASSETS[0]);
  const [amount, setAmount]           = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");

  /* ── Sell state ── */
  const [selling, setSelling]         = useState<string | null>(null);

  /* ── Fetch live prices ── */
  const fetchPrices = useCallback(async (silent = false) => {
    if (!silent) setPricesLoading(true);
    else setRefreshing(true);
    try {
      const ids = ASSETS.map((a) => a.id).join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=false`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data: LivePrice[] = await res.json();
        const map: Record<string, LivePrice> = {};
        data.forEach((c) => { map[c.id] = c; });
        setPrices(map);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPricesLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* ── Fetch user data ── */
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/user/me");
      if (res.ok) setUser(await res.json());
    } finally {
      setUserLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    fetchUser();
    const iv = setInterval(() => fetchPrices(true), 30000);
    return () => clearInterval(iv);
  }, [fetchPrices, fetchUser]);

  /* ── Invest handler ── */
  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return setError("Enter a valid amount.");
    if (user && amt > user.walletBalance) return setError("Insufficient wallet balance.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/investments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetSymbol: selected.symbol,
          assetName: selected.name,
          amount: amt,
          term: selected.term,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to invest.");
      setSuccess(`Successfully invested $${amt.toLocaleString()} in ${selected.symbol}!`);
      setAmount("");
      fetchUser();
      setTimeout(() => { router.refresh(); }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Sell handler ── */
  const handleSell = async (investmentId: string) => {
    if (!confirm("Sell this investment? The principal + profit will return to your wallet.")) return;
    setSelling(investmentId);
    try {
      const res = await fetch("/api/investments/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investmentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Sold! Payout: $${data.payout?.toFixed(2)} · Profit: $${data.profit?.toFixed(2)}`);
      fetchUser();
    } catch (err: any) {
      alert(err.message || "Failed to sell.");
    } finally {
      setSelling(null);
    }
  };

  const livePrice = (id: string) => prices[id]?.current_price ?? null;
  const liveChange = (id: string) => prices[id]?.price_change_percentage_24h ?? null;

  const formatPrice = (p: number | null) => {
    if (p === null) return "—";
    if (p < 0.001)  return `$${p.toFixed(8)}`;
    if (p < 1)      return `$${p.toFixed(4)}`;
    return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-8">

      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-7 h-7 text-emerald-500" /> Investments
          </h1>
          <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">
            Browse 20 live assets, invest instantly, and manage your portfolio.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-navy-500 dark:text-navy-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          {lastUpdated
            ? `Prices updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
            : "Loading live prices…"}
          <button
            onClick={() => fetchPrices(true)}
            disabled={refreshing}
            className="p-1.5 hover:bg-navy-100 dark:hover:bg-navy-700 rounded-lg transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Active investments table ── */}
      {!userLoading && user?.investments && user.investments.length > 0 && (
        <div className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-navy-200 dark:border-navy-700 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-navy-900 dark:text-white">Your Active Investments</h3>
            <span className="ml-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
              {user.investments.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-xs text-navy-500 dark:text-navy-400 border-b border-navy-100 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-900/30">
                  <th className="py-3 px-5 font-semibold text-left">Asset</th>
                  <th className="py-3 px-5 font-semibold text-right">Invested</th>
                  <th className="py-3 px-5 font-semibold text-center">Term</th>
                  <th className="py-3 px-5 font-semibold text-left hidden md:table-cell">Started</th>
                  <th className="py-3 px-5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50 dark:divide-navy-800">
                {user.investments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-navy-50/60 dark:hover:bg-navy-900/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center font-bold text-xs text-emerald-700 dark:text-emerald-400">
                          {inv.assetSymbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-navy-900 dark:text-white">{inv.assetSymbol}</div>
                          <div className="text-xs text-navy-500 dark:text-navy-400">{inv.assetName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right font-semibold text-navy-900 dark:text-white">
                      ${inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${TERM_COLORS[inv.term] || ""}`}>
                        {inv.term}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-navy-500 dark:text-navy-400 text-xs hidden md:table-cell">
                      {new Date(inv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleSell(inv.id)}
                        disabled={selling === inv.id}
                        className="px-4 py-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 hover:border-transparent dark:bg-red-900/20 dark:hover:bg-red-500 dark:text-red-400 dark:hover:text-white dark:border-red-800 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {selling === inv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        Sell
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Balance pill ── */}
      {user && (
        <div className="flex items-center gap-2 text-sm">
          <Wallet className="w-4 h-4 text-emerald-500" />
          <span className="text-navy-500 dark:text-navy-400">Available to invest:</span>
          <span className="font-bold text-navy-900 dark:text-white">
            ${user.walletBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {/* ── Market panel ── */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-navy-200 dark:border-navy-700 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-navy-900 dark:text-white">Top 20 Investable Assets · Live Prices</h3>
        </div>

        <div className="flex flex-col lg:flex-row" style={{ minHeight: 560 }}>
          {/* ── Asset list sidebar ── */}
          <div className="w-full lg:w-[320px] shrink-0 border-b lg:border-b-0 lg:border-r border-navy-200 dark:border-navy-700 overflow-y-auto bg-navy-50/40 dark:bg-navy-900/20">
            {(["Short", "Medium", "Long"] as const).map((term) => (
              <div key={term}>
                <div className="sticky top-0 px-4 py-2 text-[11px] font-bold tracking-widest uppercase text-navy-400 dark:text-navy-500 bg-navy-100/90 dark:bg-navy-800/90 backdrop-blur border-y border-navy-200 dark:border-navy-700 z-10">
                  {term} Term
                </div>
                {ASSETS.filter((a) => a.term === term).map((asset) => {
                  const price  = livePrice(asset.id);
                  const change = liveChange(asset.id);
                  const isUp   = (change ?? 0) >= 0;
                  const active = selected.id === asset.id;
                  return (
                    <button
                      key={asset.id}
                      onClick={() => { setSelected(asset); setError(""); setSuccess(""); }}
                      className={`w-full text-left px-4 py-3.5 border-b border-navy-100 dark:border-navy-800 transition-colors flex justify-between items-center ${
                        active
                          ? "bg-emerald-50 dark:bg-emerald-900/20 border-l-[3px] border-l-emerald-500"
                          : "hover:bg-white dark:hover:bg-navy-800 border-l-[3px] border-l-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {prices[asset.id]?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={prices[asset.id].image} alt={asset.symbol} className="w-7 h-7 rounded-full" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-navy-200 dark:bg-navy-700 animate-pulse" />
                        )}
                        <div>
                          <div className="font-bold text-navy-900 dark:text-white text-sm">{asset.symbol}</div>
                          <div className="text-xs text-navy-500 dark:text-navy-400 truncate max-w-[100px]">{asset.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-navy-900 dark:text-white text-sm font-mono">
                          {pricesLoading && !prices[asset.id] ? (
                            <span className="w-16 h-4 bg-navy-200 dark:bg-navy-700 rounded animate-pulse inline-block" />
                          ) : formatPrice(price)}
                        </div>
                        {change !== null && (
                          <div className={`text-xs font-semibold ${isUp ? "text-emerald-500" : "text-red-500"}`}>
                            {isUp ? "+" : ""}{change.toFixed(2)}%
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* ── Detail + invest panel ── */}
          <div className="flex-1 p-6 flex flex-col bg-white dark:bg-navy-800">
            {/* Asset header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                {prices[selected.id]?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={prices[selected.id].image} alt={selected.symbol} className="w-12 h-12 rounded-full shadow" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-navy-200 dark:bg-navy-700 animate-pulse" />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-navy-900 dark:text-white">{selected.symbol}</h2>
                  <p className="text-navy-500 dark:text-navy-400 text-sm">{selected.name}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-navy-900 dark:text-white font-mono">
                  {pricesLoading && !prices[selected.id] ? (
                    <span className="w-28 h-8 bg-navy-200 dark:bg-navy-700 rounded-lg animate-pulse inline-block" />
                  ) : formatPrice(livePrice(selected.id))}
                </div>
                {liveChange(selected.id) !== null && (
                  <div className={`flex items-center justify-end gap-1 text-sm font-semibold mt-1 ${(liveChange(selected.id) ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {(liveChange(selected.id) ?? 0) >= 0
                      ? <TrendingUp className="w-4 h-4" />
                      : <TrendingDown className="w-4 h-4" />}
                    {(liveChange(selected.id) ?? 0) >= 0 ? "+" : ""}
                    {(liveChange(selected.id) ?? 0).toFixed(2)}% (24h)
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex gap-2 mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${TERM_COLORS[selected.term]}`}>
                {selected.term} Term
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${TYPE_COLORS[selected.type] || ""}`}>
                {selected.type}
              </span>
            </div>

            {/* Animated sparkline placeholder — visual breathing chart */}
            <div className="flex-1 min-h-[180px] mb-6 rounded-2xl bg-gradient-to-br from-navy-50 to-emerald-50/30 dark:from-navy-900 dark:to-emerald-950/20 border border-navy-200 dark:border-navy-700 p-4 relative overflow-hidden">
              <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Animated chart line */}
                <path
                  d="M0,90 C40,70 80,100 120,60 C160,20 200,80 240,50 C280,20 320,70 360,40 L400,30 L400,120 L0,120 Z"
                  fill="url(#sparkGrad)"
                  className="opacity-80"
                />
                <path
                  d="M0,90 C40,70 80,100 120,60 C160,20 200,80 240,50 C280,20 320,70 360,40 L400,30"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute top-3 left-4 text-xs text-navy-500 dark:text-navy-400 font-medium">Price trend (24h)</div>
              <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </div>
            </div>

            {/* Invest form */}
            <div className="bg-navy-50 dark:bg-navy-900 rounded-2xl p-5 border border-navy-200 dark:border-navy-700">
              <h4 className="font-bold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Invest in {selected.symbol}
              </h4>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" /> {success}
                </div>
              )}

              <form onSubmit={handleInvest} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-navy-500 select-none">$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-16 py-3 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(String(user?.walletBalance ?? ""))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    MAX
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clock className="w-5 h-5" />}
                  {submitting ? "Processing…" : `Invest · ${selected.term} Term`}
                </button>
              </form>

              <div className="mt-3 flex items-center justify-between text-xs text-navy-500 dark:text-navy-400">
                <span>
                  Balance:{" "}
                  <strong className="text-navy-900 dark:text-white">
                    ${(user?.walletBalance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </strong>
                </span>
                <span>
                  Term: <strong className="text-navy-900 dark:text-white">{selected.term}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
