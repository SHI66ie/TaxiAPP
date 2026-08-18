import React, { useState, useEffect } from 'react';
import { Play, Square, Star, MapPin, Zap, RefreshCw } from 'lucide-react';
import { socket } from '../App';

export default function Home() {
  const [driver, setDriver] = useState(null);
  const [status, setStatus] = useState('OFFLINE'); // OFFLINE, AVAILABLE, BUSY
  const [loading, setLoading] = useState(false);
  const [surgeZone, setSurgeZone] = useState({ name: 'Central Business District', multiplier: 1.0 });

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
        // Find highest surge zone to alert driver
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

    return () => {
      socket.off('location_changed');
      socket.off('surge_updated');
    };
  }, []);

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
      // Direct driver status endpoints don't exist as clean REST endpoints in API, 
      // but modifying location/telemetry or simulating can update statuses on backend, 
      // or we can invoke our custom mock update via endpoint or local mock implementation.
      // Wait! The server has routes, let's look at `apiRoutes.js` for updating status.
      // `PATCH /rides/:id/status` is for rides.
      // Let's check how admin dashboard sets status. The admin dashboard doesn't directly set driver online status,
      // it just reads `drivers`. Let's mock the toggle locally and call location update to wake up status.
      setStatus(nextStatus);
      if (driver) {
        // Send a location update to register status online
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

      {/* Driver Location Data */}
      {driver?.location && (
        <div className="glass" style={{ padding: '16px', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <MapPin size={14} />
            <span>Telemetry Coordinates</span>
          </div>
          <div className="text-mono" style={{ color: 'var(--text-secondary)' }}>
            Lat: {driver.location.lat.toFixed(6)} <br />
            Lng: {driver.location.lng.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
}
