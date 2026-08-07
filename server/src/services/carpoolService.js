// Carpool Split-Fare & Route Overlap Matching Engine
import { calculateDistance, calculateFare } from './fareService.js';

/**
 * Calculates overlap percentage between two passenger pickup-dropoff vectors
 */
export function calculateRouteOverlap(trip1, trip2) {
  // Distance between Passenger 1 pickup and Passenger 2 pickup
  const pickupDistance = calculateDistance(
    trip1.pickupCoords.lat, trip1.pickupCoords.lng,
    trip2.pickupCoords.lat, trip2.pickupCoords.lng
  );

  // Distance between Passenger 1 dropoff and Passenger 2 dropoff
  const dropoffDistance = calculateDistance(
    trip1.dropoffCoords.lat, trip1.dropoffCoords.lng,
    trip2.dropoffCoords.lat, trip2.dropoffCoords.lng
  );

  // Total individual trip lengths
  const len1 = calculateDistance(trip1.pickupCoords.lat, trip1.pickupCoords.lng, trip1.dropoffCoords.lat, trip1.dropoffCoords.lng);
  const len2 = calculateDistance(trip2.pickupCoords.lat, trip2.pickupCoords.lng, trip2.dropoffCoords.lat, trip2.dropoffCoords.lng);
  const avgLen = (len1 + len2) / 2 || 5;

  // Overlap score (0 to 100%). Close pickups & close dropoffs relative to route length = high overlap
  const deviationKm = (pickupDistance + dropoffDistance) / 2;
  const rawOverlap = Math.max(0, 1 - (deviationKm / (avgLen * 0.75)));
  const overlapPercentage = Math.round(rawOverlap * 100);

  return {
    pickupDistanceKm: pickupDistance,
    dropoffDistanceKm: dropoffDistance,
    overlapPercentage,
    isCompatible: overlapPercentage >= 40 // Eligible for carpooling if overlap >= 40%
  };
}

/**
 * Computes split-fare breakdown for Carpooling
 * Passenger A and Passenger B both get 35% - 40% discount, while Driver earns 20-30% more than a single ride!
 */
export function computeCarpoolSplit(trip1, trip2) {
  const fare1 = calculateFare(trip1);
  const fare2 = calculateFare(trip2);

  const totalSoloFare = fare1.estimatedFare + fare2.estimatedFare;
  const overlap = calculateRouteOverlap(trip1, trip2);

  // Discount factor depends on overlap
  const discountRate = Math.min(0.40, 0.25 + (overlap.overlapPercentage / 100) * 0.15); // 25% - 40% discount

  const carpoolFare1 = Math.ceil((fare1.estimatedFare * (1 - discountRate)) / 50) * 50;
  const carpoolFare2 = Math.ceil((fare2.estimatedFare * (1 - discountRate)) / 50) * 50;

  const totalSharedFareCollected = carpoolFare1 + carpoolFare2;
  const driverPayout = Math.round(totalSharedFareCollected * 0.85); // 85% driver, 15% platform commission

  return {
    overlapScore: overlap.overlapPercentage,
    isCompatible: overlap.isCompatible,
    passenger1: {
      originalFare: fare1.estimatedFare,
      carpoolFare: carpoolFare1,
      savingsNGN: fare1.estimatedFare - carpoolFare1,
      discountPercent: Math.round(discountRate * 100)
    },
    passenger2: {
      originalFare: fare2.estimatedFare,
      carpoolFare: carpoolFare2,
      savingsNGN: fare2.estimatedFare - carpoolFare2,
      discountPercent: Math.round(discountRate * 100)
    },
    combinedSummary: {
      totalSoloFare,
      totalSharedFareCollected,
      driverEarnings: driverPayout,
      platformFee: totalSharedFareCollected - driverPayout
    }
  };
}
