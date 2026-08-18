import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Navigation, Crosshair, Share2, Check, Copy } from 'lucide-react';

// Abuja city centre
const ABUJA_CENTER = { lng: 7.4898, lat: 9.0579 };
const DEFAULT_ZOOM = 11.5;

export default function LiveMap({ drivers = [], rides = [], onSimulateBooking }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [shareLink, setShareLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Initialise Mapbox once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    if (!token) {
      setMapError('Missing VITE_MAPBOX_ACCESS_TOKEN. Add it to admin-dashboard/.env');
      return;
    }

    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [ABUJA_CENTER.lng, ABUJA_CENTER.lat],
        zoom: DEFAULT_ZOOM,
        attributionControl: false
      });

      map.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: false }), 'top-right');
      map.current.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        'bottom-right'
      );

      map.current.on('load', () => {
        setMapReady(true);
      });

      map.current.on('error', (e) => {
        console.error('[Mapbox]', e);
        setMapError('Mapbox failed to load. Check your access token.');
      });
    } catch (err) {
      console.error(err);
      setMapError(err.message || 'Failed to initialise Mapbox');
    }

    return () => {
      // cleanup markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (userMarkerRef.current) userMarkerRef.current.remove();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [token]);

  // Sync driver + ride markers whenever data or map readiness changes
  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Driver markers
    drivers.forEach((drv) => {
      if (!drv.location?.lat || !drv.location?.lng) return;

      const isAvailable = drv.status === 'AVAILABLE';
      const color = isAvailable ? '#10b981' : '#f59e0b';

      const el = document.createElement('div');
      el.className = 'mapbox-driver-marker';
      el.innerHTML = `
        <div class="marker-pin" style="--marker-color: ${color}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
        </div>
        <div class="marker-label">${drv.name.split(' ')[0]} · ${drv.type}</div>
      `;

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([drv.location.lng, drv.location.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 18, className: 'mapbox-popup-dark' }).setHTML(`
            <strong>${drv.name}</strong><br/>
            ${drv.vehicle}<br/>
            <span style="color:${color}">${drv.status}</span> · ⭐ ${drv.rating}<br/>
            💰 ₦${(drv.walletBalance || 0).toLocaleString()}
          `)
        )
        .addTo(map.current);

      markersRef.current.push(marker);
    });

    // Active ride pickup markers
    rides
      .filter((r) => r.status === 'IN_PROGRESS' || r.status === 'MATCHED')
      .forEach((ride) => {
        if (!ride.pickupCoords?.lat) return;

        const el = document.createElement('div');
        el.className = 'mapbox-ride-marker';
        el.innerHTML = `<div class="ride-dot"></div>`;

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([ride.pickupCoords.lng, ride.pickupCoords.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 12, className: 'mapbox-popup-dark' }).setHTML(`
              <strong>${ride.passengerName}</strong><br/>
              ${ride.pickupLocation} → ${ride.dropoffLocation}<br/>
              ₦${ride.fare?.toLocaleString() || '—'} ${ride.isCarpool ? '· Carpool' : ''}
            `)
          )
          .addTo(map.current);

        markersRef.current.push(marker);
      });
  }, [drivers, rides, mapReady]);

  // Handle Device Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setLocating(false);

        if (map.current) {
          map.current.flyTo({ center: [coords.lng, coords.lat], zoom: 14 });

          if (userMarkerRef.current) userMarkerRef.current.remove();

          const el = document.createElement('div');
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#06b6d4';
          el.style.border = '3px solid white';
          el.style.boxShadow = '0 0 15px #06b6d4';

          userMarkerRef.current = new mapboxgl.Marker({ element: el })
            .setLngLat([coords.lng, coords.lat])
            .setPopup(new mapboxgl.Popup().setHTML('<strong>📍 Your Live Device Location</strong>'))
            .addTo(map.current);
        }
      },
      (err) => {
        console.error(err);
        setLocating(false);
        // Fallback to Abuja central coordinate
        setUserLocation(ABUJA_CENTER);
        if (map.current) {
          map.current.flyTo({ center: [ABUJA_CENTER.lng, ABUJA_CENTER.lat], zoom: 13 });
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleShareTrip = async (rideId) => {
    try {
      const res = await fetch(`/api/location/share-link/${rideId || 'ride_901'}`);
      const data = await res.json();
      if (data.success) {
        setShareLink(data.data.shareUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div>
          <h2>🗺️ Live Abuja Fleet Tracking & GPS Radar</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Real-time Mapbox GPS & socket location telemetry across Maitama, Wuse II, Gwarinpa, CBD & Airport Express
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleGetLocation} disabled={locating}>
            <Crosshair size={16} /> {locating ? 'Locating...' : 'My Live Location'}
          </button>
          <button className="btn btn-secondary" onClick={() => handleShareTrip(rides[0]?.id)}>
            <Share2 size={16} /> Share Live Trip
          </button>
          <button className="btn btn-primary" onClick={onSimulateBooking}>
            <Navigation size={16} /> Simulate Passenger Booking
          </button>
        </div>
      </div>

      {shareLink && (
        <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', marginBottom: '1rem', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.85rem' }}>
            <strong>🔗 Shareable Live Safety Tracking Link:</strong> <span style={{ color: 'var(--accent-cyan)' }}>{shareLink}</span>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={copyToClipboard}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}

      <div className="map-container mapbox-live">
        {mapError && (
          <div className="map-fallback">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
            <strong>Mapbox not ready</strong>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem', maxWidth: 320 }}>
              {mapError}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
              Get a free token at mapbox.com → Account → Access tokens
            </p>
          </div>
        )}
        <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Driver Cards Grid */}
      <h3 style={{ marginBottom: '1rem', marginTop: '1.5rem' }}>🚕 Verified Fleet Drivers ({drivers.length})</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}
      >
        {drivers.map((driver) => (
          <div
            key={driver.id}
            className="glass-panel"
            style={{ padding: '1rem', background: 'rgba(15, 20, 32, 0.5)' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}
            >
              <strong style={{ fontSize: '1rem' }}>{driver.name}</strong>
              <span
                className={`badge ${
                  driver.status === 'AVAILABLE' ? 'badge-success' : 'badge-warning'
                }`}
              >
                {driver.status}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              🚗 {driver.vehicle}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem'
              }}
            >
              <span>
                ⭐ {driver.rating} ({driver.tripsCompleted} trips)
              </span>
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                ₦{(driver.walletBalance || 0).toLocaleString()} Earned
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

