import React, { useState } from 'react';
import { ChevronDown, ChevronUp, User, LogIn, Shield, MapPin } from 'lucide-react';
import LiveMap from '../components/LiveMap';
import BookingPanel from '../components/BookingPanel';
import FleetSelector from '../components/FleetSelector';
import BiddingInterface from '../components/BiddingInterface';
import ActiveRide from '../components/ActiveRide';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [bookingState, setBookingState] = useState('idle'); // idle, selecting_fleet, bidding, tracking
  const [tripSearch, setTripSearch] = useState(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false); // Toggle up and down
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
    setIsPanelExpanded(false); // Collapse to keep map clearly visible
  };

  const handleDirectBook = async () => {
    if (!tripSearch) return;
    setBookingLoading(true);
    try {
      const payload = {
        passengerName: user?.name || 'Amina Bello',
        passengerPhone: user?.phone || '+234 812 000 1111',
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
      {/* Top Floating App Bar */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        right: '16px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none'
      }}>
        {/* Brand Pill */}
        <div style={{
          pointerEvents: 'auto',
          background: 'rgba(14, 19, 31, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 8px #10B981'
          }} />
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '0.4px' }}>
            Taxi<span style={{ color: '#FFD428' }}>APP</span>
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Abuja</span>
        </div>

        {/* User Auth Button */}
        <button
          onClick={() => setShowAuth(true)}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(14, 19, 31, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 212, 40, 0.4)',
            borderRadius: '24px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: '700',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
          }}
        >
          {user ? (
            <>
              <User size={14} color="#FFD428" />
              <span>{user.name.split(' ')[0]} ({user.role === 'driver' ? 'Driver' : 'Rider'})</span>
            </>
          ) : (
            <>
              <LogIn size={14} color="#FFD428" />
              <span>Sign In / Register</span>
            </>
          )}
        </button>
      </div>

      {/* Background Interactive Map */}
      <LiveMap 
        pickupCoords={tripSearch?.pickup?.coords}
        dropoffCoords={tripSearch?.destination?.coords}
        isBooking={bookingState !== 'idle'} 
      />
      
      {/* 1. Idle State: Where to? Search Box */}
      {bookingState === 'idle' && (
        <BookingPanel 
          onSearch={handleSearch} 
          isExpanded={isPanelExpanded}
          onToggleExpand={() => setIsPanelExpanded(prev => !prev)}
        />
      )}

      {/* 2. Selecting Fleet: Sliding Drawer */}
      {bookingState === 'selecting_fleet' && (
        <div 
          className="bottom-sheet animate-slide-up"
          style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            padding: '14px 18px 84px',
            zIndex: 40,
            background: 'linear-gradient(180deg, #171E2E 0%, #0E131F 100%)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.7)',
            maxHeight: isPanelExpanded ? '75vh' : '48vh',
            transition: 'max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Drawer Handle with Toggle Action */}
          <div 
            onClick={() => setIsPanelExpanded(prev => !prev)}
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              padding: '2px 0 8px' 
            }}
          >
            <div className="drawer-handle" style={{ margin: 0 }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.6px' }}>
                Select Ride Class
              </span>
              <h2 className="text-h2" style={{ margin: 0, fontSize: '17px', color: '#FFFFFF' }}>Available Taxis</h2>
            </div>
            <button
              onClick={() => setIsPanelExpanded(prev => !prev)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '3px 9px',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              {isPanelExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              {isPanelExpanded ? 'Minimize' : 'More Options'}
            </button>
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

          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <button 
              className="btn-secondary" 
              onClick={() => setBookingState('idle')}
              style={{ flex: 0.9, padding: '12px', fontSize: '13px' }}
            >
              Back
            </button>
            <button 
              className="btn-accent-orange" 
              onClick={() => setBookingState('bidding')}
              style={{ flex: 1.1, padding: '12px', fontSize: '13px' }}
            >
              Negotiate
            </button>
            <button 
              className="btn-primary" 
              onClick={handleDirectBook}
              disabled={bookingLoading}
              style={{ flex: 1.8, padding: '12px', fontSize: '14px' }}
            >
              {bookingLoading ? 'Dispatching...' : `Book ${selectedFleet.name}`}
            </button>
          </div>
        </div>
      )}

      {/* 3. Bidding Interface Drawer */}
      {bookingState === 'bidding' && (
        <div 
          className="bottom-sheet animate-slide-up"
          style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            padding: '16px 20px 84px',
            zIndex: 40,
            background: 'linear-gradient(180deg, #171E2E 0%, #0E131F 100%)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.7)',
            maxHeight: '68vh',
            overflowY: 'auto'
          }}
        >
          <div className="drawer-handle" style={{ marginTop: '2px', marginBottom: '12px' }} />
          <BiddingInterface 
            basePrice={selectedFleet.numericPrice || 2500} 
            pickup={tripSearch?.pickup}
            destination={tripSearch?.destination}
            onAccepted={handleBidAccepted}
            onCancel={() => setBookingState('selecting_fleet')} 
          />
        </div>
      )}

      {/* 4. Active Ride Tracking Drawer */}
      {bookingState === 'tracking' && (
        <ActiveRide 
          ride={activeRide}
          onCancel={handleReset}
          onCompleted={handleReset}
        />
      )}

      {/* Auth Modal (Sign Up & Log In) */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};

export default Home;
