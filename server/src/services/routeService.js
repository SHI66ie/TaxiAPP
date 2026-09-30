// Traffic-aware routing for driver → hailer (pickup) and hailer → destination.
// Prefers Mapbox Directions `driving-traffic` alternatives, then scores them
// for shortest distance + lowest congestion. Falls back to a Haversine path
// when no Mapbox token is configured or the API is unreachable.

import { calculateDistance } from './fareService.js';

const MAPBOX_TOKEN =
  process.env.MAPBOX_ACCESS_TOKEN ||
  process.env.VITE_MAPBOX_ACCESS_TOKEN ||
  '';

const URBAN_MPS = 8.33; // ~30 km/h used to convert metres → time in the score

function round1(n) {
  return Math.round(n * 10) / 10;
}

function toLatLng(coordPair) {
  return { lat: coordPair[1], lng: coordPair[0] };
}

function congestionSummary(congestion = []) {
  const counts = { low: 0, moderate: 0, heavy: 0, severe: 0, unknown: 0 };
  congestion.forEach((level) => {
    const key = counts[level] !== undefined ? level : 'unknown';
    counts[key] += 1;
  });
  const total = congestion.length || 1;
  const heavyShare = (counts.heavy + counts.severe) / total;
  let label = 'light';
  if (heavyShare >= 0.35) label = 'heavy';
  else if (heavyShare >= 0.15 || counts.moderate / total >= 0.4) label = 'moderate';
  return { ...counts, heavyShare: round1(heavyShare * 100) / 100, label };
}

function scoreCandidate(route) {
  const durationSec = route.duration || 0;
  const distanceM = route.distance || 0;
  const congestion = route.legs?.flatMap((leg) => leg.annotation?.congestion || []) || [];
  const summary = congestionSummary(congestion);
  // Weighted: live travel time (traffic) + physical length + congestion penalty.
  const score =
    durationSec * 0.55 +
    (distanceM / URBAN_MPS) * 0.3 +
    summary.heavyShare * 900 * 0.15;
  return { score, congestion: summary };
}

function shapeRoute(route, source) {
  const coords =
    route.geometry?.coordinates?.map(toLatLng) ||
    route.points ||
    [];
  const { score, congestion } = source === 'mapbox'
    ? scoreCandidate(route)
    : { score: route.duration || 0, congestion: { label: 'unknown', heavyShare: 0 } };

  return {
    source,
    profile: source === 'mapbox' ? 'mapbox/driving-traffic' : 'fallback-haversine',
    distanceKm: round1((route.distance || 0) / 1000),
    durationSec: Math.round(route.duration || 0),
    durationMin: Math.max(1, Math.round((route.duration || 0) / 60)),
    congestion,
    score: round1(score),
    points: coords
  };
}

function fallbackRoute(origin, destination) {
  const distanceKm = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng) || 1;
  const durationSec = Math.round((distanceKm * 1000) / URBAN_MPS);
  const steps = 8;
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    // Slight curve so the polyline is not a perfectly straight crow-fly line.
    const wobble = Math.sin(t * Math.PI) * 0.002;
    points.push({
      lat: origin.lat + (destination.lat - origin.lat) * t + wobble,
      lng: origin.lng + (destination.lng - origin.lng) * t + wobble * 0.6
    });
  }
  return shapeRoute(
    { distance: distanceKm * 1000, duration: durationSec, points },
    'fallback'
  );
}

async function fetchMapboxBestRoute(origin, destination, token) {
  const path = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const params = new URLSearchParams({
    alternatives: 'true',
    geometries: 'geojson',
    overview: 'full',
    annotations: 'congestion,duration,distance',
    steps: 'false',
    access_token: token
  });
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${path}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Mapbox Directions ${res.status}: ${body.slice(0, 180)}`);
  }
  const data = await res.json();
  if (!data.routes?.length) {
    throw new Error('Mapbox returned no routes');
  }

  const ranked = data.routes
    .map((route) => shapeRoute(route, 'mapbox'))
    .sort((a, b) => a.score - b.score);

  const best = ranked[0];
  best.alternatives = ranked.slice(1, 3).map((alt) => ({
    distanceKm: alt.distanceKm,
    durationMin: alt.durationMin,
    congestion: alt.congestion?.label,
    score: alt.score
  }));
  return best;
}

/**
 * Best single-leg route between two points.
 */
export async function getBestRoute(origin, destination) {
  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
    return null;
  }
  if (MAPBOX_TOKEN) {
    try {
      return await fetchMapboxBestRoute(origin, destination, MAPBOX_TOKEN);
    } catch (err) {
      console.warn('[routeService] Mapbox failed, using fallback:', err.message);
    }
  }
  return fallbackRoute(origin, destination);
}

/**
 * Two-leg trip used by drivers:
 *   1. driver current location → hailer pickup
 *   2. hailer pickup → passenger destination
 */
export async function buildDriverTripRoutes({ driverCoords, pickupCoords, dropoffCoords }) {
  const [toPickup, toDestination] = await Promise.all([
    driverCoords && pickupCoords ? getBestRoute(driverCoords, pickupCoords) : Promise.resolve(null),
    pickupCoords && dropoffCoords ? getBestRoute(pickupCoords, dropoffCoords) : Promise.resolve(null)
  ]);

  const distanceKm = round1((toPickup?.distanceKm || 0) + (toDestination?.distanceKm || 0));
  const durationSec = (toPickup?.durationSec || 0) + (toDestination?.durationSec || 0);

  return {
    profile: MAPBOX_TOKEN ? 'mapbox/driving-traffic' : 'fallback-haversine',
    selection: 'shortest distance + lowest live traffic',
    providerConfigured: Boolean(MAPBOX_TOKEN),
    toPickup,
    toDestination,
    totals: {
      distanceKm,
      durationSec,
      durationMin: Math.max(1, Math.round(durationSec / 60))
    }
  };
}

export function hasMapboxToken() {
  return Boolean(MAPBOX_TOKEN);
}
