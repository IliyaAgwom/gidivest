"use client";

import { useEffect, useState, useCallback } from "react";
import { TrendingUp, TrendingDown, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";

const COIN_IDS = [
  "bitcoin",
  "ethereum",
  "binancecoin",
  "solana",
  "ripple",
  "dogecoin",
  "cardano",
  "avalanche-2",
  "chainlink",
  "polkadot",
  "tron",
  "shiba-inu",
  "litecoin",
  "uniswap",
  "stellar",
  "near",
  "aptos",
  "arbitrum",
  "optimism",
  "sui",
];

const COIN_SYMBOLS: Record<string, string> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  binancecoin: "BNB",
  solana: "SOL",
  ripple: "XRP",
  dogecoin: "DOGE",
  cardano: "ADA",
  "avalanche-2": "AVAX",
  chainlink: "LINK",
  polkadot: "DOT",
  tron: "TRX",
  "shiba-inu": "SHIB",
  litecoin: "LTC",
  uniswap: "UNI",
  stellar: "XLM",
  near: "NEAR",
  aptos: "APT",
  arbitrum: "ARB",
  optimism: "OP",
  sui: "SUI",
};

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
  market_cap_rank: number;
}

export default function CryptoMarket() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPrices = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const ids = COIN_IDS.join(",");
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`,
        { next: { revalidate: 0 } }
      );
      if (res.ok) {
        const data: CoinData[] = await res.json();
        setCoins(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("CryptoMarket fetch error", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(() => fetchPrices(true), 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const formatPrice = (price: number) => {
    if (price < 0.001) return `$${price.toFixed(8)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 100) return `$${price.toFixed(2)}`;
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(1)}M`;
    return `$${vol.toLocaleString()}`;
  };

  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-navy-200 dark:border-navy-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <span className="text-lg">📈</span>
          </div>
          <div>
            <h3 className="font-bold text-navy-900 dark:text-white text-base">Crypto Market</h3>
            <p className="text-xs text-navy-500 dark:text-navy-400">
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                : "Loading live prices…"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPrices(true)}
            disabled={refreshing}
            title="Refresh prices"
            className="p-2 text-navy-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-500" : ""}`} />
          </button>
          <Link
            href="/dashboard/invest"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Invest <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Table */}
      {loading && coins.length === 0 ? (
        <div className="flex items-center justify-center h-48 gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
          <span className="text-sm text-navy-500 dark:text-navy-400">Fetching live prices…</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-xs text-navy-500 dark:text-navy-400 border-b border-navy-100 dark:border-navy-700 bg-navy-50/50 dark:bg-navy-900/30">
                <th className="py-3 px-4 font-semibold text-left">#</th>
                <th className="py-3 px-4 font-semibold text-left">Coin</th>
                <th className="py-3 px-4 font-semibold text-right">Price</th>
                <th className="py-3 px-4 font-semibold text-right">24h %</th>
                <th className="py-3 px-4 font-semibold text-right hidden md:table-cell">Volume 24h</th>
                <th className="py-3 px-4 font-semibold text-right hidden lg:table-cell">Market Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50 dark:divide-navy-800">
              {coins.map((coin) => {
                const isUp = coin.price_change_percentage_24h >= 0;
                return (
                  <tr
                    key={coin.id}
                    className="hover:bg-navy-50/60 dark:hover:bg-navy-900/40 transition-colors cursor-default"
                  >
                    <td className="py-3 px-4 text-navy-400 dark:text-navy-500 font-medium">
                      {coin.market_cap_rank}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" />
                        <div>
                          <div className="font-bold text-navy-900 dark:text-white">
                            {COIN_SYMBOLS[coin.id] || coin.symbol.toUpperCase()}
                          </div>
                          <div className="text-xs text-navy-500 dark:text-navy-400 truncate max-w-[100px]">
                            {coin.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-navy-900 dark:text-white font-mono">
                      {formatPrice(coin.current_price)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-xs px-2 py-1 rounded-full ${
                          isUp
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? "+" : ""}
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-navy-600 dark:text-navy-400 hidden md:table-cell">
                      {formatVolume(coin.total_volume)}
                    </td>
                    <td className="py-3 px-4 text-right text-navy-600 dark:text-navy-400 hidden lg:table-cell">
                      {formatVolume(coin.market_cap)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Live indicator strip */}
      <div className="px-5 py-2.5 bg-navy-50/60 dark:bg-navy-900/30 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-navy-500 dark:text-navy-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Live prices via CoinGecko · auto-refresh every 30s
        </div>
        <span className="text-xs text-navy-400 dark:text-navy-500">Top 20 by Market Cap</span>
      </div>
    </div>
  );
}
