import React, { useState } from 'react';
import { MapPin, Search, Navigation, Compass, ChevronRight } from 'lucide-react';

export const ABUJA_PRESET_LOCATIONS = [
  { name: 'Central Business District (CBD)', coords: { lat: 9.0500, lng: 7.4800 }, desc: 'FCT Commercial & Ministerial Hub' },
  { name: 'Maitama District', coords: { lat: 9.0800, lng: 7.4900 }, desc: 'Diplomatic Zone & High-end Area' },
  { name: 'Wuse II', coords: { lat: 9.05785, lng: 7.49508 }, desc: 'Aminu Kano & Banex Corridor' },
  { name: 'Nnamdi Azikiwe Airport (Express)', coords: { lat: 9.0068, lng: 7.2631 }, desc: 'Airport Road Express corridor' },
  { name: 'Gwarinpa Estate', coords: { lat: 9.07648, lng: 7.39857 }, desc: '3rd Avenue & 1st Avenue Axis' },
  { name: 'Berger Roundabout / Utako', coords: { lat: 9.0650, lng: 7.4550 }, desc: 'Central Transit Interchange' },
  { name: 'Kubwa Modern Market', coords: { lat: 9.1500, lng: 7.3300 }, desc: 'Kubwa Expressway Zone' }
];

const BookingPanel = ({ onSearch }) => {
  const [pickup, setPickup] = useState({
    name: 'Wuse II (Aminu Kano Crescent)',
    coords: { lat: 9.05785, lng: 7.49508 }
  });
  const [destination, setDestination] = useState('');
  const [selectedDestCoords, setSelectedDestCoords] = useState(null);

  const handleSelectPreset = (preset) => {
    setDestination(preset.name);
    setSelectedDestCoords(preset.coords);
    onSearch({
      pickup,
      destination: {
        name: preset.name,
        coords: preset.coords
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (destination.trim()) {
      const coords = selectedDestCoords || { lat: 9.0500, lng: 7.4800 };
      onSearch({
        pickup,
        destination: {
          name: destination,
          coords
        }
      });
    }
  };

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 className="text-h2" style={{ margin: 0, fontSize: '18px' }}>Where to, Abuja?</h2>
        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-primary)', fontWeight: '600' }}>
          🟢 Drivers Active
        </span>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Pickup point */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: 'rgba(255,255,255,0.03)', 
          padding: '10px 14px', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '10px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <Navigation size={16} color="var(--accent-primary)" style={{ marginRight: '10px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pickup Location</span>
            <input 
              type="text" 
              value={pickup.name}
              onChange={(e) => setPickup(prev => ({ ...prev, name: e.target.value }))}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '14px',
                width: '100%',
                fontWeight: '500'
              }}
            />
          </div>
        </div>

        {/* Destination point */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: 'var(--bg-surface-elevated)', 
          padding: '12px 14px', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '16px',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <Search size={18} color="var(--accent-primary)" style={{ marginRight: '10px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Destination</span>
            <input 
              type="text" 
              placeholder="Search destination in Abuja..." 
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setSelectedDestCoords(null);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '15px',
                width: '100%',
                fontWeight: '600'
              }}
            />
          </div>
        </div>

        {/* Quick Abuja Landmarks Presets */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Compass size={13} /> Popular Abuja Corridors
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
            {ABUJA_PRESET_LOCATIONS.slice(0, 4).map((preset, idx) => (
              <div 
                key={idx}
                onClick={() => handleSelectPreset(preset)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={14} color="var(--accent-primary)" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500' }}>{preset.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{preset.desc}</div>
                  </div>
                </div>
                <ChevronRight size={14} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={!destination.trim()} style={{ width: '100%', padding: '12px' }}>
          Find Rides & Compare Prices
        </button>
      </form>
    </div>
  );
};

export default BookingPanel;
