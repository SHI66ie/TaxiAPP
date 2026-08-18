// Live GPS Location Services, Reverse Geocoding & Trip Sharing
import { getDrivers, getRides } from './dispatchService.js';

export function updateDriverLocation(driverId, coords) {
  const drivers = getDrivers();
  const driver = drivers.find(d => d.id === driverId);
  if (driver) {
    driver.location = {
      ...driver.location,
      lat: coords.lat,
      lng: coords.lng,
      speed: coords.speed || 35, // km/h
      heading: coords.heading || 45, // degrees
      lastUpdated: new Date().toISOString()
    };
    return driver;
  }
  return null;
}

export function reverseGeocodeAbuja(lat, lng) {
  // Approximate Abuja landmarks based on lat/lng bounding box
  if (lat >= 9.075 && lng >= 7.485) return 'Maitama District, Abuja';
  if (lat >= 9.055 && lng >= 7.465) return 'Wuse II Commercial Zone, Abuja';
  if (lat >= 9.030 && lng >= 7.475) return 'Central Business District (CBD), Abuja';
  if (lat >= 9.070 && lng <= 7.420) return 'Jabi Lake & Shopping Mall, Abuja';
  if (lat >= 9.070 && lng <= 7.400) return 'Gwarinpa Estate, 3rd Avenue, Abuja';
  if (lat <= 9.010) return 'Nnamdi Azikiwe International Airport Road, Abuja';

  return `Abuja Metro (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

export function generateTripShareLink(rideId) {
  const rides = getRides();
  const ride = rides.find(r => r.id === rideId) || rides[0];
  
  return {
    rideId: ride ? ride.id : rideId,
    shareUrl: `https://abuja-taxi.app/track-live/${rideId || 'ride_901'}?token=${Date.now()}`,
    status: ride ? ride.status : 'IN_PROGRESS',
    passengerName: ride ? ride.passengerName : 'Abuja Commuter',
    driverName: ride ? ride.driverName : 'Assigned Driver',
    vehicle: ride ? ride.driverVehicle : 'Standard Sedan',
    qrCode: ride ? ride.qrCode : 'ABJ-QR-901-X7',
    currentCoords: ride ? ride.pickupCoords : { lat: 9.0620, lng: 7.4720 }
  };
}
