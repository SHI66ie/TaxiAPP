import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { socket } from '../App';

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

const LiveMap = ({ pickupCoords, dropoffCoords, isBooking }) => {
  const [userLoc, setUserLoc] = useState([9.05785, 7.49508]); // Default Wuse II, Abuja
  const [drivers, setDrivers] = useState({
    drv_101: { lat: 9.05785, lng: 7.49508, name: 'Ibrahim (Corolla)' },
    drv_102: { lat: 9.07648, lng: 7.39857, name: 'Chidi (Accord)' },
    drv_103: { lat: 9.03333, lng: 7.48333, name: 'Musa (Okada)' }
  });

  useEffect(() => {
    if (pickupCoords?.lat && pickupCoords?.lng) {
      setUserLoc([pickupCoords.lat, pickupCoords.lng]);
    }
  }, [pickupCoords]);

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

  const routePositions = pickupCoords && dropoffCoords ? [
    [pickupCoords.lat, pickupCoords.lng],
    [dropoffCoords.lat, dropoffCoords.lng]
  ] : null;

  return (
    <div style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
      <MapContainer 
        center={userLoc} 
        zoom={14} 
        zoomControl={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />
        <RecenterMap center={userLoc} />
        
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

        {/* Aber Yellow Route Line */}
        {routePositions && (
          <Polyline 
            positions={routePositions} 
            color="#FFD428" 
            weight={4} 
            opacity={0.9} 
            dashArray="10, 8" 
          />
        )}

        {/* Active Taxi Drivers */}
        {Object.entries(drivers).map(([id, loc]) => (
          <Marker key={id} position={[loc.lat, loc.lng]} icon={createTaxiIcon(loc.name)}>
            <Popup>
              <div style={{ color: '#0E131F', fontSize: '12px' }}>
                <strong style={{ display: 'block', color: '#0E131F' }}>🚕 {loc.name || 'Abuja Driver'}</strong>
                <span style={{ color: '#10B981', fontWeight: '600' }}>● Online & Ready</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveMap;

