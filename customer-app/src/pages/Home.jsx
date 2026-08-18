import React, { useState } from 'react';
import LiveMap from '../components/LiveMap';
import BookingPanel from '../components/BookingPanel';
import FleetSelector from '../components/FleetSelector';
import BiddingInterface from '../components/BiddingInterface';
import ActiveRide from '../components/ActiveRide';

const Home = () => {
  const [bookingState, setBookingState] = useState('idle'); // idle, selecting_fleet, bidding, tracking

  const handleSearch = (destination) => {
    console.log('Searching for ride to:', destination);
    setBookingState('selecting_fleet');
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <LiveMap isBooking={bookingState !== 'idle'} />
      
      {bookingState === 'idle' && (
        <BookingPanel onSearch={handleSearch} />
      )}

      {bookingState === 'selecting_fleet' && (
        <div 
          className="glass-panel animate-slide-up"
          style={{ 
            position: 'absolute', 
            bottom: 'calc(var(--nav-height) + 16px)', 
            left: '16px', 
            right: '16px', 
            padding: '24px',
            zIndex: 10
          }}
        >
          <h2 className="text-h2" style={{ marginBottom: '16px' }}>Select Ride</h2>
          <FleetSelector onSelect={(cat) => console.log('Selected:', cat.name)} />
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button className="btn-secondary" onClick={() => setBookingState('idle')}>Cancel</button>
            <button className="btn-primary" onClick={() => setBookingState('bidding')}>Continue to Bid</button>
          </div>
        </div>
      )}

      {bookingState === 'bidding' && (
        <div 
          className="glass-panel animate-slide-up"
          style={{ 
            position: 'absolute', 
            bottom: 'calc(var(--nav-height) + 16px)', 
            left: '16px', 
            right: '16px', 
            padding: '24px',
            zIndex: 10
          }}
        >
          <h2 className="text-h2" style={{ marginBottom: '16px' }}>Negotiate Fare</h2>
          <BiddingInterface 
            basePrice={2500} 
            onPropose={(offer) => {
              console.log('Proposed:', offer);
              // Simulate backend accepting the bid after 2 seconds
              setTimeout(() => setBookingState('tracking'), 2000);
            }} 
            onCancel={() => setBookingState('selecting_fleet')} 
          />
        </div>
      )}

      {bookingState === 'tracking' && (
        <ActiveRide eta="4 min" onCancel={() => setBookingState('idle')} />
      )}
    </div>
  );
};

export default Home;
