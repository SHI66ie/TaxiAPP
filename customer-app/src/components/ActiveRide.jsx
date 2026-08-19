import React, { useState, useEffect } from 'react';
import { Shield, Phone, MessageSquare, User, Star, AlertTriangle, CheckCircle2, Navigation, X, ShieldAlert, KeyRound, Clock, ArrowRight } from 'lucide-react';
import { socket } from '../App';
import ChatModal from './ChatModal';
import TripRatingModal from './TripRatingModal';

const ActiveRide = ({ ride, onCancel, onCompleted }) => {
  const [currentRide, setCurrentRide] = useState(ride);
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    if (ride) setCurrentRide(ride);
  }, [ride]);

  useEffect(() => {
    const handleStatusUpdate = (updatedRide) => {
      if (currentRide && (updatedRide.id === currentRide.id || updatedRide.id === currentRide.rideId)) {
        setCurrentRide(prev => ({ ...prev, ...updatedRide }));
        if (updatedRide.status === 'COMPLETED') {
          setShowRating(true);
          if (onCompleted) onCompleted(updatedRide);
        }
      }
    };

    socket.on('ride_status_updated', handleStatusUpdate);

    return () => {
      socket.off('ride_status_updated', handleStatusUpdate);
    };
  }, [currentRide, onCompleted]);

  const handleCancelRide = async () => {
    if (!currentRide?.id) {
      onCancel();
      return;
    }
    setCancelling(true);
    try {
      await fetch(`/api/rides/${currentRide.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
    } catch (err) {
      console.error('Error cancelling ride:', err);
    } finally {
      setCancelling(false);
      onCancel();
    }
  };

  const handleTriggerSos = async () => {
    try {
      await fetch('/api/sos/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rideId: currentRide?.id || 'ride_live',
          passengerName: currentRide?.passengerName || 'Amina Bello',
          coords: currentRide?.pickupCoords || { lat: 9.0765, lng: 7.3985 }
        })
      });
      setSosSent(true);
    } catch (err) {
      console.error('SOS dispatch error:', err);
    }
  };

  const driverName = currentRide?.driverName || (currentRide?.driverId === 'drv_101' ? 'Ibrahim Danladi' : 'Samuel Musa');
  const vehicle = currentRide?.vehicle || 'Toyota Corolla (Abuja ABJ-482-AA)';
  const fare = currentRide?.fare || 2500;
  const status = currentRide?.status || 'MATCHED';
  const securityPin = currentRide?.securityPin || '7392';

  const getStatusBadge = () => {
    switch (status) {
      case 'IN_PROGRESS':
        return { text: 'Trip In Progress', badgeClass: 'badge-green', label: 'Heading to destination' };
      case 'ARRIVING':
        return { text: 'Driver Arrived', badgeClass: 'badge-yellow', label: 'Driver is at pickup point' };
      case 'COMPLETED':
        return { text: 'Trip Completed', badgeClass: 'badge-green', label: 'You have arrived safely' };
      default:
        return { text: 'Driver En Route', badgeClass: 'badge-yellow', label: 'Driver is on the way (3 mins)' };
    }
  };

  const statusInfo = getStatusBadge();

  return (
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

      {/* Top Header Status & Fare */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <span className={`badge-pill ${statusInfo.badgeClass}`}>
            {statusInfo.text}
          </span>
          <h2 className="text-h2" style={{ marginTop: '6px', fontSize: '18px', color: '#FFFFFF' }}>
            {statusInfo.label}
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--aber-yellow)' }}>
            ₦{fare.toLocaleString()}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {currentRide?.paymentMethod || 'Paystack Card'}
          </span>
        </div>
      </div>

      {/* Safety PIN Verification Box */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '12px 14px', 
        background: 'rgba(255, 212, 40, 0.08)', 
        border: '1px dashed rgba(255, 212, 40, 0.4)',
        borderRadius: '14px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '8px', 
            background: 'var(--aber-yellow)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#0E131F'
          }}>
            <KeyRound size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Trip PIN</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Provide to driver on pickup</div>
          </div>
        </div>
        <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '4px', color: 'var(--aber-yellow)' }}>
          {securityPin}
        </div>
      </div>

      {/* Driver & Vehicle Details Card */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '14px', 
        padding: '14px', 
        background: 'rgba(14, 19, 31, 0.65)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '16px' 
      }}>
        <div style={{ 
          width: '52px', 
          height: '52px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--bg-surface-elevated)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '2px solid var(--aber-yellow)',
          color: 'var(--aber-yellow)',
          flexShrink: 0
        }}>
          <User size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 className="text-h3" style={{ fontSize: '15px', color: '#FFFFFF', margin: 0 }}>{driverName}</h3>
            <span className="badge-pill badge-green" style={{ fontSize: '9px', padding: '1px 5px' }}>✓ Verified</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{vehicle}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <Star size={13} color="#FFD428" fill="#FFD428" />
            <span style={{ fontWeight: '700', fontSize: '12px', color: '#FFFFFF' }}>4.9</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• 450+ trips</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a 
            href="tel:+2348031112233" 
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '50%', 
              background: 'var(--aber-yellow)', 
              color: '#0E131F', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(255, 212, 40, 0.4)'
            }}
          >
            <Phone size={18} />
          </a>
          <button
            onClick={() => setShowChat(true)}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--aber-yellow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
        {status !== 'COMPLETED' ? (
          <button 
            className="btn-secondary" 
            style={{ flex: 1, padding: '12px', fontSize: '13px' }} 
            onClick={handleCancelRide}
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Ride'}
          </button>
        ) : (
          <button 
            className="btn-primary" 
            style={{ flex: 1, padding: '12px', fontSize: '13px' }} 
            onClick={onCancel}
          >
            Book Another Ride
          </button>
        )}
        <button 
          className="btn-secondary" 
          style={{ 
            flex: 1, 
            padding: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '6px', 
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.1)',
            fontSize: '13px',
            fontWeight: '700'
          }}
          onClick={() => setShowSosModal(true)}
        >
          <ShieldAlert size={16} /> Abuja SOS
        </button>
      </div>

      {/* Emergency SOS Modal */}
      {showSosModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.88)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel-elevated" style={{ width: '100%', maxWidth: '360px', padding: '24px', textAlign: 'center', border: '1px solid #EF4444' }}>
            <div style={{ 
              width: '58px', 
              height: '58px', 
              borderRadius: '50%', 
              background: 'rgba(239, 68, 68, 0.2)', 
              color: '#EF4444', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px',
              border: '2px solid #EF4444'
            }}>
              <ShieldAlert size={32} />
            </div>

            <h2 className="text-h2" style={{ color: '#EF4444', marginBottom: '8px' }}>
              Abuja Emergency SOS
            </h2>

            {sosSent ? (
              <div>
                <p className="text-body" style={{ color: '#10B981', fontWeight: '600', marginBottom: '16px' }}>
                  ✓ Emergency GPS dispatched to Abuja Security Command Center!
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  <a href="tel:112" className="btn-primary" style={{ background: '#EF4444', color: '#FFFFFF', textDecoration: 'none', padding: '12px' }}>
                    Call FCT Police Hotline (112)
                  </a>
                  <a href="tel:08031230000" className="btn-secondary" style={{ textDecoration: 'none', padding: '12px' }}>
                    Call FCT Quick Response Squad
                  </a>
                </div>
                <button className="btn-secondary" onClick={() => setShowSosModal(false)} style={{ width: '100%' }}>
                  Close
                </button>
              </div>
            ) : (
              <div>
                <p className="text-body" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  This immediately broadcasts your live Abuja GPS coordinates and ride details to the 24/7 Dispatch Command Center and your saved emergency contacts.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-secondary" onClick={() => setShowSosModal(false)} style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleTriggerSos} style={{ flex: 1, background: '#EF4444', color: '#FFFFFF' }}>
                    Send SOS Alert
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* In-App Chat Modal */}
      {showChat && (
        <ChatModal ride={currentRide} onClose={() => setShowChat(false)} />
      )}

      {/* Trip Rating & Tip Modal */}
      {showRating && (
        <TripRatingModal 
          ride={currentRide} 
          onClose={() => { setShowRating(false); onCancel && onCancel(); }}
          onSubmit={() => { setShowRating(false); onCancel && onCancel(); }}
        />
      )}
    </div>
  );
};

export default ActiveRide;
