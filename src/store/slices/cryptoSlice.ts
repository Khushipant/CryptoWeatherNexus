import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CryptoData } from '@/utils/api'; // Import the interface

interface CryptoState {
  // Store multiple cryptos keyed by ID, allowing updates by ID
  data: { [key: string]: CryptoData };
  history: { [key: string]: any }; // Store history per crypto ID
  favorites: string[]; // Array of crypto IDs
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  liveUpdates: { [key: string]: number }; // Store latest live price keyed by ID
}

const initialState: CryptoState = {
  data: {},
  history: {},
  favorites: [],
  status: 'idle',
  error: null,
  liveUpdates: {},
};

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    // Action to set data fetched from API (e.g., multiple coins or single coin detail)
    setCryptoData: (state, action: PayloadAction<{ [key: string]: CryptoData }>) => {
      // Merge new data with existing data
      state.data = { ...state.data, ...action.payload };
      state.status = 'succeeded';
    },
    // Action to set historical data for a specific crypto
    setCryptoHistory: (state, action: PayloadAction<{ id: string; history: any }>) => {
      state.history[action.payload.id] = action.payload.history;
    },
    // Action to update live price from WebSocket
    updateLivePrice: (state, action: PayloadAction<{ id: string; price: number }>) => {
      const { id, price } = action.payload;
      state.liveUpdates[id] = price; // Store latest live price separately

      // Optionally update the main data object if it exists
      if (state.data[id]?.market_data?.current_price) {
         state.data[id].market_data.current_price.usd = price;
      }
    },
    addFavoriteCrypto: (state, action: PayloadAction<string>) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
        // Add persistence logic (e.g., localStorage) via middleware or hook
      }
    },
    removeFavoriteCrypto: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(id => id !== action.payload);
      // Add persistence logic
    },
    // Actions for handling loading/error states during API calls
    setCryptoLoading: (state) => {
        state.status = 'loading';
    },
    setCryptoError: (state, action: PayloadAction<string>) => {
        state.status = 'failed';
        state.error = action.payload;
    }
  },
  // Add extraReducers for async thunks later if using Redux Thunk/Saga
});

export const {
  setCryptoData,
  setCryptoHistory,
  updateLivePrice,
  addFavoriteCrypto,
  removeFavoriteCrypto,
  setCryptoLoading,
  setCryptoError
} = cryptoSlice.actions;

export default cryptoSlice.reducer;
