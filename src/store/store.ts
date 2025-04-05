import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import weatherReducer from './slices/weatherSlice';
import cryptoReducer from './slices/cryptoSlice';
import newsReducer from './slices/newsSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    weather: weatherReducer,
    crypto: cryptoReducer,
    news: newsReducer,
    notifications: notificationReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {ui: UiState, weather: WeatherState, crypto: CryptoState, news: NewsState}
export type AppDispatch = typeof store.dispatch;
