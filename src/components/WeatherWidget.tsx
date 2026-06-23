"use client";

import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudLightning, CloudSnow, Loader2, MapPin } from "lucide-react";

export default function WeatherWidget() {
  const [weather, setWeather] = useState<{ temp: number; code: number; location: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          // Reverse geocoding (basic approximation using open-meteo geocoding API)
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=&count=1&format=json&language=en&latitude=${lat}&longitude=${lon}`);
          let locationName = "Local";
          
          // Fetch weather
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`);
          
          if (!weatherRes.ok) throw new Error("Failed to fetch weather");
          
          const weatherData = await weatherRes.json();
          
          setWeather({
            temp: Math.round(weatherData.current_weather.temperature),
            code: weatherData.current_weather.weathercode,
            location: locationName
          });
        } catch (err) {
          setError("Weather unavailable");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location access denied");
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return <div className="flex items-center text-navy-400 text-sm"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Detecting...</div>;
  }

  if (error || !weather) {
    return null; // Fail silently or show minimal error if preferred
  }

  // WMO Weather interpretation codes
  const getWeatherIcon = (code: number) => {
    if (code <= 3) return <Sun className="w-5 h-5 text-amber-500" />;
    if (code >= 45 && code <= 48) return <Cloud className="w-5 h-5 text-navy-400" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (code >= 71 && code <= 77) return <CloudSnow className="w-5 h-5 text-sky-200" />;
    if (code >= 95) return <CloudLightning className="w-5 h-5 text-amber-400" />;
    return <Cloud className="w-5 h-5 text-navy-400" />;
  };

  return (
    <div className="flex items-center gap-2 bg-navy-50 dark:bg-navy-900 px-3 py-1.5 rounded-full border border-navy-200 dark:border-navy-700 shadow-sm transition-all hover:shadow-md cursor-default">
      {getWeatherIcon(weather.code)}
      <div className="flex flex-col">
        <span className="text-sm font-bold text-navy-900 dark:text-white leading-none">{weather.temp}°F</span>
        <span className="text-[10px] text-navy-500 dark:text-navy-400 leading-none flex items-center mt-0.5"><MapPin className="w-2.5 h-2.5 mr-0.5" /> Local</span>
      </div>
    </div>
  );
}
