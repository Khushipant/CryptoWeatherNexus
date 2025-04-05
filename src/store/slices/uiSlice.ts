import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isLoading: boolean;
  error: string | null;
  isNotificationDrawerOpen: boolean;
}

const initialState: UiState = {
  isLoading: false,
  error: null,
  isNotificationDrawerOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    toggleNotificationDrawer: (state) => {
      state.isNotificationDrawerOpen = !state.isNotificationDrawerOpen;
    },
    setNotificationDrawerOpen: (state, action: PayloadAction<boolean>) => {
        state.isNotificationDrawerOpen = action.payload;
    }
  },
});

export const { setLoading, setError, toggleNotificationDrawer, setNotificationDrawerOpen } = uiSlice.actions;
export default uiSlice.reducer;
