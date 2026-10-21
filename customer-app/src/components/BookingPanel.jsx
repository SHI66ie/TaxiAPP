import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Compass, Loader, ChevronDown, ChevronUp, Navigation, X } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const ABUJA_LNG = 7.4898;
const ABUJA_LAT = 9.0579;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export const ABUJA_PRESET_LOCATIONS = [
  { name: 'Central Business District (CBD)', coords: { lat: 9.0500, lng: 7.4800 }, desc: 'FCT Commercial & Ministerial Hub', tag: 'Fast Pickup' },
  { name: 'Maitama District', coords: { lat: 9.0800, lng: 7.4900 }, desc: 'Diplomatic Zone & High-end Area', tag: '3 mins' },
  { name: 'Wuse II (Aminu Kano)', coords: { lat: 9.05785, lng: 7.49508 }, desc: 'Banex & Entertainment Corridor', tag: 'Popular' },
  { name: 'Nnamdi Azikiwe Airport', coords: { lat: 9.0068, lng: 7.2631 }, desc: 'Airport Road Express Corridor', tag: 'Express' },
  { name: 'Gwarinpa Estate', coords: { lat: 9.07648, lng: 7.39857 }, desc: '1st & 3rd Avenue Axis', tag: '5 mins' },
  { name: 'Berger Roundabout / Utako', coords: { lat: 9.0650, lng: 7.4550 }, desc: 'Central Transit Interchange', tag: 'Interchange' }
];

export default function BookingPanel({ onSearch, isExpanded, onToggleExpand }) {
  const [pickup, setPickup] = useState({
    name: 'Wuse II (Aminu Kano Crescent)',
    coords: { lat: 9.05785, lng: 7.49508 }
  });
  const [destination, setDestination] = useState('');
  const [selectedDestCoords, setSelectedDestCoords] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(destination, 320);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2 || selectedDestCoords) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSearching(true);
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
      `${encodeURIComponent(debouncedQuery)}.json` +
      `?proximity=${ABUJA_LNG},${ABUJA_LAT}` +
      `&country=ng` +
      `&types=place,locality,neighborhood,address,poi` +
      `&limit=6` +
      `&access_token=${MAPBOX_TOKEN}`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        const features = data.features || [];
        setSuggestions(features.map(f => ({
          id: f.id,
          name: f.text,
          fullName: f.place_name,
          coords: { lng: f.center[0], lat: f.center[1] }
        })));
        setShowSuggestions(features.length > 0);
      })
      .catch(() => setSuggestions([]))
      .finally(() => setIsSearching(false));
  }, [debouncedQuery, selectedDestCoords]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectSuggestion = (s) => {
    setDestination(s.fullName);
    setSelectedDestCoords(s.coords);
    setShowSuggestions(false);
    setSuggestions([]);
    onSearch({ pickup, destination: { name: s.fullName, coords: s.coords } });
  };

  const handleSelectPreset = (preset) => {
    setDestination(preset.name);
    setSelectedDestCoords(preset.coords);
    setShowSuggestions(false);
    onSearch({ pickup, destination: { name: preset.name, coords: preset.coords } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (destination.trim()) {
      const coords = selectedDestCoords || { lat: 9.0500, lng: 7.4800 };
      onSearch({ pickup, destination: { name: destination, coords } });
    }
  };

  return (
    <div
      className="bottom-sheet animate-slide-up"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 18px 84px',
        zIndex: 40,
        background: 'linear-gradient(180deg, #171E2E 0%, #0E131F 100%)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.7)',
        maxHeight: isExpanded ? '72vh' : 'auto',
        transition: 'max-height 0.3s ease',
        overflowY: isExpanded ? 'auto' : 'visible'
      }}
    >
      {/* Drawer Handle & Toggle Button */}
      <div 
        onClick={onToggleExpand}
        style={{ 
          cursor: 'pointer', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '4px 0 8px' 
        }}
      >
        <div className="drawer-handle" style={{ margin: 0 }} />
      </div>

      {/* Prominent Conventional Search Bar Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Abuja Express Ride
          </span>
          <h2 style={{ fontSize: '19px', fontWeight: '800', color: '#FFFFFF', margin: '2px 0 0' }}>
            Where to?
          </h2>
        </div>
        <button
          type="button"
          onClick={onToggleExpand}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '4px 10px',
            color: 'var(--text-secondary)',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Connected Search Input Card */}
        <div style={{
          background: 'rgba(14, 19, 31, 0.75)',
          borderRadius: '16px',
          padding: '12px 14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '12px',
          position: 'relative'
        }}>
          {/* Connector line */}
          <div style={{
            position: 'absolute',
            left: '26px',
            top: '30px',
            bottom: '30px',
            borderLeft: '2px dashed rgba(255, 212, 40, 0.4)',
            zIndex: 1
          }} />

          {/* Pickup row */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', position: 'relative', zIndex: 2 }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%',
              background: 'var(--aber-yellow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginRight: '12px', flexShrink: 0
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0E131F' }} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '700' }}>
                Pickup Point
              </span>
              <input
                type="text"
                value={pickup.name}
                onChange={(e) => setPickup(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  width: '100%',
                  fontWeight: '600'
                }}
              />
            </div>
          </div>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)', margin: '6px 0 6px 34px' }} />

          {/* Search Destination Row */}
          <div ref={dropdownRef} style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 20 }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '6px',
              background: '#EF4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginRight: '12px', flexShrink: 0, marginTop: '3px'
            }}>
              <div style={{ width: '6px', height: '6px', background: '#FFFFFF', borderRadius: '2px' }} />
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '700' }}>
                Where to? (Destination)
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Type an address, landmark or district..."
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setSelectedDestCoords(null);
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    width: '100%',
                    fontWeight: '700',
                    paddingTop: '2px'
                  }}
                />
                {isSearching && (
                  <Loader size={14} color="#FFD428" style={{ flexShrink: 0, animation: 'spin 1s linear infinite' }} />
                )}
                {destination && (
                  <X 
                    size={15} 
                    color="var(--text-muted)" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => { setDestination(''); setSelectedDestCoords(null); }}
                  />
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '-34px',
                  right: 0,
                  background: 'rgba(12, 16, 28, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 212, 40, 0.3)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  zIndex: 999,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.8)'
                }}>
                  {suggestions.map((s, i) => (
                    <div
                      key={s.id}
                      onMouseDown={() => handleSelectSuggestion(s)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '11px 14px',
                        cursor: 'pointer',
                        borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,212,40,0.09)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <MapPin size={15} color="#FFD428" style={{ flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.fullName}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: '6px 14px', fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    🗺️ Powered by Mapbox Geocoding
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Corridor Buttons (Shown when expanded or no suggestions) */}
        {isExpanded && !showSuggestions && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                <Compass size={14} color="var(--aber-yellow)" /> Abuja Corridors
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tap to set</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
              {ABUJA_PRESET_LOCATIONS.slice(0, 3).map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} color="var(--aber-yellow)" />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>{preset.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{preset.desc}</div>
                    </div>
                  </div>
                  <span className="badge-pill badge-yellow" style={{ fontSize: '9px' }}>{preset.tag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={!destination.trim()}
          style={{ width: '100%', padding: '13px', fontSize: '15px' }}
        >
          <Search size={18} /> Find Available Taxis
        </button>
      </form>
    </div>
  );
}
