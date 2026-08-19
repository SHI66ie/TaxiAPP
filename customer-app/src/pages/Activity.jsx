import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Navigation, Car, CheckCircle, XCircle, FileText, ChevronRight, Download, Share2, Sparkles, RefreshCw } from 'lucide-react';
import { socket } from '../App';

const Activity = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, COMPLETED, IN_PROGRESS, CANCELLED
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rides');
      const json = await res.json();
      if (json.success) {
        setRides(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching ride activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();

    socket.on('new_ride_dispatched', () => fetchRides());
    socket.on('ride_status_updated', () => fetchRides());

    return () => {
      socket.off('new_ride_dispatched');
      socket.off('ride_status_updated');
    };
  }, []);

  const filteredRides = rides.filter(ride => {
    if (filter === 'ALL') return true;
    return ride.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { text: 'Completed', color: 'var(--accent-primary)', bg: 'rgba(16, 185, 129, 0.15)', icon: CheckCircle };
      case 'IN_PROGRESS':
        return { text: 'In Progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: Navigation };
      case 'CANCELLED':
        return { text: 'Cancelled', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.15)', icon: XCircle };
      default:
        return { text: 'Assigned', color: 'var(--accent-gold)', bg: 'rgba(245, 158, 11, 0.15)', icon: Clock };
    }
  };

  return (
    <div style={{ padding: '20px', paddingBottom: 'calc(var(--nav-height) + 24px)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Abuja Trip Ledger</span>
          <h1 className="text-h1" style={{ fontSize: '24px', margin: 0 }}>Your Activity</h1>
        </div>
        <button 
          className="btn-secondary"
          onClick={fetchRides}
          disabled={loading}
          style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
        {['ALL', 'COMPLETED', 'IN_PROGRESS', 'CANCELLED'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: filter === tab ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
              background: filter === tab ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
              color: filter === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab === 'ALL' ? 'All Trips' : tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Rides List */}
      {filteredRides.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Car size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3 className="text-h3" style={{ marginBottom: '6px' }}>No rides found</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Your booked trips and Abuja carpool commutes will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredRides.map(ride => {
            const badge = getStatusBadge(ride.status);
            const BadgeIcon = badge.icon;
            const dateStr = ride.createdAt ? new Date(ride.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Today';

            return (
              <div 
                key={ride.id}
                className="glass-panel"
                style={{ 
                  padding: '16px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                {/* Trip Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: badge.bg,
                      color: badge.color,
                      fontSize: '11px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      textTransform: 'uppercase'
                    }}>
                      <BadgeIcon size={12} /> {badge.text}
                    </div>
                    {ride.isCarpool && (
                      <span style={{ 
                        fontSize: '10px', 
                        padding: '3px 8px', 
                        borderRadius: '6px', 
                        background: 'rgba(245, 158, 11, 0.15)', 
                        color: 'var(--accent-gold)', 
                        fontWeight: '700' 
                      }}>
                        👥 Carpool (Shared)
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
                      ₦{ride.fare?.toLocaleString()}
                    </span>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{dateStr}</div>
                  </div>
                </div>

                {/* Route */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500' }}>
                      {ride.pickupLocation}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--danger)', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {ride.dropoffLocation}
                    </span>
                  </div>
                </div>

                {/* Bottom Driver / Action */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Driver: <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{ride.driverName || 'Assigned Driver'}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedReceipt(ride)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FileText size={14} /> Receipt <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* E-Receipt Modal */}
      {selectedReceipt && (
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '380px', padding: '24px', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Abuja Express Taxi
              </div>
              <h2 className="text-h2" style={{ margin: '4px 0 2px', fontSize: '20px' }}>Trip Electronic Receipt</h2>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {selectedReceipt.id}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Passenger:</span>
                <span style={{ fontWeight: '600' }}>{selectedReceipt.passengerName || 'Amina Bello'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pickup:</span>
                <span style={{ fontWeight: '500', maxWidth: '200px', textAlign: 'right' }}>{selectedReceipt.pickupLocation}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dropoff:</span>
                <span style={{ fontWeight: '500', maxWidth: '200px', textAlign: 'right' }}>{selectedReceipt.dropoffLocation}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vehicle Type:</span>
                <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{selectedReceipt.vehicleType || 'Standard Sedan'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Gateway:</span>
                <span style={{ fontWeight: '600' }}>{selectedReceipt.paymentMethod || 'Paystack / Card'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '15px', fontWeight: '700' }}>Total Paid:</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                  ₦{selectedReceipt.fare?.toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setSelectedReceipt(null)}
                style={{ flex: 1 }}
              >
                Close
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  alert('Receipt downloaded to device storage!');
                  setSelectedReceipt(null);
                }}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Download size={14} /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activity;
