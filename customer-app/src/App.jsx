import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';

// Layouts & Components
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Activity from './pages/Activity';
import Wallet from './pages/Wallet';
import Account from './pages/Account';

// Initialize Socket.io connection to backend
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
export const socket = io(SOCKET_URL);

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      console.log('Connected to backend socket');
    }
    function onDisconnect() {
      setIsConnected(false);
      console.log('Disconnected from backend socket');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Global socket event listeners for customer app
    socket.on('emergency_sos_alert', (payload) => {
      console.log('SOS Alert received:', payload);
      alert('🚨 Emergency SOS Alert: ' + payload.message);
    });

    socket.on('new_bid_created', (bid) => {
      console.log('New bid created:', bid);
    });

    socket.on('driver_counter_offer_placed', (bid) => {
      console.log('Driver counter offer placed:', bid);
    });

    socket.on('bid_accepted', (result) => {
      console.log('Bid accepted:', result);
    });

    socket.on('surge_updated', (zone) => {
      console.log('Surge zone updated:', zone);
    });

    socket.on('location_changed', (data) => {
      console.log('Driver location changed:', data);
    });

    socket.on('payment_verified', (verified) => {
      console.log('Payment verified:', verified);
    });

    socket.on('carpool_match_found', (booking) => {
      console.log('Carpool match found:', booking);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('emergency_sos_alert');
      socket.off('new_bid_created');
      socket.off('driver_counter_offer_placed');
      socket.off('bid_accepted');
      socket.off('surge_updated');
      socket.off('location_changed');
      socket.off('payment_verified');
      socket.off('carpool_match_found');
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="activity" element={<Activity />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="account" element={<Account />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
