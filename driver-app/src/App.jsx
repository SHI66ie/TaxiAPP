import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';

// Layouts & Components
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Rides from './pages/Rides';
import Bids from './pages/Bids';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';

// Initialize Socket.io connection to backend
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
export const socket = io(SOCKET_URL);

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log('Connected to backend socket (Driver App)');
    }
    function onDisconnect() {
      setIsConnected(false);
      console.log('Disconnected from backend socket (Driver App)');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="rides" element={<Rides />} />
          <Route path="bids" element={<Bids />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
