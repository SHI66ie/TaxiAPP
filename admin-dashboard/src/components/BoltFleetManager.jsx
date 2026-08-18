import React, { useState } from 'react';
import { Car, ShieldCheck, Award, Zap, Navigation, Radio, MapPin, CheckCircle } from 'lucide-react';

export default function BoltFleetManager({ drivers = [], onSimulateTelemetry }) {
  const [selectedCategory, setSelectedCategory] = useState('standard');
  const [activeDriver, setActiveDriver] = useState(drivers[0] || null);

  const fleetCategories = [
    { id: 'lite', name: 'Bolt Lite', desc: 'Economy rides for everyday commuters', multiplier: '0.85x Tariff', color: '#10b981' },
    { id: 'standard', name: 'Bolt Standard', desc: 'Comfortable sedan ride across Abuja', multiplier: '1.0x Tariff', color: '#06b6d4' },
    { id: 'comfort', name: 'Bolt Comfort Executive', desc: 'Premium luxury vehicles with top-rated drivers', multiplier: '1.35x Tariff', color: '#f59e0b' },
    { id: 'green', name: 'Bolt Green (Electric)', desc: 'Zero-emission hybrid & EV fleet', multiplier: '1.1x Tariff', color: '#22c55e' },
    { id: 'carpool', name: 'Bolt Carpool', desc: 'Shared commuter split-fare matching', multiplier: '0.65x Tariff', color: '#a855f7' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#10b981' }}>⚡</span> Bolt Multi-Tier Fleet & Telemetry Hub
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Multi-class vehicle dispatch, driver performance tiering, and high-frequency GPS telemetry streaming.
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          onClick={() => onSimulateTelemetry(activeDriver?.id || 'drv_101')}
        >
          <Radio size={16} /> Broadcast Live GPS Telemetry
        </button>
      </div>

      {/* Fleet Tiers Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {fleetCategories.map((cat) => (
          <div
            key={cat.id}
            className="glass-panel"
            style={{
              padding: '1rem',
              cursor: 'pointer',
              background: selectedCategory === cat.id ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.5)',
              border: selectedCategory === cat.id ? `2px solid ${cat.color}` : '1px solid rgba(255,255,255,0.08)'
            }}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: cat.color }}>{cat.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{cat.desc}</div>
            <span className="badge badge-success" style={{ marginTop: '0.6rem', fontSize: '0.7rem' }}>
              {cat.multiplier}
            </span>
          </div>
        ))}
      </div>

      {/* Drivers Performance & Telemetry Table */}
      <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.6)' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>
          🏆 Verified Driver Performance Ratings & Telemetry
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem' }}>Driver & Vehicle</th>
                <th style={{ padding: '0.75rem' }}>Category</th>
                <th style={{ padding: '0.75rem' }}>Rating & Tier</th>
                <th style={{ padding: '0.75rem' }}>Acceptance Rate</th>
                <th style={{ padding: '0.75rem' }}>Live GPS Coordinates</th>
                <th style={{ padding: '0.75rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((drv) => (
                <tr key={drv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{drv.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{drv.vehicle}</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>{drv.type}</span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>⭐ {drv.rating}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>🏅 Gold Tier Driver</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>96.5%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{drv.tripsCompleted} Completed</div>
                  </td>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    📍 {drv.location?.lat?.toFixed(4)}, {drv.location?.lng?.toFixed(4)}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      onClick={() => {
                        setActiveDriver(drv);
                        onSimulateTelemetry(drv.id);
                      }}
                    >
                      📡 Stream Ping
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
