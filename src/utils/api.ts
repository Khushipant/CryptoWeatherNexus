// src/utils/api.ts

// --- Interfaces (Define more accurately based on actual API responses) ---

export interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  name: string;
}

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  market_data: {
    current_price: { [currency: string]: number };
    market_cap: { [currency: string]: number };
    price_change_percentage_24h: number;
    total_volume: { [currency: string]: number };
    market_cap_rank: number;
  };
}

export interface CryptoHistoryData {
    prices: [number, number][]; // [timestamp, price]
    market_caps: [number, number][];
    total_volumes: [number, number][];
}

export interface NewsArticle {
  article_id: string;
  title: string;
  link: string;
  source_id: string;
  source_priority: number;
  pubDate: string;
  description?: string;
  content?: string;
}

export interface NewsApiResponse {
    status: string;
    totalResults: number;
    results: NewsArticle[];
}

// --- API Base URLs and Keys (Use environment variables!) ---
const OPENWEATHERMAP_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || 'YOUR_OPENWEATHERMAP_API_KEY';
const OPENWEATHERMAP_BASE_URL = 'https://api.openweathermap.org/data/2.5';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

const NEWSDATA_API_KEY = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY || 'YOUR_NEWSDATA_API_KEY';
const NEWSDATA_BASE_URL = 'https://newsdata.io/api/1';

// --- Helper Function for Fetching ---
async function fetchData<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Try to parse error details
      console.error('API Error:', response.status, response.statusText, errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

// --- API Functions ---

// OpenWeatherMap
export const fetchCurrentWeather = (city: string): Promise<WeatherData> => {
  const url = `${OPENWEATHERMAP_BASE_URL}/weather?q=${city}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
  return fetchData<WeatherData>(url);
};

// Note: OpenWeatherMap historical data might require specific plans or different endpoints.
// This function is a placeholder or might fetch forecast data instead.
export const fetchWeatherHistory = (city: string): Promise<any> => {
    // Example using 5 day / 3 hour forecast endpoint as a stand-in for history
    const url = `${OPENWEATHERMAP_BASE_URL}/forecast?q=${city}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
    console.warn('fetchWeatherHistory is using forecast data as a placeholder.');
    return fetchData<any>(url);
};

// CoinGecko
export const fetchCryptoList = (): Promise<any[]> => {
    // Fetches top 100 coins by market cap
    const url = `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
    return fetchData<any[]>(url);
};

export const fetchCryptoData = (cryptoId: string): Promise<CryptoData> => {
  const url = `${COINGECKO_BASE_URL}/coins/${cryptoId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
  return fetchData<CryptoData>(url);
};

export const fetchCryptoHistory = (cryptoId: string, days: number = 7): Promise<CryptoHistoryData> => {
  const url = `${COINGECKO_BASE_URL}/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}`;
  return fetchData<CryptoHistoryData>(url);
};

// NewsData.io
export const fetchCryptoNews = (query: string = 'cryptocurrency'): Promise<NewsApiResponse> => {
  // Ensure API key is present
  if (!NEWSDATA_API_KEY || NEWSDATA_API_KEY === 'YOUR_NEWSDATA_API_KEY') {
      console.error('NewsData.io API key is missing or invalid.');
      return Promise.reject('Missing NewsData.io API Key');
  }
  const url = `${NEWSDATA_BASE_URL}/news?apikey=${NEWSDATA_API_KEY}&q=${query}&language=en&category=business,technology`;
  return fetchData<NewsApiResponse>(url);
};
