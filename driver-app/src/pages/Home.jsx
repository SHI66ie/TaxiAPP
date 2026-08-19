import React, { useState, useEffect } from 'react';
import { Play, Square, Star, MapPin, Zap, Bell, Navigation, CheckCircle2, X, TrendingUp, Clock, DollarSign, Car, MessageSquare, Shield } from 'lucide-react';
import { socket } from '../App';
import LiveMap from '../components/LiveMap';

export default function Home() {
  const [driver, setDriver] = useState(null);
  const [status, setStatus] = useState('OFFLINE');
  const [loading, setLoading] = useState(false);
  const [surgeZone, setSurgeZone] = useState({ name: 'Central Business District', multiplier: 1.0 });
  const [surgeZones, setSurgeZones] = useState([]);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [countdown, setCountdown] = useState(15);
  const [todayStats, setTodayStats] = useState({ earnings: 8400, trips: 5, rating: 4.9, online: '4h 32m' });

  const driverId = 'drv_101';

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

  useEffect(() => {
    if (!incomingOffer) return;
    if (countdown <= 0) { setIncomingOffer(null); return; }
    const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [incomingOffer, countdown]);

  useEffect(() => {
    if (status !== 'AVAILABLE') return;
    const interval = setInterval(async () => {
      if (!driver) return;
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
            coords: { lat: driver.location.lat, lng: driver.location.lng, speed: 0, heading: 0, status: nextStatus }
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

  const handleAcceptOffer = async () => {
    if (!incomingOffer) return;
    try {
      await fetch(`/api/rides/${incomingOffer.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS', driverId })
      });
      setIncomingOffer(null);
      setStatus('BUSY');
      setTodayStats(prev => ({ ...prev, trips: prev.trips + 1, earnings: prev.earnings + (incomingOffer.fare || 2500) }));
    } catch (err) {
      console.error('Error accepting ride offer:', err);
    }
  };

  const statusColor = status === 'AVAILABLE' ? '#10B981' : status === 'BUSY' ? '#F59E0B' : '#6B7280';
  const statusLabel = status === 'AVAILABLE' ? 'Online' : status === 'BUSY' ? 'On Trip' : 'Offline';

  return (
    <div style={{ padding: '16px 20px 100px', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
            Driver Dashboard
          </span>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', margin: '2px 0 0' }}>
            {driver?.name || 'Ibrahim Danladi'}
          </h1>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: `${statusColor}22`,
          border: `1px solid ${statusColor}55`
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, display: 'inline-block' }}></span>
          <span style={{ fontSize: '12px', fontWeight: '700', color: statusColor }}>{statusLabel}</span>
        </div>
      </div>

      {/* Go Online Toggle Card */}
      <div
        style={{
          padding: '20px',
          borderRadius: '20px',
          background: status === 'AVAILABLE'
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))'
            : 'rgba(255, 255, 255, 0.04)',
          border: `1px solid ${status === 'AVAILABLE' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
          marginBottom: '20px',
          textAlign: 'center'
        }}
      >
        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: '16px',
          lineHeight: 1.5
        }}>
          {status === 'AVAILABLE'
            ? 'Your GPS is live on the Abuja dispatch map. Incoming offers will appear here.'
            : status === 'BUSY'
            ? 'Complete your current trip before going offline.'
            : 'Tap Go Online to start receiving bookings and earn for today.'}
        </p>

        <button
          onClick={handleToggleStatus}
          disabled={loading || status === 'BUSY'}
          style={{
            padding: '14px 36px',
            borderRadius: '16px',
            background: status === 'AVAILABLE'
              ? '#EF4444'
              : 'linear-gradient(135deg, #FFD428, #E6AC00)',
            border: 'none',
            color: status === 'AVAILABLE' ? '#FFFFFF' : '#0E131F',
            fontSize: '15px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            margin: '0 auto',
            boxShadow: status === 'AVAILABLE'
              ? '0 4px 16px rgba(239, 68, 68, 0.4)'
              : '0 4px 16px rgba(255, 212, 40, 0.4)',
            opacity: status === 'BUSY' ? 0.6 : 1,
            minWidth: '180px'
          }}
        >
          {status === 'AVAILABLE' ? <Square size={18} /> : <Play size={18} />}
          {loading ? 'Updating...' : status === 'AVAILABLE' ? 'Go Offline' : status === 'BUSY' ? 'On Trip' : 'Go Online'}
        </button>
      </div>

      {/* Live Map */}
      {driver?.location && (
        <div style={{ marginBottom: '20px' }}>
          <LiveMap driverLocation={driver.location} surgeZones={surgeZones} />
        </div>
      )}

      {/* Surge Zone Alert */}
      {surgeZone.multiplier > 1.0 && (
        <div style={{
          padding: '14px 16px',
          borderRadius: '16px',
          background: 'rgba(255, 137, 0, 0.12)',
          border: '1px solid rgba(255, 137, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'rgba(255, 137, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FF8900'
          }}>
            <Zap size={20} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#FF8900' }}>⚡ Surge Active in Abuja</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              <strong>{surgeZone.name}</strong> — {surgeZone.multiplier}x fare multiplier
            </div>
          </div>
        </div>
      )}

      {/* Today's Stats */}
      <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
        Today's Performance
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { icon: DollarSign, label: 'Earnings', value: `₦${todayStats.earnings.toLocaleString()}`, color: '#FFD428' },
          { icon: Car, label: 'Trips', value: String(todayStats.trips), color: '#10B981' },
          { icon: Star, label: 'Rating', value: `★ ${todayStats.rating}`, color: '#F59E0B' },
          { icon: Clock, label: 'Online Time', value: todayStats.online, color: '#60A5FA' }
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              padding: '14px 16px',
              borderRadius: '16px',
              background: `${stat.color}10`,
              border: `1px solid ${stat.color}30`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <stat.icon size={18} color={stat.color} />
            <div style={{ fontSize: '20px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Incoming Ride Offer Modal */}
      {incomingOffer && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.92)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '380px',
            padding: '24px',
            borderRadius: '24px',
            background: 'rgba(23, 30, 46, 0.98)',
            border: '2px solid rgba(255, 212, 40, 0.5)',
            textAlign: 'center',
            boxShadow: '0 0 40px rgba(255, 212, 40, 0.2)'
          }}>
            {/* Countdown */}
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(255, 212, 40, 0.15)',
              border: '3px solid var(--aber-yellow)',
              color: 'var(--aber-yellow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: '800', margin: '0 auto 12px'
            }}>
              {countdown}s
            </div>

            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '1px' }}>
              New Booking Request
            </span>
            <h2 style={{ fontSize: '30px', fontWeight: '800', color: 'var(--aber-yellow)', margin: '4px 0 16px' }}>
              ₦{incomingOffer.fare?.toLocaleString()}
            </h2>

            <div style={{
              textAlign: 'left', background: 'rgba(255, 255, 255, 0.03)',
              padding: '14px', borderRadius: '14px', marginBottom: '20px',
              fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Passenger:</span>
                <strong style={{ color: '#fff' }}>{incomingOffer.passengerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pickup:</span>
                <span style={{ color: '#FFFFFF', maxWidth: '200px', textAlign: 'right' }}>{incomingOffer.pickupLocation}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dropoff:</span>
                <span style={{ color: '#FFFFFF', maxWidth: '200px', textAlign: 'right' }}>{incomingOffer.dropoffLocation}</span>
              </div>
              {incomingOffer.isCarpool && (
                <div style={{ color: '#FF8900', fontWeight: '700', fontSize: '12px', padding: '4px 8px', background: 'rgba(255,137,0,0.1)', borderRadius: '8px' }}>
                  👥 Carpool Split — Shared Route
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setIncomingOffer(null)}
                style={{ flex: 1, padding: '13px', borderRadius: '14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
              >
                Decline
              </button>
              <button
                onClick={handleAcceptOffer}
                style={{ flex: 1.6, padding: '13px', borderRadius: '14px', background: 'linear-gradient(135deg, #FFD428, #E6AC00)', border: 'none', color: '#0E131F', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255, 212, 40, 0.4)' }}
              >
                ✓ Accept Ride
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
