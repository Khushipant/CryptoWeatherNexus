'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import useFavorites from '@/hooks/useFavorites';
import { CryptoData } from '@/utils/api';
import { formatCurrency, formatPercentage, formatMarketCap } from '@/utils/formatters';
import Spinner from './Spinner';

interface CryptoCardProps {
  cryptoId: string;
}

const CryptoCard: React.FC<CryptoCardProps> = ({ cryptoId }) => {
  const { isFavorite, toggleFavorite } = useFavorites('crypto');
  const isFav = isFavorite(cryptoId);

  const cryptoData: CryptoData | undefined = useSelector((state: RootState) => state.crypto.data[cryptoId]);
  const livePrice: number | undefined = useSelector((state: RootState) => state.crypto.liveUpdates[cryptoId]);
  const cryptoError = useSelector((state: RootState) => state.crypto.error);
  const isLoading = useSelector((state: RootState) => state.crypto.status === 'loading' && !state.crypto.data[cryptoId] && !state.crypto.error);

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(cryptoId);
  };

  const displayPrice = livePrice ?? cryptoData?.market_data?.current_price?.usd;
  const change24h = cryptoData?.market_data?.price_change_percentage_24h;
  const marketCap = cryptoData?.market_data?.market_cap?.usd;
  const changeColor = change24h == null ? 'text-gray-400' : change24h >= 0 ? 'text-green-400' : 'text-red-400';

  let content;
  if (isLoading) {
    content = <div className="flex justify-center items-center h-16"><Spinner /></div>;
  } else if (cryptoError && !cryptoData && !livePrice) {
    content = <p className="text-sm text-red-400">Error: {cryptoError}</p>;
  } else if (cryptoData || livePrice !== undefined) {
    content = (
        <>
            <p className="text-lg font-medium text-gray-200">{formatCurrency(displayPrice)}</p>
            <p className={`text-sm ${changeColor}`}>{formatPercentage(change24h)} (24h)</p>
            <p className="text-xs text-gray-500">MCap: {formatMarketCap(marketCap)}</p>
        </>
    );
  } else {
      content = <p className="text-sm text-gray-500">Data unavailable.</p>;
  }

  const displayName = cryptoData?.name || (cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1));

  return (
    <Link href={`/crypto/${cryptoId}`} className="relative block p-4 border border-white/10 dark:border-gray-700 rounded-lg bg-white/5 hover:bg-white/10 dark:bg-black/10 dark:hover:bg-black/30 transition-colors shadow-md min-h-[130px]">
       <button
        onClick={handleFavoriteClick}
        className={`absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ${isFav ? 'text-red-500 dark:text-red-400' : ''}`}
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isFav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
      <h3 className="font-semibold text-lg text-green-400 dark:text-green-300 mb-2 pr-8">{displayName}</h3>
      {content}
    </Link>
  );
};

export default CryptoCard;
