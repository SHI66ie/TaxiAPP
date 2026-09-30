import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { socket } from '../App';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const carIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3204/3204121.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684910.png',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const toLatLngs = (route) => {
  if (!route?.points?.length) return [];
  return route.points.map((p) => [p.lat, p.lng]);
};

const LiveMap = ({ driverLocation, surgeZones = [], rideLocations = null, routes = null }) => {
  const center = driverLocation ? [driverLocation.lat, driverLocation.lng] : [9.0765, 7.3986];
  const [fetchedRoutes, setFetchedRoutes] = useState(null);
  const activeRoutes = routes || fetchedRoutes;
  const toPickup = toLatLngs(activeRoutes?.toPickup);
  const toDestination = toLatLngs(activeRoutes?.toDestination);

  useEffect(() => {
    if (routes || !rideLocations?.pickup || !rideLocations?.dropoff) {
      if (!rideLocations) setFetchedRoutes(null);
      return undefined;
    }
    const controller = new AbortController();
    fetch('/api/routes/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        driverCoords: driverLocation || undefined,
        pickupCoords: rideLocations.pickup,
        dropoffCoords: rideLocations.dropoff
      })
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setFetchedRoutes(json.data);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('Route optimize err:', err);
      });
    return () => controller.abort();
  }, [routes, rideLocations, driverLocation]);

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
      <MapContainer center={center} zoom={14} zoomControl={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />
        <RecenterMap center={center} />
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={carIcon}>
            <Popup>Your current location</Popup>
          </Marker>
        )}
        {surgeZones.map((zone, idx) => (
          <Circle
            key={idx}
            center={[zone.lat || 9.0765, zone.lng || 7.3986]}
            radius={zone.radius || 1000}
            pathOptions={{
              color: zone.multiplier > 1.5 ? '#ef4444' : '#f59e0b',
              fillColor: zone.multiplier > 1.5 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)',
              fillOpacity: 0.5,
              weight: 2
            }}
          >
            <Popup>
              <div style={{ color: '#000' }}>
                <strong>{zone.name}</strong><br />
                Surge: {zone.multiplier}x
              </div>
            </Popup>
          </Circle>
        ))}
        {rideLocations && (
          <>
            {rideLocations.pickup && (
              <Marker position={[rideLocations.pickup.lat, rideLocations.pickup.lng]} icon={pickupIcon}>
                <Popup>Pickup: {rideLocations.pickupAddress}</Popup>
              </Marker>
            )}
            {rideLocations.dropoff && (
              <Marker position={[rideLocations.dropoff.lat, rideLocations.dropoff.lng]} icon={dropoffIcon}>
                <Popup>Dropoff: {rideLocations.dropoffAddress}</Popup>
              </Marker>
            )}
          </>
        )}
        {toPickup.length > 1 && (
          <Polyline positions={toPickup} pathOptions={{ color: '#38BDF8', weight: 5, opacity: 0.95 }} />
        )}
        {toDestination.length > 1 && (
          <Polyline positions={toDestination} pathOptions={{ color: '#FFD428', weight: 5, opacity: 0.95 }} />
        )}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
