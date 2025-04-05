'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { fetchCryptoData, fetchCryptoHistory, CryptoData, CryptoHistoryData } from '@/utils/api';
import { formatCurrency, formatPercentage, formatMarketCap, formatDate } from '@/utils/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Helper to format history data for the chart
const formatHistoryChartData = (historyData: CryptoHistoryData | null) => {
  if (!historyData?.prices) return [];
  return historyData.prices.map(([timestamp, price]) => ({
    date: new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: price,
  }));
};

export default function CryptoDetailPage() {
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const [cryptoId, setCryptoId] = useState<string | null>(null);
  const [cryptoData, setCryptoData] = useState<CryptoData | null>(null);
  const [historyData, setHistoryData] = useState<CryptoHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimespan, setSelectedTimespan] = useState<number>(7); // Default to 7 days

  useEffect(() => {
    if (params?.id && typeof params.id === 'string') {
      setCryptoId(decodeURIComponent(params.id));
    }
  }, [params]);

  useEffect(() => {
    if (!cryptoId) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch details and history concurrently
        const [details, history] = await Promise.all([
          fetchCryptoData(cryptoId),
          fetchCryptoHistory(cryptoId, selectedTimespan) // Use selected timespan
        ]);
        setCryptoData(details);
        setHistoryData(history);
      } catch (err) {
        console.error("Failed to load crypto data:", err);
        setError(err instanceof Error ? err.message : 'Failed to load cryptocurrency data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [cryptoId, dispatch, selectedTimespan]); // Re-fetch if ID or timespan changes

  const chartData = formatHistoryChartData(historyData);
  const displayName = cryptoData?.name || (cryptoId ? (cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1)) : "Crypto");

  const handleTimespanChange = (days: number) => {
      setSelectedTimespan(days);
  };

  const timespanOptions = [1, 7, 30, 90, 365];

  return (
    <div className="container mx-auto px-4 py-8 text-white min-h-screen">
      <Link href="/" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">&larr; Back to Dashboard</Link>

      <h1 className="text-3xl font-bold mb-2">{displayName} ({cryptoData?.symbol?.toUpperCase()})</h1>
      {cryptoData?.name && <p className="text-gray-400 mb-6">Detailed view for {cryptoData.name}</p>}

      {isLoading && <p className="text-gray-300">Loading details...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!isLoading && !error && cryptoData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Key Metrics Card */}
          <div className="lg:col-span-1 bg-white/10 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/10">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Key Metrics</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Price:</span>
                <span className="font-medium text-gray-100">{formatCurrency(cryptoData.market_data?.current_price?.usd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">24h Change:</span>
                <span className={`font-medium ${cryptoData.market_data?.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercentage(cryptoData.market_data?.price_change_percentage_24h)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Market Cap:</span>
                <span className="font-medium text-gray-100">{formatMarketCap(cryptoData.market_data?.market_cap?.usd)}</span>
              </div>
              {/* Add Volume, Rank etc. if needed */}
               <div className="flex justify-between">
                <span className="text-gray-400">24h Volume:</span>
                <span className="font-medium text-gray-100">{formatMarketCap(cryptoData.market_data?.total_volume?.usd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Market Cap Rank:</span>
                <span className="font-medium text-gray-100">#{cryptoData.market_data?.market_cap_rank || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Price Chart Card */}
          <div className="lg:col-span-2 bg-white/10 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/10">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-semibold text-gray-200">Price History ({selectedTimespan}d)</h2>
                 <div className="flex space-x-2">
                    {timespanOptions.map(days => (
                        <button
                            key={days}
                            onClick={() => handleTimespanChange(days)}
                            className={`px-3 py-1 text-xs rounded ${selectedTimespan === days ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} transition-colors`}
                        >
                            {days}{days === 1 ? 'D' : 'D'}
                        </button>
                    ))}
                 </div>
            </div>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }} // Adjusted margins
                >
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="date" stroke="#ccc" fontSize={10} />
                  <YAxis stroke="#ccc" fontSize={10} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(30, 30, 30, 0.8)', border: 'none' }}
                    itemStyle={{ color: '#eee' }}
                    labelStyle={{ color: '#aaa' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="price" stroke="#8884d8" fillOpacity={1} fill="url(#colorPrice)" name="Price" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
                 <p className="text-gray-400 h-[300px] flex items-center justify-center">No historical data available for this period.</p>
             )}
          </div>
        </div>
      )}

      {!isLoading && !error && !cryptoData && (
          <p className="text-gray-400">Could not find data for the specified cryptocurrency.</p>
      )}
    </div>
  );
}
