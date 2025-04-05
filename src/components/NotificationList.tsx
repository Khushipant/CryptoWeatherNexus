'use client';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { clearNotifications, clearReadNotifications } from '@/store/slices/notificationSlice';
import NotificationItem from './Notification'; // Assuming the item component is Notification.tsx

const NotificationList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector((state: RootState) => state.notifications.notifications);

  const handleClearAll = () => {
    dispatch(clearNotifications());
  };

  const handleClearRead = () => {
    dispatch(clearReadNotifications());
  };

  return (
    <div className="bg-white/10 dark:bg-black/20 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-white/10 max-h-[400px] overflow-y-auto">
      <div className="flex justify-between items-center mb-3 px-2">
        <h3 className="text-lg font-semibold text-gray-200">Recent Notifications</h3>
        <div className="space-x-2">
           <button 
            onClick={handleClearRead}
            disabled={!notifications.some(n => n.read)} // Disable if no read notifications
            className="text-xs text-yellow-400 hover:text-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Read
          </button>
           <button 
            onClick={handleClearAll}
            disabled={notifications.length === 0} // Disable if no notifications
            className="text-xs text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All
          </button>
        </div>
      </div>
      {notifications.length === 0 ? (
        <p className="text-center text-gray-400 py-4">No recent notifications.</p>
      ) : (
        <div className="space-y-0">
          {notifications.map(notification => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList; 