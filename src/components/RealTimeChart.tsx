"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type DataPoint = {
  time: string;
  value: number;
};

export default function RealTimeChart({ symbol, basePrice }: { symbol: string, basePrice: number }) {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Generate initial realistic-looking past data
    const initialData = Array.from({ length: 30 }).map((_, i) => ({
      time: new Date(Date.now() - (30 - i) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      value: basePrice + (Math.sin(i / 2) * (basePrice * 0.05)) + (Math.random() * (basePrice * 0.02) - (basePrice * 0.01)),
    }));
    setData(initialData);

    // Simulate real-time updates every 2 seconds
    let currentStep = 30;
    const interval = setInterval(() => {
      setData((prev) => {
        const lastValue = prev[prev.length - 1].value;
        const newValue = lastValue + (Math.sin(currentStep / 2) * (basePrice * 0.01)) + (Math.random() * (basePrice * 0.02) - (basePrice * 0.01));
        
        currentStep++;
        const newPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          value: newValue,
        };
        return [...prev.slice(1), newPoint]; // Keep last 30 points
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [basePrice]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            hide={true} 
          />
          <YAxis 
            domain={['auto', 'auto']} 
            hide={true} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#10b981' }}
            formatter={(val: number) => [`$${val.toFixed(2)}`, 'Price']}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            isAnimationActive={false} // Disable animation for smoother real-time feel
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
