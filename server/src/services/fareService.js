// Fare Matrix Service for Abuja Ride-Hailing (Bolt & Uber Integrated)
import { ABUJA_ZONES, VEHICLE_TYPES } from '../data/mockStore.js';
import { getSurgeMultiplierForCoords } from './surgeService.js';

export const BOLT_FLEET_CATEGORIES = {
  LITE: { id: 'lite', name: 'Bolt Lite (Economy)', multiplier: 0.85, etaBonus: 2 },
  STANDARD: { id: 'standard', name: 'Bolt Standard', multiplier: 1.0, etaBonus: 0 },
  COMFORT: { id: 'comfort', name: 'Bolt Comfort Executive', multiplier: 1.35, etaBonus: -1 },
  GREEN: { id: 'green', name: 'Bolt Green (Electric / Hybrid)', multiplier: 1.1, etaBonus: 1 },
  CARPOOL: { id: 'carpool', name: 'Bolt Carpool Split', multiplier: 0.65, etaBonus: 3 }
};

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
 * Calculates single-rider fare with Bolt categories & Uber surge pricing
 */
export function calculateFare({ pickupCoords, dropoffCoords, vehicleType = 'standard', isAirport = false, customSurge = null }) {
  const distKm = calculateDistance(
    pickupCoords.lat,
    pickupCoords.lng,
    dropoffCoords.lat,
    dropoffCoords.lng
  ) || 3.5;

  const fleetKey = (vehicleType || 'standard').toUpperCase();
  const fleetCategory = BOLT_FLEET_CATEGORIES[fleetKey] || BOLT_FLEET_CATEGORIES.STANDARD;

  let baseFare = 750;
  let perKm = 240;

  if (isAirport || distKm > 20) {
    baseFare = 2200;
    perKm = 280;
  }

  // Calculate Uber-style Dynamic Surge Multiplier
  const surgeMultiplier = customSurge || getSurgeMultiplierForCoords(pickupCoords.lat, pickupCoords.lng);

  const rawBaseFare = (baseFare + (distKm * perKm)) * fleetCategory.multiplier;
  const surgeFare = rawBaseFare * surgeMultiplier;
  const roundedFare = Math.ceil(surgeFare / 50) * 50;

  return {
    distanceKm: distKm,
    baseFare,
    perKmRate: perKm,
    fleetCategory: fleetCategory.name,
    fleetMultiplier: fleetCategory.multiplier,
    surgeMultiplier,
    isSurgeActive: surgeMultiplier > 1.0,
    estimatedFare: Math.max(roundedFare, 1000)
  };
}

