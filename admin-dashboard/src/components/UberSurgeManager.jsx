import React, { useState } from 'react';
import { Zap, TrendingUp, Sliders, MapPin, Banknote, ShieldAlert, Check } from 'lucide-react';


export default function UberSurgeManager({ surgeZones = [], onUpdateZoneDemand }) {
  const [selectedZone, setSelectedZone] = useState('maitama');
  const [demandBoost, setDemandBoost] = useState(15);

  const activeZoneData = surgeZones.find(z => z.id === selectedZone) || surgeZones[0] || {
    id: 'maitama',
    name: 'Maitama District',
    activeDemand: 42,
    activeDrivers: 14,
    multiplier: 1.8,
    level: 'HIGH'
  };

  const handleSimulateDemandSpike = (demandDelta, driverDelta) => {
    onUpdateZoneDemand(activeZoneData.id, demandDelta, driverDelta);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#ef4444' }}>⚡</span> TaxiAPP Dynamic Surge & Demand Grid Engine
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Calculates live demand-to-supply ratio across Abuja corridors with TaxiAPP's dynamic fare surge multipliers.
          </p>
        </div>
        <span className="badge badge-error" style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}>
          ⚡ Heatmap Grid Active
        </span>
      </div>

      {/* Grid of Abuja Zones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {surgeZones.map((zone) => {
          const isHigh = zone.multiplier >= 1.7;
          const isMed = zone.multiplier > 1.1 && zone.multiplier < 1.7;
          const badgeClass = isHigh ? 'badge-error' : isMed ? 'badge-warning' : 'badge-success';
          const cardBorder = isHigh ? '1px solid rgba(239, 68, 68, 0.4)' : isMed ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.2)';

          return (
            <div
              key={zone.id}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                background: selectedZone === zone.id ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.5)',
                border: cardBorder,
                transition: 'all 0.2s ease'
              }}
              onClick={() => setSelectedZone(zone.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '0.95rem' }}>{zone.name}</strong>
                <span className={`badge ${badgeClass}`}>{zone.multiplier}x Surge</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                <span>📱 Demand: {zone.activeDemand}</span>
                <span>🚕 Drivers: {zone.activeDrivers}</span>
              </div>
              <div style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, (zone.activeDemand / (zone.activeDrivers || 1)) * 25)}%`,
                    height: '100%',
                    background: isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulator Control Center */}
      <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(17, 24, 39, 0.7)' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
          🎛️ Live Surge Control Simulator: {activeZoneData.name}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span>Simulate Rider Demand Spike:</span>
              <strong style={{ color: '#ef4444' }}>+{demandBoost} Requests</strong>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={demandBoost}
              onChange={e => setDemandBoost(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#ef4444' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                className="btn btn-primary"
                style={{ background: '#ef4444', flex: 1 }}
                onClick={() => handleSimulateDemandSpike(demandBoost, 0)}
              >
                <TrendingUp size={16} /> Surge Zone (+{demandBoost} Demand)
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => handleSimulateDemandSpike(0, 10)}
              >
                🚕 Dispatch (+10 Drivers)
              </button>
            </div>
          </div>

          <div style={{ background: 'rgba(10, 14, 24, 0.8)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Upfront Transparent Fare Breakdown
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <span>Base Standard Tariff (5 km):</span>
              <span>₦1,950</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#ef4444' }}>
              <span>Surge Multiplier ({activeZoneData.multiplier}x):</span>
              <span>+₦{Math.round(1950 * (activeZoneData.multiplier - 1))}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontWeight: 800, fontSize: '1.1rem' }}>
              <span>Total Rider Fare:</span>
              <span style={{ color: 'var(--accent-gold)' }}>₦{Math.round(1950 * activeZoneData.multiplier).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
