'use client'; // Add use client directive

import React from 'react';
import { NewsArticle } from '@/utils/api'; // Import the interface
import { formatDate } from '@/utils/formatters'; // Import formatter

interface NewsCardProps {
  newsItem: NewsArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem }) => {
  const { title, source_id, link, pubDate } = newsItem;

  // Use link directly, target="_blank" ensures it opens in a new tab
  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block p-3 border border-white/10 dark:border-gray-700 rounded-lg bg-white/5 hover:bg-white/10 dark:bg-black/10 dark:hover:bg-black/30 transition-colors shadow-md"
    >
      <h4 className="font-medium text-sm text-purple-300 dark:text-purple-300 mb-1 line-clamp-2">{title || "Untitled Article"}</h4>
      <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
          <span className="capitalize truncate pr-2">{source_id || "Unknown Source"}</span>
          <span>{formatDate(pubDate)}</span>
      </div>
    </a>
  );
};

export default NewsCard;
