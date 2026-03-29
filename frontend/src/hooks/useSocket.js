import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Connect to the Flask backend
// When running in Codespaces/Docker, localhost:5000 is the exposed backend port
const SOCKET_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Initialize socket outside the component so it doesn't recreate on every render
const socket = io(SOCKET_URL, {
  autoConnect: false, // We control the connection lifecycle in the hook
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [queue, setQueue] = useState([]);
  const [totalWaiting, setTotalWaiting] = useState(0);

  useEffect(() => {
    // 1. Connect the socket when the app loads
    socket.connect();

    // 2. Define Event Handlers
    const onConnect = () => {
      console.log('🟢 WebSocket Connected');
      setIsConnected(true);
    };

    const onDisconnect = (reason) => {
      console.warn(`🔴 WebSocket Disconnected: ${reason}`);
      setIsConnected(false);
      // Optional: If the server restarts, you might want to clear the queue UI 
      // immediately so users know the state was wiped.
      if (reason === "transport close" || reason === "ping timeout") {
        setQueue([]); 
        setTotalWaiting(0);
      }
    };

    // Hydrates the UI with the backend Max-Heap state
    const onUpdateQueue = (data) => {
      if (data && data.queue) {
        setQueue(data.queue);
        setTotalWaiting(data.total_waiting || 0);
      }
    };

    const onError = (err) => {
      console.error('❌ Socket Error:', err);
    };

    // 3. Attach Listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('update_queue', onUpdateQueue);
    socket.on('connect_error', onError);

    // 4. Cleanup on Unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('update_queue', onUpdateQueue);
      socket.off('connect_error', onError);
      socket.disconnect();
    };
  }, []);

  // Expose the state and the socket instance to the rest of the app
  return { socket, isConnected, queue, totalWaiting };
};

export default useSocket;