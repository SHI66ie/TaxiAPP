import React, { useState } from 'react';
import { MapPin, Search, Navigation, Compass, ChevronRight, Sparkles } from 'lucide-react';

export const ABUJA_PRESET_LOCATIONS = [
  { name: 'Central Business District (CBD)', coords: { lat: 9.0500, lng: 7.4800 }, desc: 'FCT Commercial & Ministerial Hub', tag: 'Fast Pickup' },
  { name: 'Maitama District', coords: { lat: 9.0800, lng: 7.4900 }, desc: 'Diplomatic Zone & High-end Area', tag: '3 mins' },
  { name: 'Wuse II (Aminu Kano)', coords: { lat: 9.05785, lng: 7.49508 }, desc: 'Banex & Entertainment Corridor', tag: 'Popular' },
  { name: 'Nnamdi Azikiwe Airport', coords: { lat: 9.0068, lng: 7.2631 }, desc: 'Airport Road Express Corridor', tag: 'Express' },
  { name: 'Gwarinpa Estate', coords: { lat: 9.07648, lng: 7.39857 }, desc: '1st & 3rd Avenue Axis', tag: '5 mins' },
  { name: 'Berger Roundabout / Utako', coords: { lat: 9.0650, lng: 7.4550 }, desc: 'Central Transit Interchange', tag: 'Interchange' }
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
        bottom: '86px', 
        left: '16px', 
        right: '16px', 
        padding: '20px',
        zIndex: 10,
        maxHeight: '75vh',
        overflowY: 'auto'
      }}
    >
      <div className="drawer-handle" />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Good day, Amina 👋</div>
          <h2 className="text-h2" style={{ margin: '2px 0 0', fontSize: '20px', color: '#FFFFFF' }}>Where are you heading?</h2>
        </div>
        <span className="badge-pill badge-green">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
          18 Taxis Active
        </span>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Connected Route Input Box */}
        <div style={{ 
          background: 'rgba(14, 19, 31, 0.65)', 
          borderRadius: '16px', 
          padding: '14px', 
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '16px',
          position: 'relative'
        }}>
          {/* Visual Route Connector */}
          <div style={{
            position: 'absolute',
            left: '27px',
            top: '32px',
            bottom: '32px',
            width: '2px',
            background: 'dashed 1px rgba(255, 212, 40, 0.5)',
            borderLeft: '2px dashed rgba(255, 212, 40, 0.4)',
            zIndex: 1
          }}></div>

          {/* Pickup */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', position: 'relative', zIndex: 2 }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              background: 'var(--aber-yellow)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: '12px',
              flexShrink: 0
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0E131F' }} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '700' }}>
                Pickup Location
              </span>
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
                  fontWeight: '600'
                }}
              />
            </div>
          </div>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)', margin: '8px 0 8px 36px' }} />

          {/* Destination */}
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 2 }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '6px', 
              background: '#EF4444', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginRight: '12px',
              flexShrink: 0
            }}>
              <div style={{ width: '8px', height: '8px', background: '#FFFFFF', borderRadius: '2px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '700' }}>
                Destination (Abuja)
              </span>
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
                  fontWeight: '700'
                }}
              />
            </div>
          </div>
        </div>

        {/* Quick Abuja Landmarks Presets */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
              <Compass size={14} color="var(--aber-yellow)" /> Quick Abuja Corridors
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tap to set</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
            {ABUJA_PRESET_LOCATIONS.slice(0, 4).map((preset, idx) => (
              <div 
                key={idx}
                onClick={() => handleSelectPreset(preset)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 212, 40, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '30px', 
                    height: '30px', 
                    borderRadius: '8px', 
                    background: 'var(--bg-surface-elevated)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--aber-yellow)'
                  }}>
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{preset.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{preset.desc}</div>
                  </div>
                </div>
                <span className="badge-pill badge-yellow" style={{ fontSize: '10px' }}>
                  {preset.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={!destination.trim()} 
          style={{ width: '100%', padding: '14px', fontSize: '15px' }}
        >
          <Search size={18} /> Find Rides & Compare Prices
        </button>
      </form>
    </div>
  );
};

export default BookingPanel;

