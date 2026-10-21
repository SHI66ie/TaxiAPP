import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Compass, Loader } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
// Abuja city centre — biases geocoding results toward Abuja
const ABUJA_LNG = 7.4898;
const ABUJA_LAT = 9.0579;

// Debounce hook — waits `delay` ms after the user stops typing
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

const BookingPanel = ({ onSearch }) => {
  const [pickup] = useState({
    name: 'Wuse II (Aminu Kano Crescent)',
    coords: { lat: 9.05785, lng: 7.49508 }
  });
  const [destination, setDestination] = useState('');
  const [selectedDestCoords, setSelectedDestCoords] = useState(null);

  // ── Autocomplete state ─────────────────────────────────────────────────────
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(destination, 320);
  const dropdownRef = useRef(null);

  // ── Mapbox Geocoding API call ───────────────────────────────────────────────
  useEffect(() => {
    // Don't search if: empty, too short, or a location is already locked in
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="bottom-sheet animate-slide-up"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 20px 88px',
        zIndex: 40,
        background: 'linear-gradient(180deg, #171E2E 0%, #0E131F 100%)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.7)',
        maxHeight: '68vh',
        overflowY: 'auto'
      }}
    >
      <div className="drawer-handle" style={{ marginTop: '2px', marginBottom: '12px' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Good day, Amina 👋</div>
          <h2 className="text-h2" style={{ margin: '2px 0 0', fontSize: '20px', color: '#FFFFFF' }}>Where are you heading?</h2>
        </div>
        <span className="badge-pill badge-green">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          18 Taxis Active
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Route input card */}
        <div style={{
          background: 'rgba(14, 19, 31, 0.65)',
          borderRadius: '16px',
          padding: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '16px',
          position: 'relative'
        }}>
          {/* Dashed connector line */}
          <div style={{
            position: 'absolute',
            left: '27px',
            top: '32px',
            bottom: '32px',
            borderLeft: '2px dashed rgba(255, 212, 40, 0.4)',
            zIndex: 1
          }} />

          {/* Pickup row */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', position: 'relative', zIndex: 2 }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'var(--aber-yellow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginRight: '12px', flexShrink: 0
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0E131F' }} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '700' }}>
                Pickup Location
              </span>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', paddingTop: '2px' }}>
                {pickup.name}
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)', margin: '8px 0 8px 36px' }} />

          {/* Destination row — with live autocomplete */}
          <div ref={dropdownRef} style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 20 }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '6px',
              background: '#EF4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginRight: '12px', flexShrink: 0, marginTop: '4px'
            }}>
              <div style={{ width: '8px', height: '8px', background: '#FFFFFF', borderRadius: '2px' }} />
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '700' }}>
                Destination (Abuja)
              </span>

              {/* Input + spinner/tick */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Type any Abuja address or place…"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setSelectedDestCoords(null);
                  }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    width: '100%',
                    fontWeight: '700',
                    paddingTop: '2px'
                  }}
                />
                {isSearching && (
                  <Loader size={14} color="#FFD428" style={{ flexShrink: 0, animation: 'spin 1s linear infinite' }} />
                )}
                {selectedDestCoords && !isSearching && (
                  <span style={{ fontSize: '15px', flexShrink: 0 }}>✅</span>
                )}
              </div>

              {/* ── Autocomplete dropdown ──────────────────────────────── */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  left: '-36px',
                  right: 0,
                  background: 'rgba(10, 14, 26, 0.97)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 212, 40, 0.28)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  zIndex: 999,
                  boxShadow: '0 10px 36px rgba(0,0,0,0.7)'
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
                      <MapPin size={14} color="#FFD428" style={{ flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: '13px', fontWeight: '700', color: '#FFFFFF',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                          {s.name}
                        </div>
                        <div style={{
                          fontSize: '11px', color: 'var(--text-muted)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                          {s.fullName}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Mapbox attribution (required by ToS) */}
                  <div style={{
                    padding: '5px 14px',
                    fontSize: '10px', color: 'var(--text-muted)',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    🗺️ Powered by Mapbox
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Abuja preset corridors — hidden while suggestions are open */}
        {!showSuggestions && (
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
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 212, 40, 0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      background: 'var(--bg-surface-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--aber-yellow)'
                    }}>
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{preset.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{preset.desc}</div>
                    </div>
                  </div>
                  <span className="badge-pill badge-yellow" style={{ fontSize: '10px' }}>{preset.tag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={!destination.trim()}
          style={{ width: '100%', padding: '14px', fontSize: '15px' }}
        >
          <Search size={18} /> Find Rides &amp; Compare Prices
        </button>
      </form>
    </div>
  );
};

export default BookingPanel;
