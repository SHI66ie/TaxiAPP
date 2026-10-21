import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { LocateFixed } from 'lucide-react';
import L from 'leaflet';
import { socket } from '../App';

// ── Road routing via OSRM (free, no API key required) ──────────────────────
// Returns { coordinates: [[lat,lng],...], distance_km, duration_min } or null
async function fetchOSRMRoute(pickup, dropoff) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}` +
    `?overview=full&geometries=geojson&steps=false`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.code !== 'Ok' || !json.routes?.length) return null;
    const route = json.routes[0];
    // GeoJSON coords are [lng, lat]; Leaflet needs [lat, lng]
    const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const distance_km = (route.distance / 1000).toFixed(1);
    const duration_min = Math.ceil(route.duration / 60);
    return { coordinates, distance_km, duration_min };
  } catch (err) {
    console.error('OSRM routing error:', err);
    return null;
  }
}

// Custom Aber Taxi Car Marker (DivIcon with Yellow Taxi badge)
const createTaxiIcon = (name) => {
  return L.divIcon({
    className: 'custom-taxi-marker',
    html: `
      <div style="
        width: 38px;
        height: 38px;
        background: #FFD428;
        border-radius: 50%;
        border: 2.5px solid #0E131F;
        box-shadow: 0 4px 12px rgba(255, 212, 40, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E131F" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.7 2 10.8 2 11v5c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/>
          <path d="M9 17h6"/>
          <circle cx="17" cy="17" r="2"/>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });
};

