'use client'; // Mark as client component to use hooks later

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import WeatherCard from '@/components/WeatherCard';
import CryptoCard from '@/components/CryptoCard';
import NewsCard from '@/components/NewsCard';
import NotificationList from '@/components/NotificationList'; // Import NotificationList
import { fetchCurrentWeather, fetchCryptoData, fetchCryptoNews, WeatherData, CryptoData } from '@/utils/api';
import { setWeatherData, setWeatherLoading, setWeatherError } from '@/store/slices/weatherSlice';
import { setCryptoData, setCryptoLoading, setCryptoError } from '@/store/slices/cryptoSlice';
import { setNewsLoading, setNewsSuccess, setNewsError } from '@/store/slices/newsSlice';
import { setLoading as setUiLoading } from '@/store/slices/uiSlice'; // Alias UI loading action
// Import Notification component later when needed

// Type guard to check if the result is an error object from our catch block
const isFetchError = <T extends { error: any }>(result: any): result is T => {
    return result && typeof result === 'object' && 'error' in result;
};

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { articles: newsArticles, status: newsStatus, error: newsError } = useSelector((state: RootState) => state.news);
  const overallIsLoading = useSelector((state: RootState) => state.ui.isLoading);

  // Define cities and cryptos to fetch
  const cities = ['New York', 'London', 'Tokyo'];
  const cryptoIds = ['bitcoin', 'ethereum', 'dogecoin']; // Using Dogecoin as the custom one

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const fetchData = async () => {
      if (!isMounted) return;
      dispatch(setUiLoading(true));
      let hasError = false;

      // Fetch Weather
      dispatch(setWeatherLoading());
      const weatherPromises = cities.map(city => fetchCurrentWeather(city).catch(err => ({ city, error: err })));
      const weatherResults = await Promise.all(weatherPromises);
      if (!isMounted) return;
      const weatherDataUpdates: { [key: string]: WeatherData } = {};
      weatherResults.forEach(result => {
          if (isFetchError<{ city: string; error: any }>(result)) {
              console.error(`Failed to fetch weather for ${result.city}:`, result.error);
              dispatch(setWeatherError({ city: result.city, error: result.error?.message || 'Unknown weather error' }));
              hasError = true;
          } else if (result) {
              if (result.name) {
                  weatherDataUpdates[result.name] = result as WeatherData;
              }
          }
      });
      if (Object.keys(weatherDataUpdates).length > 0) {
          dispatch(setWeatherData(weatherDataUpdates));
      }

      // Fetch Crypto (initial data)
      dispatch(setCryptoLoading());
      const cryptoPromises = cryptoIds.map(id => fetchCryptoData(id).catch(err => ({ id, error: err })));
      const cryptoResults = await Promise.all(cryptoPromises);
      if (!isMounted) return;
      const cryptoDataUpdates: { [key: string]: CryptoData } = {};
      cryptoResults.forEach(result => {
          if (isFetchError<{ id: string; error: any }>(result)) {
              console.error(`Failed to fetch crypto data for ${result.id}:`, result.error);
              dispatch(setCryptoError(result.error?.message || 'Unknown crypto error'));
              hasError = true;
          } else if (result) {
              if (result.id) {
                  cryptoDataUpdates[result.id] = result as CryptoData;
              }
          }
      });
      if (Object.keys(cryptoDataUpdates).length > 0) {
          dispatch(setCryptoData(cryptoDataUpdates));
      }

      // Fetch News
      dispatch(setNewsLoading());
      try {
        const newsResponse = await fetchCryptoNews();
        if (isMounted) {
          dispatch(setNewsSuccess(newsResponse.results.slice(0, 5)));
        }
      } catch (error) {
        if (isMounted) {
            console.error("Error fetching news:", error);
            dispatch(setNewsError(error instanceof Error ? error.message : 'Failed to fetch news'));
            hasError = true;
        }
      }

      if (isMounted) {
        dispatch(setUiLoading(false));
        if (hasError) {
            console.warn("One or more data fetches failed.");
        }
      }
    };

    fetchData();
    // Set up interval refresh (every 60 seconds as per requirements)
    const intervalId = setInterval(fetchData, 60000);

    // Cleanup interval on unmount
    return () => {
        isMounted = false; // Set flag on unmount
        clearInterval(intervalId);
    };

  }, [dispatch]); // Run once on mount and when dispatch changes (shouldn't change)

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Dashboard</h1>
      {overallIsLoading && <div className="text-white mb-4">Loading dashboard data...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mb-8">
        {/* Weather Section */}
        <section className="md:col-span-2 lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Weather</h2>
          <div className="space-y-4">
            {cities.map(city => (
              <WeatherCard key={city} cityName={city} />
            ))}
          </div>
        </section>

        {/* Cryptocurrency Section */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Cryptocurrency</h2>
          <div className="space-y-4">
            {cryptoIds.map(cryptoId => (
              <CryptoCard key={cryptoId} cryptoId={cryptoId} />
            ))}
          </div>
        </section>

        {/* News Section */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Top News</h2>
          <div className="space-y-4">
            {newsStatus === 'loading' && <p className="text-gray-300">Loading news...</p>}
            {newsStatus === 'failed' && <p className="text-red-400">Error loading news: {newsError}</p>}
            {newsStatus === 'succeeded' && newsArticles.length > 0 ? (
              newsArticles.map((article) => (
                <NewsCard key={article.article_id} newsItem={article} />
              ))
            ) : newsStatus === 'succeeded' ? (
                <p className="text-gray-400">No news articles found.</p>
            ) : null }
          </div>
        </section>
      </div>

      {/* Notification List Section */}
      <div className="w-full max-w-7xl">
          <NotificationList />
      </div>

      {/* Notification Area - To be implemented later */}
      {/* <Notification /> */}
    </main>
  );
}
