"use client";

import { useEffect, useRef } from "react";

export default function HeroChart() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent multiple script injections in development
    if (!container.current || container.current.querySelector('script')) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "BINANCE:BTCUSDT",
        "interval": "60",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "backgroundColor": "rgba(15, 23, 42, 0.8)",
        "gridColor": "rgba(30, 41, 59, 0.5)",
        "hide_top_toolbar": true,
        "hide_legend": true,
        "save_image": false,
        "calendar": false,
        "hide_volume": true,
        "support_host": "https://www.tradingview.com"
      }`;
    container.current.appendChild(script);
  }, []);

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-2xl relative w-full h-[450px] border border-navy-700/50">
      <div className="absolute inset-0 z-0 bg-navy-900">
        <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
          <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
        </div>
      </div>
      {/* Overlay to prevent clicking/scrolling the chart and keep it purely decorative for the hero */}
      <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_50px_rgba(15,23,42,1)]" />
    </div>
  );
}
