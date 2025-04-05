import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WeatherData } from '@/utils/api';

// Define interfaces later based on API responses
interface WeatherState {
  data: { [cityName: string]: WeatherData }; // Store by city name
  history: { [cityName: string]: any };
  favorites: string[]; // Array of city names
  displayedCities: string[]; // Cities currently shown on the dashboard
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: { [cityName: string]: string | null }; // Store errors per city
}

const initialState: WeatherState = {
  data: {},
  history: {},
  favorites: [],
  displayedCities: ['New York', 'London', 'Tokyo'], // Initialize with defaults
  status: 'idle',
  error: {},
};

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    setWeatherLoading: (state) => {
        state.status = 'loading';
        // Optionally clear city-specific errors on new load
        // state.error = {};
    },
    setWeatherData: (state, action: PayloadAction<{ [cityName: string]: WeatherData }>) => {
      // Merge new data with existing data
      state.data = { ...state.data, ...action.payload };
      state.status = 'succeeded';
       // Clear errors for successfully fetched cities
      Object.keys(action.payload).forEach(city => {
          if (state.error[city]) {
              state.error[city] = null;
          }
      });
    },
    setWeatherHistory: (state, action: PayloadAction<{ city: string, history: any }>) => {
      state.history[action.payload.city] = action.payload.history;
    },
    setWeatherError: (state, action: PayloadAction<{ city: string; error: string }>) => {
        state.status = 'failed'; // Set general status to failed if any city fails
        state.error[action.payload.city] = action.payload.error;
    },
    addFavoriteCity: (state, action: PayloadAction<string>) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFavoriteCity: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(city => city !== action.payload);
    },
    updateDisplayedCity: (state, action: PayloadAction<{ index: number; newCity: string }>) => {
        const { index, newCity } = action.payload;
        if (index >= 0 && index < state.displayedCities.length && newCity) {
            const oldCity = state.displayedCities[index];
            state.displayedCities[index] = newCity;
        }
    },
  },
});

export const {
    setWeatherLoading,
    setWeatherData,
    setWeatherHistory,
    setWeatherError,
    addFavoriteCity,
    removeFavoriteCity,
    updateDisplayedCity
} = weatherSlice.actions;

export default weatherSlice.reducer;
