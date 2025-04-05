'use client';

import { useEffect } from 'react';
import useWebSocket from '@/hooks/useWebSocket';

export default function WebSocketInitializer() {
  const { isConnected, error } = useWebSocket();

  useEffect(() => {
    if (isConnected) {
      console.log("WebSocket connection established via Initializer.");
    } else {
        console.log("WebSocket Initializer: Not connected yet...");
    }
    if (error) {
      console.error("WebSocket error from Initializer:", error);
    }
  }, [isConnected, error]);

  // This component doesn't render anything itself
  return null;
} 