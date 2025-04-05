'use client'; // Add use client directive

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import useFavorites from '@/hooks/useFavorites';
import { WeatherData } from '@/utils/api'; // Import interface
import Spinner from './Spinner'; // Import Spinner

interface WeatherCardProps {
  cityName: string;
}

// Helper to get weather icon URL (adjust path/extension if needed)
const getWeatherIconUrl = (iconCode: string) => `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

const WeatherCard: React.FC<WeatherCardProps> = ({ cityName }) => {
  const { isFavorite, toggleFavorite } = useFavorites('city');
  const isFav = isFavorite(cityName);

  // Select data and error for this specific city from Redux
  const weatherData = useSelector((state: RootState) => state.weather.data[cityName]);
  const weatherError = useSelector((state: RootState) => state.weather.error[cityName]);
  const isLoading = useSelector((state: RootState) => state.weather.status === 'loading' && !state.weather.data[cityName] && !state.weather.error[cityName]);

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(cityName);
  };

  const citySlug = cityName.toLowerCase().replace(/ /g, '-');

  // Determine card content based on state
  let content;
  if (isLoading) {
      content = <div className="flex justify-center items-center h-16"><Spinner /></div>;
  } else if (weatherError) {
      content = <p className="text-sm text-red-400">Error: {weatherError}</p>;
  } else if (weatherData) {
      content = (
          <>
              <div className="flex items-center mb-1">
                 {weatherData.weather?.[0]?.icon && (
                      <img
                          src={getWeatherIconUrl(weatherData.weather[0].icon)}
                          alt={weatherData.weather[0].description}
                          width={32}
                          height={32}
                          className="mr-2"
                      />
                  )}
                <p className="text-lg font-medium text-gray-200">{Math.round(weatherData.main?.temp ?? 0)}°C</p>
              </div>
              <p className="text-sm text-gray-400 capitalize">{weatherData.weather?.[0]?.description || 'N/A'}</p>
              <p className="text-sm text-gray-400">Humidity: {weatherData.main?.humidity ?? 'N/A'}%</p>
          </>
      );
  } else {
      content = <p className="text-sm text-gray-500">Weather data unavailable.</p>;
  }

  return (
    <Link href={`/city/${citySlug}`} className="relative block p-4 border border-white/10 dark:border-gray-700 rounded-lg bg-white/5 hover:bg-white/10 dark:bg-black/10 dark:hover:bg-black/30 transition-colors shadow-md min-h-[120px]">
      <button
        onClick={handleFavoriteClick}
        className={`absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ${isFav ? 'text-red-500 dark:text-red-400' : ''}`}
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isFav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
      <h3 className="font-semibold text-lg text-blue-400 dark:text-blue-300 mb-2 pr-8">{cityName}</h3>
      {content}
    </Link>
  );
};

export default WeatherCard;
