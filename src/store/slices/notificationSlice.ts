import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'price_alert' | 'weather_alert' | 'info' | 'error';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
  read: boolean;
  relatedItemId?: string; // e.g., cryptoId or cityName
}

interface NotificationState {
  notifications: AppNotification[];
}

const initialState: NotificationState = {
  notifications: [],
};

let notificationIdCounter = 0;

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<AppNotification, 'id' | 'timestamp' | 'read'>>) => {
      const newNotification: AppNotification = {
        ...action.payload,
        id: `notif-${notificationIdCounter++}`,
        timestamp: Date.now(),
        read: false,
      };
      // Add to the beginning of the array and limit total notifications (e.g., 50)
      state.notifications.unshift(newNotification);
      if (state.notifications.length > 50) {
        state.notifications.pop();
      }
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    clearReadNotifications: (state) => {
        state.notifications = state.notifications.filter(n => !n.read);
    }
  },
});

export const {
    addNotification,
    markNotificationAsRead,
    clearNotifications,
    clearReadNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer; 