// Custom Pickup Location Marker (Aber Yellow Pulse)
const pickupIcon = L.divIcon({
  className: 'custom-pickup-marker',
  html: `
    <div style="
      width: 22px;
      height: 22px;
      background: #FFD428;
      border: 3px solid #0E131F;
      border-radius: 50%;
      box-shadow: 0 0 0 6px rgba(255, 212, 40, 0.35);
      animation: pulseYellow 2s infinite;
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

// Custom Destination Location Marker (Aber Red Flag Pin)
const destIcon = L.divIcon({
  className: 'custom-dest-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #EF4444;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #FFFFFF;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.6);
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: #FFFFFF;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// Recenter Map Hook Component
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
};

// Map Controller for external flyTo/center
const MapController = ({ targetCenter }) => {
  const map = useMap();
  useEffect(() => {
    if (targetCenter && targetCenter[0] && targetCenter[1]) {
      map.flyTo(targetCenter, 15, { animate: true, duration: 1.2 });
    }
  }, [targetCenter, map]);
  return null;
};

// Auto-fit map bounds to the full route polyline
const FitRouteBounds = ({ coordinates }) => {
  const map = useMap();
  useEffect(() => {
    if (coordinates && coordinates.length >= 2) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [60, 60], animate: true, maxZoom: 15 });
    }
  }, [coordinates, map]);
  return null;
};

const LiveMap = ({ pickupCoords, dropoffCoords, isBooking }) => {
  const [userLoc, setUserLoc] = useState([9.05785, 7.49508]); // Default Wuse II, Abuja
  const [flyTarget, setFlyTarget] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [drivers, setDrivers] = useState({
    drv_101: { lat: 9.05785, lng: 7.49508, name: 'Ibrahim (Corolla)' },
    drv_102: { lat: 9.07648, lng: 7.39857, name: 'Chidi (Accord)' },
    drv_103: { lat: 9.03333, lng: 7.48333, name: 'Musa (Okada)' }
  });

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newCoords = [latitude, longitude];
        setUserLoc(newCoords);
        setFlyTarget(newCoords);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        alert('Could not retrieve current location. Please verify device GPS/location permission.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Road-following route state (fetched from OSRM)
  const [routeCoords, setRouteCoords] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null); // { distance_km, duration_min }
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    if (pickupCoords?.lat && pickupCoords?.lng) {
      setUserLoc([pickupCoords.lat, pickupCoords.lng]);
    }
  }, [pickupCoords]);

  // Fetch real road route whenever pickup or dropoff changes
  useEffect(() => {
    if (pickupCoords?.lat && pickupCoords?.lng && dropoffCoords?.lat && dropoffCoords?.lng) {
      setRouteLoading(true);
      setRouteCoords(null);
      setRouteInfo(null);
      fetchOSRMRoute(pickupCoords, dropoffCoords).then((result) => {
        if (result) {
          setRouteCoords(result.coordinates);
          setRouteInfo({ distance_km: result.distance_km, duration_min: result.duration_min });
        } else {
          // Fallback: straight line if OSRM fails (e.g. offline)
          setRouteCoords([
            [pickupCoords.lat, pickupCoords.lng],
            [dropoffCoords.lat, dropoffCoords.lng]
          ]);
        }
        setRouteLoading(false);
      });
    } else {
      setRouteCoords(null);
      setRouteInfo(null);
    }
  }, [pickupCoords, dropoffCoords]);

  useEffect(() => {
    // Fetch initial online drivers
    fetch('/api/drivers')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          const map = {};
          json.data.forEach(d => {
            if (d.location) {
              map[d.id] = { lat: d.location.lat, lng: d.location.lng, name: d.name };
            }
          });
          setDrivers(prev => ({ ...prev, ...map }));
        }
      })
      .catch(err => console.error('Driver fetch err:', err));

    // Socket real-time updates
    const handleLocationUpdate = (data) => {
      if (data && data.driverId && data.location) {
        setDrivers(prev => ({
          ...prev,
          [data.driverId]: { ...data.location, name: data.name || prev[data.driverId]?.name }
        }));
      } else if (data && data.id && data.location) {
        setDrivers(prev => ({
          ...prev,
          [data.id]: { ...data.location, name: data.name || prev[data.id]?.name }
        }));
      }
    };

    socket.on('driver_location_update', handleLocationUpdate);
    socket.on('location_changed', handleLocationUpdate);

    return () => {
      socket.off('driver_location_update', handleLocationUpdate);
      socket.off('location_changed', handleLocationUpdate);
    };
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <MapContainer 
        center={userLoc} 
        zoom={14} 
        zoomControl={false} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* Standard OpenStreetMap Tiles - 100% Free, No Watermark, Clean Cartography */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Recenter only when there is no active route */}
        {!routeCoords && <RecenterMap center={userLoc} />}

        {/* Map fly-to controller on location click */}
        <MapController targetCenter={flyTarget} />

        {/* Auto-fit map to the road route */}
        {routeCoords && <FitRouteBounds coordinates={routeCoords} />}

        {/* User / Pickup Marker */}
        <Marker position={userLoc} icon={pickupIcon}>
          <Popup>
            <div style={{ color: '#0E131F', fontWeight: 'bold', fontSize: '12px' }}>📍 Pickup Point (You)</div>
          </Popup>
        </Marker>

        {/* Dropoff Marker */}
        {dropoffCoords?.lat && dropoffCoords?.lng && (
          <Marker position={[dropoffCoords.lat, dropoffCoords.lng]} icon={destIcon}>
            <Popup>
              <div style={{ color: '#0E131F', fontWeight: 'bold', fontSize: '12px' }}>🏁 Destination</div>
            </Popup>
          </Marker>
        )}

        {/* Road-following Route Polyline (OSRM) */}
        {routeCoords && (
          <Polyline 
            positions={routeCoords}
            color="#FFD428"
            weight={5}
            opacity={0.92}
          />
        )}

        {/* Active Taxi Drivers */}
        {Object.entries(drivers).map(([id, loc]) => (
          <Marker key={id} position={[loc.lat, loc.lng]} icon={createTaxiIcon(loc.name)}>
            <Popup>
              <div style={{ color: '#0E131F', fontSize: '12px' }}>
                <strong style={{ display: 'block', color: '#0E131F' }}>🚕 {loc.name || 'Abuja Driver'}</strong>
                <span style={{ color: '#10B981', fontWeight: '600' }}>● Online &amp; Ready</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Current Location Floating Button */}
      <button
        onClick={handleGetCurrentLocation}
        title="Move to current location"
        style={{
          position: 'absolute',
          right: '16px',
          bottom: isBooking ? '380px' : '230px',
          zIndex: 100,
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(14, 19, 31, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(255, 212, 40, 0.4)',
          color: isLocating ? '#10B981' : 'var(--aber-yellow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <LocateFixed size={20} className={isLocating ? 'spin' : ''} />
      </button>

      {/* Route Info Chip — distance & ETA */}
      {routeInfo && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(14, 19, 31, 0.90)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 212, 40, 0.4)',
          borderRadius: '24px',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          fontSize: '13px',
          fontWeight: '700',
          color: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}>
          <span>🛣️ <span style={{ color: '#FFD428' }}>{routeInfo.distance_km} km</span></span>
          <span style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
          <span>⏱ <span style={{ color: '#10B981' }}>~{routeInfo.duration_min} min</span></span>
        </div>
      )}

      {/* Routing calculation spinner */}
      {routeLoading && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(14, 19, 31, 0.90)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 212, 40, 0.25)',
          borderRadius: '24px',
          padding: '8px 20px',
          fontSize: '12px',
          fontWeight: '600',
          color: '#FFD428',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          pointerEvents: 'none'
        }}>
          🗺️ Calculating road route…
        </div>
      )}
    </div>
  );
};

export default LiveMap;

