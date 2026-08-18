import React, { useState, useEffect } from 'react';
import { Compass, CheckCircle, Navigation, ShieldAlert, Phone, AlertCircle, Clock } from 'lucide-react';
import { socket } from '../App';

export default function Rides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const driverId = 'drv_101';

  const fetchRides = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rides');
      const json = await res.json();
      if (json.success) {
        // Filter rides for this driver
        const driverRides = json.data.filter(r => r.driverId === driverId);
        setRides(driverRides);
      }
    } catch (err) {
      console.error(err);
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

  const handleUpdateStatus = async (rideId, nextStatus) => {
    try {
      const res = await fetch(`/api/rides/${rideId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const json = await res.json();
      if (json.success) {
        fetchRides();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerSos = async (ride) => {
    try {
      await fetch('/api/sos/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rideId: ride.id,
          passengerName: ride.passengerName,
          coords: ride.pickupCoords
        })
      });
      alert('🚨 SOS Alert Dispatched to Command Center!');
    } catch (err) {
      console.error(err);
    }
  };

  const activeRides = rides.filter(r => r.status === 'MATCHED' || r.status === 'IN_PROGRESS');
  const pastRides = rides.filter(r => r.status === 'COMPLETED' || r.status === 'CANCELLED');

  return (
    <div className="animate-in" style={{ padding: '20px' }}>
      <div className="page-header" style={{ padding: 0, marginBottom: '24px' }}>
        <div>
          <span className="text-sm">Abuja corridors</span>
          <h1 className="text-h1">My Dispatched Rides</h1>
        </div>
        <button 
          onClick={fetchRides} 
          className="btn btn-secondary btn-sm" 
          disabled={loading}
          style={{ padding: '8px' }}
        >
          Refresh
        </button>
      </div>

      {/* Active Jobs Section */}
      <h2 className="text-h2" style={{ marginBottom: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Compass size={18} className={activeRides.length > 0 ? "spin" : ""} style={{ color: 'var(--accent-primary)' }} />
        Active Dispatches ({activeRides.length})
      </h2>

      {activeRides.length === 0 ? (
        <div className="glass" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>
          <AlertCircle size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.6 }} />
          No active dispatches. Go Online on the Home screen to receive trips.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {activeRides.map(ride => (
            <div key={ride.id} className="glass" style={{ padding: '20px', borderLeft: '4px solid var(--accent-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 className="text-h3" style={{ fontSize: '15px' }}>{ride.passengerName}</h3>
                  <a href={`tel:${ride.passengerPhone}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent-primary)', textDecoration: 'none', marginTop: '2px' }}>
                    <Phone size={12} /> {ride.passengerPhone}
                  </a>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>₦{ride.fare.toLocaleString()}</div>
                  <span className={`badge ${ride.status === 'IN_PROGRESS' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '9px', padding: '2px 6px', marginTop: '4px' }}>
                    {ride.status === 'IN_PROGRESS' ? 'On Trip' : 'Assigned'}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Pickup:</span> <span style={{ color: 'var(--text-secondary)' }}>{ride.pickupLocation}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Dropoff:</span> <span style={{ color: 'var(--text-secondary)' }}>{ride.dropoffLocation}</span>
                </div>
                {ride.isCarpool && (
                  <div className="badge badge-info" style={{ width: 'fit-content', marginTop: '4px' }}>
                    👥 Shared Commute (Carpool Partner: {ride.carpoolPartner || 'Matching'})
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {ride.status === 'MATCHED' && (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleUpdateStatus(ride.id, 'IN_PROGRESS')}
                    style={{ flex: 1 }}
                  >
                    <Navigation size={16} /> Start Ride
                  </button>
                )}
                {ride.status === 'IN_PROGRESS' && (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleUpdateStatus(ride.id, 'COMPLETED')}
                    style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    <CheckCircle size={16} /> Complete Ride
                  </button>
                )}
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleTriggerSos(ride)}
                  style={{ padding: '13px' }}
                  title="Trigger Emergency SOS"
                >
                  <ShieldAlert size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ride History Section */}
      <h2 className="text-h2" style={{ marginBottom: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Clock size={18} style={{ color: 'var(--text-muted)' }} />
        Completed Trips ({pastRides.length})
      </h2>

      {pastRides.length === 0 ? (
        <div className="glass" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          No completed rides recorded.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pastRides.map(ride => (
            <div key={ride.id} className="glass" style={{ padding: '14px 16px', background: 'rgba(17, 24, 39, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="text-sm" style={{ fontWeight: 600 }}>{ride.passengerName}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: ride.status === 'COMPLETED' ? 'var(--accent-primary)' : 'var(--danger)' }}>
                  {ride.status === 'COMPLETED' ? `+₦${ride.fare.toLocaleString()}` : 'Cancelled'}
                </span>
              </div>
              <div className="text-sm" style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ride.pickupLocation} ➔ {ride.dropoffLocation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
