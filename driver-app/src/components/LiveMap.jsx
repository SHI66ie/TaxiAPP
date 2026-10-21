import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Road routing via OSRM (free, road-accurate)
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
    const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const distance_km = (route.distance / 1000).toFixed(1);
    const duration_min = Math.ceil(route.duration / 60);
    return { coordinates, distance_km, duration_min };
  } catch (err) {
    console.error('OSRM route fetch error:', err);
    return null;
  }
}

// Custom Driver Car DivIcon
const driverCarIcon = L.divIcon({
  className: 'custom-driver-marker',
  html: `
    <div style="
      width: 40px;
      height: 40px;
      background: #10B981;
      border-radius: 50%;
      border: 3px solid #0E131F;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    ">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E131F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.7 2 10.8 2 11v5c0 .6.4 1 1 1h2"/>
        <circle cx="7" cy="17" r="2"/>
        <path d="M9 17h6"/>
        <circle cx="17" cy="17" r="2"/>
      </svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Custom Pickup Icon
const pickupIcon = L.divIcon({
  className: 'custom-pickup-marker',
  html: `
    <div style="
      width: 26px;
      height: 26px;
      background: #FFD428;
      border: 3px solid #0E131F;
      border-radius: 50%;
      box-shadow: 0 0 0 6px rgba(255, 212, 40, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 8px; height: 8px; border-radius: 50%; background: #0E131F;"></div>
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

// Custom Dropoff Icon
const dropoffIcon = L.divIcon({
  className: 'custom-dropoff-marker',
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
      <div style="width: 10px; height: 10px; background: #FFFFFF; border-radius: 50%; transform: rotate(45deg);"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// Recenter Map Hook
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
};

// Auto-fit route bounds
const FitRouteBounds = ({ coordinates }) => {
  const map = useMap();
  useEffect(() => {
    if (coordinates && coordinates.length >= 2) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50], animate: true, maxZoom: 16 });
    }
  }, [coordinates, map]);
  return null;
};

const LiveMap = ({ driverLocation, surgeZones = [], rideLocations = null }) => {
  const [routeCoords, setRouteCoords] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const center = driverLocation ? [driverLocation.lat, driverLocation.lng] : [9.0765, 7.3986];

  // Fetch road route if rideLocations provided
  useEffect(() => {
    if (rideLocations?.pickup && rideLocations?.dropoff) {
      fetchOSRMRoute(rideLocations.pickup, rideLocations.dropoff).then((res) => {
        if (res) {
          setRouteCoords(res.coordinates);
          setRouteInfo({ distance_km: res.distance_km, duration_min: res.duration_min });
        } else {
          setRouteCoords([
            [rideLocations.pickup.lat, rideLocations.pickup.lng],
            [rideLocations.dropoff.lat, rideLocations.dropoff.lng]
          ]);
        }
      });
    } else {
      setRouteCoords(null);
      setRouteInfo(null);
    }
  }, [rideLocations]);

  return (
    <div style={{ height: '320px', width: '100%', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <MapContainer 
        center={center} 
        zoom={14} 
        zoomControl={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {!routeCoords && <RecenterMap center={center} />}
        {routeCoords && <FitRouteBounds coordinates={routeCoords} />}

        {/* Driver Location Marker */}
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverCarIcon}>
            <Popup>
              <div style={{ color: '#0E131F', fontWeight: 'bold', fontSize: '12px' }}>
                🚕 Your Vehicle Location
              </div>
            </Popup>
          </Marker>
        )}

        {/* Surge Zone Indicators */}
        {surgeZones.map((zone, idx) => (
          <Circle
            key={idx}
            center={[zone.lat || 9.0765, zone.lng || 7.3986]}
            radius={zone.radius || 1200}
            pathOptions={{
              color: zone.multiplier > 1.4 ? '#EF4444' : '#F59E0B',
              fillColor: zone.multiplier > 1.4 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)',
              fillOpacity: 0.5,
              weight: 2
            }}
          >
            <Popup>
              <div style={{ color: '#0E131F', fontSize: '12px' }}>
                <strong style={{ display: 'block' }}>⚡ {zone.name}</strong>
                <span>Surge Multiplier: {zone.multiplier}x</span>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Ride Pickup/Dropoff Markers & Route */}
        {rideLocations && (
          <>
            {rideLocations.pickup && (
              <Marker position={[rideLocations.pickup.lat, rideLocations.pickup.lng]} icon={pickupIcon}>
                <Popup>
                  <div style={{ color: '#0E131F', fontSize: '12px' }}>
                    <strong>📍 Pickup</strong><br />{rideLocations.pickupAddress}
                  </div>
                </Popup>
              </Marker>
            )}
            {rideLocations.dropoff && (
              <Marker position={[rideLocations.dropoff.lat, rideLocations.dropoff.lng]} icon={dropoffIcon}>
                <Popup>
                  <div style={{ color: '#0E131F', fontSize: '12px' }}>
                    <strong>🏁 Destination</strong><br />{rideLocations.dropoffAddress}
                  </div>
                </Popup>
              </Marker>
            )}
            {routeCoords && (
              <Polyline 
                positions={routeCoords}
                color="#FFD428"
                weight={5}
                opacity={0.9}
              />
            )}
          </>
        )}
      </MapContainer>

      {/* Route Info Badge for Driver */}
      {routeInfo && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(14, 19, 31, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 212, 40, 0.4)',
          borderRadius: '20px',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          fontWeight: '700',
          color: '#FFFFFF',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          whiteSpace: 'nowrap'
        }}>
          <span>🛣️ <span style={{ color: '#FFD428' }}>{routeInfo.distance_km} km</span></span>
          <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.2)' }} />
          <span>⏱ <span style={{ color: '#10B981' }}>~{routeInfo.duration_min} min</span></span>
        </div>
      )}
    </div>
  );
};

export default LiveMap;
