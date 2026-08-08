// Driver Dispatch and Safety SOS Service
import { INITIAL_DRIVERS, INITIAL_RIDES, INITIAL_KYC_DOCS } from '../data/mockStore.js';
import { calculateDistance } from './fareService.js';
import { computeCarpoolSplit } from './carpoolService.js';

let drivers = [...INITIAL_DRIVERS];
let rides = [...INITIAL_RIDES];
let kycDocs = [...INITIAL_KYC_DOCS];
let pendingCarpoolRequests = [];

export function getDrivers() {
  return drivers;
}

export function getRides() {
  return rides;
}

export function getKycDocs() {
  return kycDocs;
}

export function findNearbyDrivers(pickupCoords, vehicleType = 'standard', radiusKm = 8) {
  return drivers.filter(driver => {
    if (driver.status !== 'AVAILABLE' || driver.kycStatus !== 'VERIFIED') return false;
    if (vehicleType && driver.type !== vehicleType && vehicleType !== 'standard') return false;
    
    const dist = calculateDistance(
      pickupCoords.lat, pickupCoords.lng,
      driver.location.lat, driver.location.lng
    );
    return dist <= radiusKm;
  }).sort((a, b) => {
    const distA = calculateDistance(pickupCoords.lat, pickupCoords.lng, a.location.lat, a.location.lng);
    const distB = calculateDistance(pickupCoords.lat, pickupCoords.lng, b.location.lat, b.location.lng);
    return distA - distB;
  });
}

export function bookRide(rideData) {
  if (rideData.isCarpool) {
    // Check pending queue for a match
    for (let i = 0; i < pendingCarpoolRequests.length; i++) {
      const waitingPartner = pendingCarpoolRequests[i];
      const splitResult = computeCarpoolSplit(waitingPartner, rideData);
      
      if (splitResult.isCompatible) {
        // Match found! Remove from queue
        pendingCarpoolRequests.splice(i, 1);
        
        // Find driver
        const nearby = findNearbyDrivers(rideData.pickupCoords, rideData.vehicleType);
        const assignedDriver = nearby[0] || drivers[0];
        
        const ride1 = createRideRecord(waitingPartner, splitResult.passenger1.carpoolFare, assignedDriver, rideData.passengerName || 'Matched Commuter');
        const ride2 = createRideRecord(rideData, splitResult.passenger2.carpoolFare, assignedDriver, waitingPartner.passengerName || 'Matched Commuter');
        
        rides.unshift(ride1, ride2);
        
        if (assignedDriver) {
          assignedDriver.status = 'BUSY';
        }
        
        return { 
          status: 'CARPOOL_MATCHED',
          rides: [ride1, ride2], 
          assignedDriver 
        };
      }
    }
    
    // No match found, add to queue
    const queueData = { ...rideData, id: `req_${Date.now().toString().slice(-4)}` };
    pendingCarpoolRequests.push(queueData);
    return { status: 'WAITING_FOR_MATCH', request: queueData };
  } else {
    // Solo ride
    const nearby = findNearbyDrivers(rideData.pickupCoords, rideData.vehicleType);
    const assignedDriver = nearby[0] || drivers[0];
    
    const newRide = createRideRecord(rideData, rideData.fare, assignedDriver, null);
    
    rides.unshift(newRide);
    if (assignedDriver) {
      assignedDriver.status = 'BUSY';
    }
    
    return { status: 'MATCHED', ride: newRide, assignedDriver };
  }
}

function createRideRecord(rideData, fare, assignedDriver, carpoolPartner) {
  return {
    id: rideData.id || `ride_${Date.now().toString().slice(-4)}_${Math.floor(Math.random()*100)}`,
    passengerName: rideData.passengerName || 'Abuja Commuter',
    passengerPhone: rideData.passengerPhone || '+234 800 000 0000',
    pickupLocation: rideData.pickupLocation,
    dropoffLocation: rideData.dropoffLocation,
    pickupCoords: rideData.pickupCoords,
    dropoffCoords: rideData.dropoffCoords,
    vehicleType: rideData.vehicleType || 'standard',
    isCarpool: !!rideData.isCarpool,
    carpoolPartner: carpoolPartner,
    status: 'MATCHED',
    fare: fare,
    originalFare: rideData.originalFare || rideData.fare,
    driverId: assignedDriver ? assignedDriver.id : null,
    driverName: assignedDriver ? assignedDriver.name : 'Pending Driver',
    driverPhone: assignedDriver ? assignedDriver.phone : '',
    driverVehicle: assignedDriver ? assignedDriver.vehicle : '',
    qrCode: `ABJ-QR-${Math.floor(1000 + Math.random() * 9000)}`,
    paymentMethod: rideData.paymentMethod || 'Paystack',
    createdAt: new Date().toISOString()
  };
}

export function updateRideStatus(rideId, status) {
  const ride = rides.find(r => r.id === rideId);
  if (ride) {
    ride.status = status;
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      const driver = drivers.find(d => d.id === ride.driverId);
      if (driver) {
        driver.status = 'AVAILABLE';
        if (status === 'COMPLETED') {
          driver.walletBalance += Math.round(ride.fare * 0.85);
          driver.tripsCompleted += 1;
        }
      }
    }
  }
  return ride;
}

export function approveDriverKyc(driverId) {
  const driver = drivers.find(d => d.id === driverId);
  const kyc = kycDocs.find(k => k.driverId === driverId);
  if (driver) {
    driver.kycStatus = 'VERIFIED';
    driver.status = 'AVAILABLE';
  }
  if (kyc) {
    kyc.status = 'APPROVED';
  }
  return { driver, kyc };
}
