import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// 1. SINGLETON PATTERN: Initialize the socket connection outside the hook.
// This ensures that no matter how many components call useSocket(), 
// only ONE connection is made to the Python server.
const SOCKET_URL = 'http://localhost:5000';
const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
});

export const useSocket = () => {
  // State to hold the ordered Max-Heap array from Python
  const [queue, setQueue] = useState([]);
  
  // State to track if the WebSocket is actually connected (useful for UI warnings)
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // --- Event Handlers ---
    
    const onConnect = () => {
      console.log('Connected to Triage Backend');
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.warn('Disconnected from Triage Backend');
      setIsConnected(false);
    };

    const onUpdateQueue = (data) => {
      // data expects: { queue: [...], total_waiting: X }
      // We extract the queue array and update our React state
      if (data && data.queue) {
        setQueue(data.queue);
      }
    };

    // --- Attach Listeners ---
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('update_queue', onUpdateQueue);

    // --- Cleanup Function ---
    // If the component using this hook unmounts, remove the listeners
    // so we don't cause memory leaks or try to update unmounted state.
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('update_queue', onUpdateQueue);
    };
  }, []);

  // --- Actions ---
  // We expose a helper function so components can easily send the "treat_next" event
  // without needing to import socket.io directly.
  const emitTreatNext = () => {
    socket.emit('treat_next');
  };

  const emitNewPatient = (patientData) => {
    socket.emit('new_patient', patientData);
  }

  // Return the data and the action functions to the components
  return { 
    queue, 
    isConnected, 
    emitTreatNext,
    emitNewPatient 
  };
};