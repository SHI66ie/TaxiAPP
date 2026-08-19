import React, { useState } from 'react';
import LiveMap from '../components/LiveMap';
import BookingPanel from '../components/BookingPanel';
import FleetSelector from '../components/FleetSelector';
import BiddingInterface from '../components/BiddingInterface';
import ActiveRide from '../components/ActiveRide';

const Home = () => {
  const [bookingState, setBookingState] = useState('idle'); // idle, selecting_fleet, bidding, tracking
  const [tripSearch, setTripSearch] = useState(null);
  const [selectedFleet, setSelectedFleet] = useState({
    id: 'standard',
    name: 'Standard Taxi',
    numericPrice: 2500,
    price: '₦2,500'
  });
  const [activeRide, setActiveRide] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleSearch = (searchData) => {
    setTripSearch(searchData);
    setBookingState('selecting_fleet');
  };

  const handleDirectBook = async () => {
    if (!tripSearch) return;
    setBookingLoading(true);
    try {
      const payload = {
        passengerName: 'Amina Bello',
        passengerPhone: '+234 812 000 1111',
        pickupLocation: tripSearch.pickup.name,
        dropoffLocation: tripSearch.destination.name,
        pickupCoords: tripSearch.pickup.coords,
        dropoffCoords: tripSearch.destination.coords,
        vehicleType: selectedFleet.id,
        isCarpool: selectedFleet.id === 'carpool',
        fare: selectedFleet.numericPrice || 2500,
        originalFare: selectedFleet.id === 'carpool' ? Math.round((selectedFleet.numericPrice || 2500) / 0.6) : selectedFleet.numericPrice,
        paymentMethod: 'Paystack'
      };

      const res = await fetch('/api/rides/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        const booked = json.data.ride || (json.data.rides ? json.data.rides[0] : json.data);
        setActiveRide(booked);
        setBookingState('tracking');
      }
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBidAccepted = (rideData) => {
    setActiveRide(rideData);
    setBookingState('tracking');
  };

  const handleReset = () => {
    setBookingState('idle');
    setActiveRide(null);
    setTripSearch(null);
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <LiveMap 
        pickupCoords={tripSearch?.pickup?.coords}
        dropoffCoords={tripSearch?.destination?.coords}
        isBooking={bookingState !== 'idle'} 
      />
      
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
            padding: '20px',
            zIndex: 10,
            maxHeight: '75vh',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 className="text-h2" style={{ margin: 0, fontSize: '18px' }}>Select Ride Type</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {tripSearch?.destination?.name?.substring(0, 20)}...
            </span>
          </div>

          <FleetSelector 
            pickup={tripSearch?.pickup}
            destination={tripSearch?.destination}
            initialSelected={selectedFleet.id}
            onSelect={(cat) => setSelectedFleet(cat)} 
          />

          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button 
              className="btn-secondary" 
              onClick={() => setBookingState('idle')}
              style={{ flex: 1, padding: '12px' }}
            >
              Back
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => setBookingState('bidding')}
              style={{ flex: 1.2, padding: '12px', borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}
            >
              Negotiate Fare
            </button>
            <button 
              className="btn-primary" 
              onClick={handleDirectBook}
              disabled={bookingLoading}
              style={{ flex: 1.5, padding: '12px' }}
            >
              {bookingLoading ? 'Dispatching...' : `Book ${selectedFleet.name.split(' ')[0]}`}
            </button>
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
            padding: '20px',
            zIndex: 10,
            maxHeight: '75vh',
            overflowY: 'auto'
          }}
        >
          <h2 className="text-h2" style={{ marginBottom: '14px', fontSize: '18px' }}>P2P Fare Bidding</h2>
          <BiddingInterface 
            basePrice={selectedFleet.numericPrice || 2500} 
            pickup={tripSearch?.pickup}
            destination={tripSearch?.destination}
            onAccepted={handleBidAccepted}
            onCancel={() => setBookingState('selecting_fleet')} 
          />
        </div>
      )}

      {bookingState === 'tracking' && (
        <ActiveRide 
          ride={activeRide}
          onCancel={handleReset}
          onCompleted={handleReset}
        />
      )}
    </div>
  );
};

export default Home;
