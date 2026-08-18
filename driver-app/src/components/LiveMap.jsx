import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { socket } from '../App';

// Fix for default Leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Car Icon for driver
const carIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3204/3204121.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Custom Pickup Icon
const pickupIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Custom Dropoff Icon
const dropoffIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684910.png',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Component to recenter map when location changes
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const LiveMap = ({ driverLocation, surgeZones = [], rideLocations = null }) => {
  const center = driverLocation ? [driverLocation.lat, driverLocation.lng] : [9.0765, 7.3986];

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
      <MapContainer 
        center={center} 
        zoom={14} 
        zoomControl={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />
        <RecenterMap center={center} />
        
        {/* Driver Location Marker */}
        {driverLocation && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={carIcon}>
            <Popup>Your current location</Popup>
          </Marker>
        )}

        {/* Surge Zone Indicators */}
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

        {/* Ride Pickup/Dropoff Markers */}
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
      </MapContainer>
    </div>
  );
};

export default LiveMap;
