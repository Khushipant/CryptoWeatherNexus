'use client'; // Add use client directive

import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { AppNotification, markNotificationAsRead, NotificationType } from '@/store/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns'; // For relative time

interface NotificationItemProps {
  notification: AppNotification;
}

// Helper to get appropriate icon/color based on type
const getNotificationStyle = (type: NotificationType) => {
  switch (type) {
    case 'price_alert':
      return { icon: '🔔', color: 'text-blue-400' };
    case 'weather_alert':
      return { icon: '☁️', color: 'text-yellow-400' };
    case 'error':
      return { icon: '❌', color: 'text-red-500' };
    case 'info':
    default:
      return { icon: 'ℹ️', color: 'text-gray-400' };
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { icon, color } = getNotificationStyle(notification.type);

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent potential parent clicks
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification.id));
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });

  return (
    <div
      className={`p-3 border-b border-white/10 dark:border-gray-700 flex items-start gap-3 transition-opacity ${notification.read ? 'opacity-60' : 'opacity-100'}`}
    >
      <span className={`text-lg mt-1 ${color}`}>{icon}</span>
      <div className="flex-1">
        <p className={`text-sm mb-1 ${notification.read ? 'text-gray-400' : 'text-gray-200'}`}>
          {notification.message}
        </p>
        <span className="text-xs text-gray-500">{timeAgo}</span>
      </div>
      {!notification.read && (
        <button
          onClick={handleMarkAsRead}
          title="Mark as read"
          className="text-xs text-blue-500 hover:text-blue-400 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          Mark Read
        </button>
      )}
    </div>
  );
};

// Exporting as NotificationItem to avoid confusion with potential container component
export default NotificationItem;
