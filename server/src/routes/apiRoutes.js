// REST API Router for Abuja Express Taxi & Carpool Backend
import express from 'express';
import { calculateFare } from '../services/fareService.js';
import { computeCarpoolSplit, calculateRouteOverlap } from '../services/carpoolService.js';
import {
  getDrivers,
  getRides,
  getKycDocs,
  findNearbyDrivers,
  bookRide,
  updateRideStatus,
  approveDriverKyc
} from '../services/dispatchService.js';

const router = express.Router();

// Fare Estimation
router.post('/fare/estimate', (req, res) => {
  try {
    const { pickupCoords, dropoffCoords, vehicleType, isAirport } = req.body;
    if (!pickupCoords || !dropoffCoords) {
      return res.status(400).json({ error: 'pickupCoords and dropoffCoords are required' });
    }
    const estimation = calculateFare({ pickupCoords, dropoffCoords, vehicleType, isAirport });
    res.json({ success: true, data: estimation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Carpool Split-Fare Match Check
router.post('/carpool/match-check', (req, res) => {
  try {
    const { trip1, trip2 } = req.body;
    if (!trip1 || !trip2) {
      return res.status(400).json({ error: 'trip1 and trip2 details are required' });
    }
    const splitResult = computeCarpoolSplit(trip1, trip2);
    res.json({ success: true, data: splitResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book a Ride
router.post('/rides/book', (req, res) => {
  try {
    const rideData = req.body;
    const booking = bookRide(rideData);
    
    // Broadcast via socket io if attached
    if (req.io) {
      req.io.emit('new_ride_dispatched', booking.ride);
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Rides (for Admin / Driver)
router.get('/rides', (req, res) => {
  res.json({ success: true, data: getRides() });
});

// Update Ride Status
router.patch('/rides/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = updateRideStatus(id, status);
    
    if (req.io) {
      req.io.emit('ride_status_updated', updated);
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Drivers
router.get('/drivers', (req, res) => {
  res.json({ success: true, data: getDrivers() });
});

// Get Driver KYC Queue
router.get('/drivers/kyc', (req, res) => {
  res.json({ success: true, data: getKycDocs() });
});

// Approve Driver KYC
router.post('/drivers/:id/approve-kyc', (req, res) => {
  try {
    const { id } = req.params;
    const result = approveDriverKyc(id);
    
    if (req.io) {
      req.io.emit('driver_kyc_approved', result);
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Paystack Payment Checkout Mock Initiation
router.post('/paystack/initialize', (req, res) => {
  const { amount, email, rideId } = req.body;
  res.json({
    success: true,
    data: {
      authorizationUrl: `https://checkout.paystack.com/mock-checkout-${Math.random().toString(36).substring(7)}`,
      accessCode: `acc_${Math.floor(100000 + Math.random() * 900000)}`,
      reference: `ABJ_PAY_${Date.now()}`
    }
  });
});

// Safety SOS Trigger Endpoint
router.post('/sos/trigger', (req, res) => {
  const { rideId, passengerName, coords } = req.body;
  const sosPayload = {
    rideId,
    passengerName: passengerName || 'Passenger',
    coords: coords || { lat: 9.0765, lng: 7.3985 },
    timestamp: new Date().toISOString(),
    status: 'ACTIVE_EMERGENCY',
    message: 'CRITICAL: Passenger activated SOS button in Abuja!'
  };

  if (req.io) {
    req.io.emit('emergency_sos_alert', sosPayload);
  }

  res.json({
    success: true,
    message: 'SOS Alert dispatched to Abuja Control Room & Emergency Contacts!',
    data: sosPayload
  });
});

export default router;
