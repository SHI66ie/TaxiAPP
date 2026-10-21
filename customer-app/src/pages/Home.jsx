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
    price: '₦2,500',
    paymentMethod: 'Paystack'
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
        paymentMethod: selectedFleet.paymentMethod || 'Paystack'
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
          className="bottom-sheet animate-slide-up"
          style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            padding: '16px 20px 88px',
            zIndex: 40,
            background: 'linear-gradient(180deg, #171E2E 0%, #0E131F 100%)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.7)',
            maxHeight: '62vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="drawer-handle" style={{ marginTop: '2px', marginBottom: '12px' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.6px' }}>
                Available Taxis
              </span>
              <h2 className="text-h2" style={{ margin: '2px 0 0', fontSize: '18px', color: '#FFFFFF' }}>Choose a Ride</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge-pill badge-yellow" style={{ fontSize: '11px' }}>
                📍 {tripSearch?.destination?.name ? (tripSearch.destination.name.length > 18 ? tripSearch.destination.name.substring(0, 18) + '...' : tripSearch.destination.name) : 'Abuja'}
              </span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '2px' }}>
            <FleetSelector 
              pickup={tripSearch?.pickup}
              destination={tripSearch?.destination}
              initialSelected={selectedFleet.id}
              selectedPayment={selectedFleet.paymentMethod || 'Paystack'}
              onSelect={(cat) => setSelectedFleet(prev => ({ ...prev, ...cat }))} 
              onPaymentChange={(pm) => setSelectedFleet(prev => ({ ...prev, paymentMethod: pm }))}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <button 
              className="btn-secondary" 
              onClick={() => setBookingState('idle')}
              style={{ flex: 0.9, padding: '13px', fontSize: '13px' }}
            >
              Back
            </button>
            <button 
              className="btn-accent-orange" 
              onClick={() => setBookingState('bidding')}
              style={{ flex: 1.2, padding: '13px', fontSize: '13px' }}
            >
              Negotiate Fare
            </button>
            <button 
              className="btn-primary" 
              onClick={handleDirectBook}
              disabled={bookingLoading}
              style={{ flex: 1.8, padding: '13px', fontSize: '14px' }}
            >
              {bookingLoading ? 'Dispatching...' : `Book ${selectedFleet.name}`}
            </button>
          </div>
        </div>
      )}

      {bookingState === 'bidding' && (
        <div 
          className="glass-panel animate-slide-up"
          style={{ 
            position: 'absolute', 
            bottom: '86px', 
            left: '16px', 
            right: '16px', 
            padding: '20px',
            zIndex: 10,
            maxHeight: '78vh',
            overflowY: 'auto'
          }}
        >
          <div className="drawer-handle" />
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

