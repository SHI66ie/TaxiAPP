import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

// Component to recenter map when location changes
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const LiveMap = ({ isBooking }) => {
  const [userLoc, setUserLoc] = useState([9.0765, 7.3986]); // Default Abuja
  const [drivers, setDrivers] = useState({});

  useEffect(() => {
    // Get user's actual location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.log('Geolocation error:', err),
        { enableHighAccuracy: true }
      );
    }

    // Listen for driver locations
    socket.on('driver_location_update', (data) => {
      setDrivers(prev => ({
        ...prev,
        [data.driverId]: data.location
      }));
    });

    return () => {
      socket.off('driver_location_update');
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
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />
        <RecenterMap center={userLoc} />
        
        {/* User Marker */}
        <Marker position={userLoc}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Driver Markers */}
        {Object.entries(drivers).map(([id, loc]) => (
          <Marker key={id} position={[loc.lat, loc.lng]} icon={carIcon} />
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
