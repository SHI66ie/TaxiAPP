// InDrive-Style Fare Bidding & Negotiation Engine
import { getDrivers, findNearbyDrivers } from './dispatchService.js';

let activeBids = [
  {
    id: 'bid_1001',
    passengerName: 'Kemi Olusola',
    passengerPhone: '+234 803 777 4411',
    pickupLocation: 'Jabi Lake Mall, Abuja',
    dropoffLocation: 'Maitama District Hospital',
    pickupCoords: { lat: 9.0782, lng: 7.4253 },
    dropoffCoords: { lat: 9.0800, lng: 7.4900 },
    vehicleType: 'standard',
    passengerOfferedPrice: 2000,
    estimatedBasePrice: 2400,
    status: 'OPEN',
    counterOffers: [
      {
        driverId: 'drv_101',
        driverName: 'Ibrahim Danladi',
        driverRating: 4.9,
        driverVehicle: 'Toyota Corolla 2018',
        etaMinutes: 4,
        counterPrice: 2300,
        createdAt: new Date().toISOString()
      },
      {
        driverId: 'drv_102',
        driverName: 'Chidi Okonkwo',
        driverRating: 4.85,
        driverVehicle: 'Honda Accord 2017',
        etaMinutes: 7,
        counterPrice: 2100,
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  }
];

export function getActiveBids() {
  return activeBids;
}

export function createBidRequest(bidData) {
  const newBid = {
    id: `bid_${Date.now().toString().slice(-5)}`,
    passengerName: bidData.passengerName || 'Abuja Commuter',
    passengerPhone: bidData.passengerPhone || '+234 800 000 0000',
    pickupLocation: bidData.pickupLocation,
    dropoffLocation: bidData.dropoffLocation,
    pickupCoords: bidData.pickupCoords || { lat: 9.0782, lng: 7.4253 },
    dropoffCoords: bidData.dropoffCoords || { lat: 9.0800, lng: 7.4900 },
    vehicleType: bidData.vehicleType || 'standard',
    passengerOfferedPrice: Number(bidData.passengerOfferedPrice) || 1800,
    estimatedBasePrice: Number(bidData.estimatedBasePrice) || 2200,
    status: 'OPEN',
    counterOffers: [],
    createdAt: new Date().toISOString()
  };

  const nearby = findNearbyDrivers(newBid.pickupCoords, newBid.vehicleType, 12);
  const driverList = nearby.length > 0 ? nearby : getDrivers();

  driverList.slice(0, 3).forEach((driver, idx) => {
    const margin = (idx + 1) * 150;
    const counterPrice = Math.ceil((newBid.passengerOfferedPrice + margin) / 50) * 50;
    newBid.counterOffers.push({
      driverId: driver.id,
      driverName: driver.name,
      driverRating: driver.rating,
      driverVehicle: driver.vehicle,
      etaMinutes: 3 + idx * 2,
      counterPrice: counterPrice,
      createdAt: new Date().toISOString()
    });
  });

  activeBids.unshift(newBid);
  return newBid;
}

export function submitDriverCounterOffer(bidId, { driverId, counterPrice }) {
  const bid = activeBids.find(b => b.id === bidId);
  if (!bid) throw new Error('Bid request not found');

  const drivers = getDrivers();
  const driver = drivers.find(d => d.id === driverId) || drivers[0];

  const existingOffer = bid.counterOffers.find(o => o.driverId === driver.id);
  if (existingOffer) {
    existingOffer.counterPrice = Number(counterPrice);
    existingOffer.createdAt = new Date().toISOString();
  } else {
    bid.counterOffers.push({
      driverId: driver.id,
      driverName: driver.name,
      driverRating: driver.rating,
      driverVehicle: driver.vehicle,
      etaMinutes: 5,
      counterPrice: Number(counterPrice),
      createdAt: new Date().toISOString()
    });
  }

  return bid;
}

export function acceptDriverBid(bidId, driverId) {
  const bid = activeBids.find(b => b.id === bidId);
  if (!bid) throw new Error('Bid request not found');

  const acceptedOffer = bid.counterOffers.find(o => o.driverId === driverId) || bid.counterOffers[0];
  bid.status = 'ACCEPTED';
  bid.acceptedOffer = acceptedOffer;

  return {
    bid,
    assignedDriver: {
      id: acceptedOffer.driverId,
      name: acceptedOffer.driverName,
      vehicle: acceptedOffer.driverVehicle,
      rating: acceptedOffer.driverRating
    },
    finalAgreedFare: acceptedOffer.counterPrice
  };
}
