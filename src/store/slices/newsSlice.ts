import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NewsArticle } from '@/utils/api'; // Assuming NewsArticle interface is exported from api.ts

interface NewsState {
  articles: NewsArticle[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: NewsState = {
  articles: [],
  status: 'idle',
  error: null,
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setNewsLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    setNewsSuccess: (state, action: PayloadAction<NewsArticle[]>) => {
      state.articles = action.payload;
      state.status = 'succeeded';
    },
    setNewsError: (state, action: PayloadAction<string>) => {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const { setNewsLoading, setNewsSuccess, setNewsError } = newsSlice.actions;
export default newsSlice.reducer; 