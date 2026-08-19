import React, { useState, useEffect } from 'react';
import { Play, Square, Star, MapPin, Zap, RefreshCw, Bell, Navigation, CheckCircle2, X } from 'lucide-react';
import { socket } from '../App';
import LiveMap from '../components/LiveMap';

export default function Home() {
  const [driver, setDriver] = useState(null);
  const [status, setStatus] = useState('OFFLINE'); // OFFLINE, AVAILABLE, BUSY
  const [loading, setLoading] = useState(false);
  const [surgeZone, setSurgeZone] = useState({ name: 'Central Business District', multiplier: 1.0 });
  const [surgeZones, setSurgeZones] = useState([]);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [countdown, setCountdown] = useState(15);

  const driverId = 'drv_101'; // Default simulated driver

  const fetchDriverData = async () => {
    try {
      const res = await fetch('/api/drivers');
      const json = await res.json();
      if (json.success) {
        const currentDriver = json.data.find(d => d.id === driverId);
        if (currentDriver) {
          setDriver(currentDriver);
          setStatus(currentDriver.status);
        }
      }
    } catch (err) {
      console.error('Error fetching driver details:', err);
    }
  };

  const fetchSurgeData = async () => {
    try {
      const res = await fetch('/api/surge/zones');
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setSurgeZones(json.data);
        const sorted = [...json.data].sort((a, b) => b.multiplier - a.multiplier);
        setSurgeZone(sorted[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDriverData();
    fetchSurgeData();

    socket.on('location_changed', (updatedDriver) => {
      if (updatedDriver.id === driverId) {
        setDriver(prev => ({ ...prev, ...updatedDriver }));
      }
    });

    socket.on('surge_updated', () => {
      fetchSurgeData();
    });

    // Listen for incoming ride offers dispatched by customers
    socket.on('new_ride_dispatched', (ride) => {
      if (status === 'AVAILABLE') {
        setIncomingOffer(ride);
        setCountdown(15);
      }
    });

    return () => {
      socket.off('location_changed');
      socket.off('surge_updated');
      socket.off('new_ride_dispatched');
    };
  }, [status]);

  // Countdown timer for incoming ride offer
  useEffect(() => {
    if (!incomingOffer) return;
    if (countdown <= 0) {
      setIncomingOffer(null);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingOffer, countdown]);

  // Location Simulation Ping
  useEffect(() => {
    if (status !== 'AVAILABLE') return;

    const interval = setInterval(async () => {
      if (!driver) return;
      // Gently drift location
      const newLat = driver.location.lat + (Math.random() - 0.5) * 0.003;
      const newLng = driver.location.lng + (Math.random() - 0.5) * 0.003;

      try {
        await fetch('/api/location/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            driverId,
            coords: { lat: newLat, lng: newLng, speed: 45, heading: Math.floor(Math.random() * 360) }
          })
        });
      } catch (err) {
        console.error('Telemetry stream error:', err);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [status, driver]);

  const handleToggleStatus = async () => {
    setLoading(true);
    const nextStatus = status === 'OFFLINE' ? 'AVAILABLE' : 'OFFLINE';
    try {
      setStatus(nextStatus);
      if (driver) {
        await fetch('/api/location/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            driverId,
            coords: { 
              lat: driver.location.lat, 
              lng: driver.location.lng, 
              speed: 0, 
              heading: 0,
              status: nextStatus
            }
          })
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      fetchDriverData();
    }
  };

  const handleAcceptIncomingOffer = async () => {
    if (!incomingOffer) return;
    try {
      await fetch(`/api/rides/${incomingOffer.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS', driverId })
      });
      setIncomingOffer(null);
      setStatus('BUSY');
    } catch (err) {
      console.error('Error accepting ride offer:', err);
    }
  };

  return (
    <div className="animate-in" style={{ padding: '20px' }}>
      <div className="page-header" style={{ padding: 0, marginBottom: '24px' }}>
        <div>
          <span className="text-sm">Welcome back,</span>
          <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>{driver?.name || 'Driver'}</h1>
        </div>
        <div style={{ position: 'relative' }}>
          <span className={`badge ${status === 'AVAILABLE' ? 'badge-success pulse-green' : status === 'BUSY' ? 'badge-warning' : 'badge-muted'}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Online/Offline Status Panel */}
      <div className="glass" style={{ padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
        <h2 className="text-h2" style={{ marginBottom: '8px' }}>
          {status === 'AVAILABLE' ? "You are Online" : status === 'BUSY' ? "You are on a Ride" : "You are Offline"}
        </h2>
        <p className="text-body" style={{ marginBottom: '20px', fontSize: '13px' }}>
          {status === 'AVAILABLE' 
            ? "Your GPS is streaming live to Abuja dispatch center. Awaiting ride requests..." 
            : status === 'BUSY'
            ? "Drive safely. Complete current ride to receive more offers."
            : "Go online to start receiving ride bookings and bidding requests."}
        </p>

        <button 
          className={`btn ${status === 'AVAILABLE' ? 'btn-danger' : 'btn-primary'}`} 
          onClick={handleToggleStatus}
          disabled={loading}
          style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }}
        >
          {status === 'AVAILABLE' ? (
            <>
              <Square size={16} /> Go Offline
            </>
          ) : (
            <>
              <Play size={16} /> Go Online
            </>
          )}
        </button>
      </div>

      {/* Live Map with Driver Location and Surge Zones */}
      {driver?.location && (
        <LiveMap 
          driverLocation={driver.location} 
          surgeZones={surgeZones}
        />
      )}

      {/* Surge Heatmap Info */}
      <div className="glass" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', borderLeft: '4px solid var(--warning)' }}>
        <div style={{ background: 'var(--warning-light)', color: 'var(--warning)', padding: '10px', borderRadius: '12px' }}>
          <Zap size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 className="text-h3" style={{ fontSize: '14px', color: 'var(--warning)' }}>Surge Alert in Abuja</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            High demand in <strong>{surgeZone.name}</strong> ({surgeZone.multiplier}x multiplier).
          </p>
        </div>
      </div>

      {/* Daily Overview Stats */}
      <h3 className="text-h3" style={{ marginBottom: '12px', paddingLeft: '4px' }}>Today's Performance</h3>
      <div className="stat-row" style={{ marginBottom: '24px' }}>
        <div className="glass stat-card">
          <span className="stat-value" style={{ color: 'var(--accent-primary)' }}>₦8,400</span>
          <span className="stat-label">Earnings</span>
        </div>
        <div className="glass stat-card">
          <span className="stat-value" style={{ color: 'var(--info)' }}>5</span>
          <span className="stat-label">Trips</span>
        </div>
        <div className="glass stat-card">
          <span className="stat-value" style={{ color: 'var(--warning)' }}>
            ⭐ {driver?.rating || '4.8'}
          </span>
          <span className="stat-label">Rating</span>
        </div>
      </div>

      {/* Incoming Ride Offer Modal */}
      {incomingOffer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.88)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass" style={{ width: '100%', maxWidth: '380px', padding: '24px', border: '2px solid var(--accent-primary)', textAlign: 'center', position: 'relative' }}>
            {/* Countdown Badge */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid var(--accent-primary)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '800',
              margin: '0 auto 12px'
            }}>
              {countdown}s
            </div>

            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              New Dispatch Request
            </span>
            <h2 className="text-h2" style={{ fontSize: '26px', color: 'var(--accent-primary)', margin: '4px 0 16px' }}>
              ₦{incomingOffer.fare?.toLocaleString()}
            </h2>

            <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Passenger:</span> <strong style={{ color: '#fff' }}>{incomingOffer.passengerName}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Pickup:</span> <span>{incomingOffer.pickupLocation}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Dropoff:</span> <span>{incomingOffer.dropoffLocation}</span>
              </div>
              {incomingOffer.isCarpool && (
                <div style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>
                  👥 Shared Carpool Commute
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setIncomingOffer(null)}
                style={{ flex: 1, padding: '12px' }}
              >
                Decline
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleAcceptIncomingOffer}
                style={{ flex: 1.5, padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', fontSize: '15px', fontWeight: '700' }}
              >
                Accept Ride
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

