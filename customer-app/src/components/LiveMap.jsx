import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { socket } from '../App';

// Fix for default Leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Car Icon for drivers
const carIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3204/3204121.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Destination pin icon
const destIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Component to recenter map when location changes
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
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
      .catch(err => console.error(err));

    // Listen for driver location updates from socket
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
        zoom={13} 
        zoomControl={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />
        <RecenterMap center={userLoc} />
        
        {/* User / Pickup Marker */}
        <Marker position={userLoc}>
          <Popup>
            <div style={{ color: '#000', fontWeight: 'bold' }}>Pickup Point (You)</div>
          </Popup>
        </Marker>

        {/* Dropoff Marker if selected */}
        {dropoffCoords?.lat && dropoffCoords?.lng && (
          <Marker position={[dropoffCoords.lat, dropoffCoords.lng]} icon={destIcon}>
            <Popup>
              <div style={{ color: '#000', fontWeight: 'bold' }}>Destination</div>
            </Popup>
          </Marker>
        )}

        {/* Route Line */}
        {routePositions && (
          <Polyline 
            positions={routePositions} 
            color="#10b981" 
            weight={4} 
            opacity={0.8} 
            dashArray="8, 8" 
          />
        )}

        {/* Driver Markers */}
        {Object.entries(drivers).map(([id, loc]) => (
          <Marker key={id} position={[loc.lat, loc.lng]} icon={carIcon}>
            <Popup>
              <div style={{ color: '#000' }}>
                <strong>{loc.name || 'Abuja Driver'}</strong><br />
                Status: Active
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
