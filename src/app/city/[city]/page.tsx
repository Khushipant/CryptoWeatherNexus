'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { AppDispatch } from '@/store/store';
import { fetchCurrentWeather, fetchWeatherHistory, WeatherData } from '@/utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate } from '@/utils/formatters';

// Interface for the forecast list item (adjust based on actual API response)
interface ForecastItem {
  dt: number;
  main: { temp: number; humidity: number };
  weather: { description: string; icon: string }[];
  dt_txt: string;
}

// Helper to format data for the chart
const formatChartData = (forecastData: any) => {
  if (!forecastData?.list) return [];
  return forecastData.list.map((item: ForecastItem) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    temp: Math.round(item.main.temp),
  }));
};

const getWeatherIconUrl = (iconCode: string) => `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

export default function CityDetailPage() {
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const [citySlug, setCitySlug] = useState<string | null>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params?.city && typeof params.city === 'string') {
      const decodedCitySlug = decodeURIComponent(params.city);
      setCitySlug(decodedCitySlug);
    }
  }, [params]);

  useEffect(() => {
    if (!citySlug) return;

    const cityName = citySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [currentData, forecastData] = await Promise.all([
          fetchCurrentWeather(cityName),
          fetchWeatherHistory(cityName)
        ]);
        setCurrentWeather(currentData);
        setForecast(forecastData);
      } catch (err) {
        console.error("Failed to load city data:", err);
        setError(err instanceof Error ? err.message : 'Failed to load weather data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [citySlug, dispatch]);

  const chartData = formatChartData(forecast);
  const cityNameDisplay = citySlug ? citySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "City";

  return (
    <div className="container mx-auto px-4 py-8 text-white min-h-screen">
      <Link href="/" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">&larr; Back to Dashboard</Link>

      <h1 className="text-3xl font-bold mb-6">Weather Details: {cityNameDisplay}</h1>

      {isLoading && <p className="text-gray-300">Loading weather details...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!isLoading && !error && currentWeather && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Current Conditions Card */}
          <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/10">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Current Conditions</h2>
            <div className="flex items-center mb-2">
              {currentWeather.weather?.[0]?.icon && (
                <img
                  src={getWeatherIconUrl(currentWeather.weather[0].icon)}
                  alt={currentWeather.weather[0].description}
                  width={48}
                  height={48}
                  className="mr-3"
                />
              )}
              <span className="text-4xl font-bold text-gray-100">{Math.round(currentWeather.main?.temp ?? 0)}°C</span>
            </div>
            <p className="text-lg capitalize mb-4 text-gray-300">{currentWeather.weather?.[0]?.description}</p>
            <div className="text-sm text-gray-400 space-y-1">
              <p>Humidity: {currentWeather.main?.humidity ?? 'N/A'}%</p>
              {/* Add more details like wind, pressure if available */}
            </div>
          </div>

          {/* Placeholder for additional info */}
          <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/10">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Additional Info</h2>
            <p className="text-gray-400">(e.g., Wind speed, Pressure, Sunrise/Sunset times - Add based on API availability)</p>
          </div>
        </div>
      )}

      {!isLoading && !error && forecast && chartData.length > 0 && (
        <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/10 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Temperature Forecast (5 Day / 3 Hour)</h2>
          {/* Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{
                top: 5, right: 30, left: 0, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="time" stroke="#ccc" />
              <YAxis stroke="#ccc" label={{ value: '°C', angle: -90, position: 'insideLeft', fill: '#ccc' }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', border: 'none' }}
                itemStyle={{ color: '#eee' }}
                labelStyle={{ color: '#aaa' }}
              />
              <Line type="monotone" dataKey="temp" name="Temperature" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
