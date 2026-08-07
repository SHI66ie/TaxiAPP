import React from 'react';
import { Navigation, ShieldCheck, Clock, Award, Phone } from 'lucide-react';

export default function LiveMap({ drivers, rides, onSimulateBooking }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h2>🗺️ Live Abuja Fleet Tracking & Dispatch Radar</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Real-time GPS pings across Wuse II, Maitama, Gwarinpa, CBD & Airport Express
          </p>
        </div>
        <button className="btn btn-primary" onClick={onSimulateBooking}>
          <Navigation size={16} /> Simulate Passenger Booking
        </button>
      </div>

      <div className="map-container">
        <div className="map-radar-ring"></div>
        
        {/* Map Zone Annotations */}
        <div style={{ position: 'absolute', top: 20, left: 30, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
          📍 MAITAMA / WUSE II
        </div>
        <div style={{ position: 'absolute', bottom: 30, left: 40, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
          ✈️ AIRPORT EXPRESS / LUGBE
        </div>
        <div style={{ position: 'absolute', top: 30, right: 40, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
          🏙️ CENTRAL BUSINESS DISTRICT
        </div>
        <div style={{ position: 'absolute', bottom: 40, right: 50, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
          🏡 GWARINPA / KUBWA
        </div>

        {/* Driver Map Markers */}
        {drivers.map((drv, idx) => {
          // Layout drivers visually across the canvas
          const offsets = [
            { top: '35%', left: '42%' },
            { top: '65%', left: '72%' },
            { top: '25%', left: '68%' },
            { top: '50%', left: '30%' }
          ];
          const pos = offsets[idx % offsets.length];

          return (
            <div
              key={drv.id}
              className="driver-marker"
              style={{ ...pos }}
              title={`${drv.name} - ${drv.vehicle} (${drv.status})`}
            >
              <Navigation
                size={18}
                color={drv.status === 'AVAILABLE' ? 'var(--accent-emerald)' : 'var(--accent-gold)'}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -22,
                  whiteSpace: 'nowrap',
                  background: 'rgba(7, 9, 14, 0.9)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: '0.7rem',
                  border: '1px solid var(--border-color)'
                }}
              >
                {drv.name.split(' ')[0]} ({drv.type})
              </div>
            </div>
          );
        })}
      </div>

      {/* Driver Cards Grid */}
      <h3 style={{ marginBottom: '1rem' }}>🚖 Verified Fleet Drivers ({drivers.length})</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {drivers.map(driver => (
          <div key={driver.id} className="glass-panel" style={{ padding: '1rem', background: 'rgba(15, 20, 32, 0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong style={{ fontSize: '1rem' }}>{driver.name}</strong>
              <span className={`badge ${driver.status === 'AVAILABLE' ? 'badge-success' : 'badge-warning'}`}>
                {driver.status}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              🚗 {driver.vehicle}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>⭐ {driver.rating} ({driver.tripsCompleted} trips)</span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                ₦{driver.walletBalance.toLocaleString()} Earned
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
