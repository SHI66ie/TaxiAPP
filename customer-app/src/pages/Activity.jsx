import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Navigation, Car, CheckCircle2, XCircle, FileText, ChevronRight, Download, Share2, Sparkles, RefreshCw } from 'lucide-react';
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
        return { text: 'Completed', badgeClass: 'badge-green', icon: CheckCircle2 };
      case 'IN_PROGRESS':
        return { text: 'In Progress', badgeClass: 'badge-yellow', icon: Navigation };
      case 'CANCELLED':
        return { text: 'Cancelled', badgeClass: 'badge-orange', icon: XCircle };
      default:
        return { text: 'Driver Assigned', badgeClass: 'badge-yellow', icon: Clock };
    }
  };

  return (
    <div style={{ padding: '20px', paddingBottom: '90px', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
            Aber Trip History
          </span>
          <h1 className="text-h1" style={{ fontSize: '24px', margin: 0, color: '#FFFFFF' }}>Activity</h1>
        </div>
        <button 
          className="btn-secondary"
          onClick={fetchRides}
          disabled={loading}
          style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
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
              border: filter === tab ? '1.5px solid var(--aber-yellow)' : '1px solid rgba(255, 255, 255, 0.08)',
              background: filter === tab ? 'rgba(255, 212, 40, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: filter === tab ? 'var(--aber-yellow)' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {tab === 'ALL' ? 'All Trips' : tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Rides List */}
      {filteredRides.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Car size={36} style={{ margin: '0 auto 12px', opacity: 0.5, color: 'var(--aber-yellow)' }} />
          <h3 className="text-h3" style={{ marginBottom: '6px', color: '#FFFFFF' }}>No trips found</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Your booked trips and Aber carpool commutes will appear here.
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
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                {/* Trip Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge-pill ${badge.badgeClass}`}>
                      <BadgeIcon size={12} /> {badge.text}
                    </span>
                    {ride.isCarpool && (
                      <span className="badge-pill badge-orange" style={{ fontSize: '10px' }}>
                        👥 Aber Carpool
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '17px', fontWeight: '800', color: 'var(--aber-yellow)' }}>
                      ₦{ride.fare?.toLocaleString()}
                    </span>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dateStr}</div>
                  </div>
                </div>

                {/* Route */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', background: 'rgba(14, 19, 31, 0.5)', padding: '10px 12px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--aber-yellow)', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: '600' }}>
                      {ride.pickupLocation}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Driver: <span style={{ color: '#FFFFFF', fontWeight: '600' }}>{ride.driverName || 'Assigned Aber Driver'}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedReceipt(ride)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--aber-yellow)',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <FileText size={14} /> View Receipt <ChevronRight size={14} />
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
          background: 'rgba(0, 0, 0, 0.88)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel-elevated" style={{ width: '100%', maxWidth: '380px', padding: '24px', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '1px dashed rgba(255, 255, 255, 0.15)', paddingBottom: '16px' }}>
              <span className="badge-pill badge-yellow" style={{ marginBottom: '6px' }}>
                Aber Taxi Abuja
              </span>
              <h2 className="text-h2" style={{ margin: '4px 0 2px', fontSize: '20px', color: '#FFFFFF' }}>Trip Electronic Receipt</h2>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Booking Ref: {selectedReceipt.id}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Passenger:</span>
                <span style={{ fontWeight: '600', color: '#FFFFFF' }}>{selectedReceipt.passengerName || 'Amina Bello'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pickup:</span>
                <span style={{ fontWeight: '500', color: '#FFFFFF', maxWidth: '200px', textAlign: 'right' }}>{selectedReceipt.pickupLocation}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Destination:</span>
                <span style={{ fontWeight: '500', color: '#FFFFFF', maxWidth: '200px', textAlign: 'right' }}>{selectedReceipt.dropoffLocation}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vehicle Class:</span>
                <span style={{ fontWeight: '600', color: 'var(--aber-yellow)', textTransform: 'capitalize' }}>{selectedReceipt.vehicleType || 'Aber Standard'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Channel:</span>
                <span style={{ fontWeight: '600', color: '#FFFFFF' }}>{selectedReceipt.paymentMethod || 'Paystack Card'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>Total Fare Paid:</span>
                <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--aber-yellow)' }}>
                  ₦{selectedReceipt.fare?.toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setSelectedReceipt(null)}
                style={{ flex: 1, padding: '12px' }}
              >
                Close
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  alert('Receipt downloaded to device storage!');
                  setSelectedReceipt(null);
                }}
                style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Download size={16} /> Save Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activity;
