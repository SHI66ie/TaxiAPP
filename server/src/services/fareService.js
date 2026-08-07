// Fare Matrix Service for Abuja Ride-Hailing
import { ABUJA_ZONES, VEHICLE_TYPES } from '../data/mockStore.js';

/**
 * Calculates distance in kilometers between two coordinates using Haversine Formula
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculates single-rider fare for a trip in Abuja NGN (₦)
 */
export function calculateFare({ pickupCoords, dropoffCoords, vehicleType = 'standard', isAirport = false }) {
  const distKm = calculateDistance(
    pickupCoords.lat,
    pickupCoords.lng,
    dropoffCoords.lat,
    dropoffCoords.lng
  ) || 3.5; // fallback min distance

  const vType = VEHICLE_TYPES[vehicleType.toUpperCase()] || VEHICLE_TYPES.STANDARD;
  
  let baseFare = 750;
  let perKm = 240;

  // Airport corridor special tariff
  if (isAirport || distKm > 20) {
    baseFare = 2200;
    perKm = 280;
  }

  const rawFare = (baseFare + (distKm * perKm)) * vType.multiplier;
  // Round to nearest 50 NGN for cash convenience in Nigeria
  const roundedFare = Math.ceil(rawFare / 50) * 50;

  return {
    distanceKm: distKm,
    baseFare,
    perKmRate: perKm,
    vehicleType: vType.name,
    estimatedFare: Math.max(roundedFare, 1000) // Minimum trip fare ₦1,000
  };
}
