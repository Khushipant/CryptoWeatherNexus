import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
// Import the actual action from the crypto slice
import { updateLivePrice } from '@/store/slices/cryptoSlice';
import { addNotification } from '@/store/slices/notificationSlice';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/utils/formatters';

const COINCAP_WS_URL = 'wss://ws.coincap.io/prices?assets=bitcoin,ethereum';
// const COINCAP_WS_URL = 'wss://ws.coincap.io/prices'; // Test: Connect without specifying assets

interface WebSocketData {
  [cryptoId: string]: string; // e.g., { bitcoin: "29000.12" }
}

// Threshold for significant price change percentage
const PRICE_CHANGE_THRESHOLD = 2.0; // e.g., 2% change

const useWebSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  // Store previous prices to calculate change
  const previousPrices = useRef<{ [key: string]: number }>({});
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | Error | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const notificationCooldown = useRef<{ [key: string]: number }>({}); // Cooldown per asset

  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
    }
    if (ws.current) {
      console.log('Disconnecting WebSocket explicitly...');
      ws.current.onopen = null;
      ws.current.onmessage = null;
      ws.current.onerror = null;
      ws.current.onclose = null; // Prevent onclose handler during explicit disconnect
      ws.current.close();
      ws.current = null;
      setIsConnected(false); // Ensure state is updated
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    // Clean up previous connection or reconnect attempts
    if (ws.current) {
        disconnectWebSocket();
    }
    if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
    }

    console.log(`Attempting to connect to WebSocket: ${COINCAP_WS_URL}`);
    try {
        ws.current = new WebSocket(COINCAP_WS_URL);
        setError(null); // Clear previous errors on new attempt
    } catch (e) {
        console.error("WebSocket instantiation error:", e);
        setError(e instanceof Error ? e : new Error('WebSocket connection failed during instantiation'));
        setIsConnected(false);
        // Schedule reconnect on instantiation error
        if (!reconnectTimeoutRef.current) {
             console.log('Scheduling reconnect after instantiation error...');
             reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000); // Retry after 5s
        }
        return;
    }

    ws.current.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
      setError(null);
      previousPrices.current = {}; // Reset previous prices on connect
      notificationCooldown.current = {}; // Reset cooldowns
       // Clear any previous reconnect timeouts on successful connection
       if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    };

    ws.current.onmessage = (event) => {
      try {
        const data: WebSocketData = JSON.parse(event.data as string);
        // console.log('WebSocket message received:', data);

        // Dispatch actions to update Redux store
        Object.keys(data).forEach((cryptoId) => {
          const price = parseFloat(data[cryptoId]);
          if (!isNaN(price)) {
            // Dispatch the imported action
            dispatch(updateLivePrice({ id: cryptoId, price }));
            // console.log(`Dispatched update for ${cryptoId}: ${price}`);

            // Check for significant price change for notification
            const prevPrice = previousPrices.current[cryptoId];
            if (prevPrice) {
              const changePercent = ((price - prevPrice) / prevPrice) * 100;
              const now = Date.now();
              const cooldownPeriod = 60000 * 5; // 5 minutes cooldown per asset
              const lastNotificationTime = notificationCooldown.current[cryptoId] || 0;

              if (Math.abs(changePercent) >= PRICE_CHANGE_THRESHOLD && (now - lastNotificationTime > cooldownPeriod)) {
                  const direction = changePercent > 0 ? 'increased' : 'decreased';
                  const formattedPrice = formatCurrency(price);
                  const message = `${cryptoId.toUpperCase()} price ${direction} by ${changePercent.toFixed(2)}% to ${formattedPrice}`;
                  
                  // Dispatch notification to Redux
                  dispatch(addNotification({
                      type: 'price_alert',
                      message,
                      relatedItemId: cryptoId
                  }));
                  
                  // Show toast notification
                  toast.info(message, { toastId: `${cryptoId}-price-alert` }); // Use toastId to prevent duplicates if needed

                  // Update cooldown timestamp
                  notificationCooldown.current[cryptoId] = now;
              }
            }
            // Update previous price for next comparison
            previousPrices.current[cryptoId] = price;
          }
        });

        // You might also want to trigger notifications here based on price changes

      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
        setError(e instanceof Error ? e : new Error('Failed to parse message'));
      }
    };

    ws.current.onerror = (event) => {
      console.error('WebSocket Error Event:', event);
      // Attempt to stringify for more details, might just be {} 
      console.error('WebSocket Error (stringified): ', JSON.stringify(event)); 
      setError(event); 
      // Connection likely closed or failed, state managed by onclose
    };

    ws.current.onclose = (event: CloseEvent) => {
      console.log(
        `WebSocket Disconnected. Code: ${event.code}, Reason: "${event.reason}", Clean: ${event.wasClean}`
      );
      setIsConnected(false);
      ws.current = null; // Ensure ref is cleared

      // Schedule reconnect only if not explicitly disconnected and not already scheduled
      if (!event.wasClean && !reconnectTimeoutRef.current) {
        console.log('Scheduling reconnect...');
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000); // Retry after 5s
      }
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]); // Keep dispatch, connectWebSocket logic handles its own cleanup/re-entry

  // Simulate Weather Alerts (Example)
  useEffect(() => {
      const weatherAlertInterval = setInterval(() => {
          // Simulate randomly
          if (Math.random() < 0.1) { // 10% chance every 30 seconds
              const cities = ['New York', 'London', 'Tokyo'];
              const randomCity = cities[Math.floor(Math.random() * cities.length)];
              const message = `Simulated weather alert: Heavy rain expected in ${randomCity}.`;
              dispatch(addNotification({
                  type: 'weather_alert',
                  message,
                  relatedItemId: randomCity
              }));
              toast.warn(message, { toastId: `${randomCity}-weather-alert-${Date.now()}`});
          }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(weatherAlertInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Effect to connect on mount and disconnect on unmount
  useEffect(() => {
    connectWebSocket();
    // Cleanup function
    return () => {
      console.log("Cleaning up WebSocket connection on unmount...");
      disconnectWebSocket();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectWebSocket]); // Only run connectWebSocket once on mount

  return { isConnected, error }; // Only return state, connection managed internally
};

export default useWebSocket;
