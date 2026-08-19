import React, { useState, useEffect } from 'react';
import { Shield, Phone, MessageSquare, User, Star, AlertTriangle, CheckCircle, Navigation, X, ShieldAlert, KeyRound } from 'lucide-react';
import { socket } from '../App';

const ActiveRide = ({ ride, onCancel, onCompleted }) => {
  const [currentRide, setCurrentRide] = useState(ride);
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (ride) setCurrentRide(ride);
  }, [ride]);

  useEffect(() => {
    const handleStatusUpdate = (updatedRide) => {
      if (currentRide && (updatedRide.id === currentRide.id || updatedRide.id === currentRide.rideId)) {
        setCurrentRide(prev => ({ ...prev, ...updatedRide }));
        if (updatedRide.status === 'COMPLETED' && onCompleted) {
          onCompleted(updatedRide);
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
        return { text: 'Trip In Progress', color: 'var(--accent-primary)', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'ARRIVING':
        return { text: 'Driver Arriving', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'COMPLETED':
        return { text: 'Trip Completed', color: 'var(--accent-primary)', bg: 'rgba(16, 185, 129, 0.2)' };
      default:
        return { text: 'Driver En Route', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
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
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <span style={{ 
            fontSize: '11px', 
            padding: '3px 8px', 
            borderRadius: '8px', 
            background: statusBadge.bg, 
            color: statusBadge.color,
            fontWeight: '700',
            textTransform: 'uppercase'
          }}>
            {statusBadge.text}
          </span>
          <h2 className="text-h2" style={{ marginTop: '6px', fontSize: '18px' }}>
            {status === 'IN_PROGRESS' ? 'Heading to destination' : 'Driver is on the way'}
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-primary)' }}>
            ₦{fare.toLocaleString()}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {currentRide?.paymentMethod || 'Paystack / Cash'}
          </span>
        </div>
      </div>

      {/* Safety PIN Verification Box */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '10px 14px', 
        background: 'rgba(245, 158, 11, 0.08)', 
        border: '1px dashed rgba(245, 158, 11, 0.4)',
        borderRadius: '10px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <KeyRound size={18} color="var(--accent-gold)" />
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trip Verification PIN</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Verify driver before entering</div>
          </div>
        </div>
        <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '3px', color: 'var(--accent-gold)' }}>
          {securityPin}
        </div>
      </div>

      {/* Driver & Vehicle Details */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '14px', 
        padding: '14px 0', 
        borderTop: '1px solid rgba(255,255,255,0.08)', 
        borderBottom: '1px solid rgba(255,255,255,0.08)', 
        marginBottom: '16px' 
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--bg-surface-elevated)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '2px solid var(--accent-primary)'
        }}>
          <User size={26} color="var(--accent-primary)" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 className="text-h3" style={{ fontSize: '15px' }}>{driverName}</h3>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>{vehicle}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={13} color="#f59e0b" fill="#f59e0b" />
            <span className="text-sm" style={{ fontWeight: '700', fontSize: '12px' }}>4.9</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>• 400+ trips</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a 
            href="tel:+2348031112233" 
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: '#10b981', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              textDecoration: 'none'
            }}
          >
            <Phone size={18} />
          </a>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
        {status !== 'COMPLETED' ? (
          <button 
            className="btn-secondary" 
            style={{ flex: 1, padding: '10px', fontSize: '13px' }} 
            onClick={handleCancelRide}
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Ride'}
          </button>
        ) : (
          <button 
            className="btn-primary" 
            style={{ flex: 1, padding: '10px', fontSize: '13px' }} 
            onClick={onCancel}
          >
            Book Another Ride
          </button>
        )}
        <button 
          className="btn-secondary" 
          style={{ 
            flex: 1, 
            padding: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '6px', 
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.08)',
            fontSize: '13px'
          }}
          onClick={() => setShowSosModal(true)}
        >
          <ShieldAlert size={16} /> Safety / SOS
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
          background: 'rgba(0,0,0,0.85)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '360px', padding: '24px', textAlign: 'center', border: '1px solid #ef4444' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              background: 'rgba(239, 68, 68, 0.2)', 
              color: '#ef4444', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <ShieldAlert size={32} />
            </div>

            <h2 className="text-h2" style={{ color: '#ef4444', marginBottom: '8px' }}>
              Abuja Emergency SOS
            </h2>

            {sosSent ? (
              <div>
                <p className="text-body" style={{ color: '#10b981', fontWeight: '600', marginBottom: '16px' }}>
                  ✓ Emergency GPS dispatched to Abuja Security Control Center!
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  <a href="tel:112" className="btn-primary" style={{ background: '#ef4444', textDecoration: 'none', padding: '10px' }}>
                    Call FCT Police Hotline (112)
                  </a>
                  <a href="tel:08031230000" className="btn-secondary" style={{ textDecoration: 'none', padding: '10px' }}>
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
                  This will broadcast your live coordinates and ride details directly to our Abuja 24/7 Dispatch Center and emergency contacts.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-secondary" onClick={() => setShowSosModal(false)} style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleTriggerSos} style={{ flex: 1, background: '#ef4444' }}>
                    Send SOS Alert
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveRide;
