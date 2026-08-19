// REST API Router for Abuja Express Taxi & Carpool Backend
import express from 'express';
import { calculateFare, BOLT_FLEET_CATEGORIES } from '../services/fareService.js';
import { computeCarpoolSplit, calculateRouteOverlap } from '../services/carpoolService.js';
import {
  getDrivers,
  getRides,
  getKycDocs,
  findNearbyDrivers,
  bookRide,
  updateRideStatus,
  approveDriverKyc,
  submitKyc
} from '../services/dispatchService.js';
import {
  getActiveBids,
  createBidRequest,
  submitDriverCounterOffer,
  acceptDriverBid
} from '../services/biddingService.js';
import {
  getSurgeZones,
  updateZoneDemand
} from '../services/surgeService.js';
import {
  updateDriverLocation,
  reverseGeocodeAbuja,
  generateTripShareLink
} from '../services/locationService.js';
import {
  getPaymentMethods,
  initializePayment,
  verifyPayment,
  getDriverWallets,
  requestDriverPayout,
  getPaymentHistory
} from '../services/paymentService.js';
import { registerUser, loginUser } from '../services/authService.js';

const router = express.Router();

// In-App Chat Messaging Store (in-memory) — must be outside any route handler
let chatMessages = [
  { id: 'msg_1', rideId: 'ride_101', sender: 'driver', text: 'Hello! I am on my way, 3 mins away.', time: '10:12 AM' },
  { id: 'msg_2', rideId: 'ride_101', sender: 'passenger', text: 'Great, I am waiting by the gate in Wuse II.', time: '10:13 AM' }
];

// Auth Endpoints
router.post('/auth/register', (req, res) => {
  try {
    const user = registerUser(req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = loginUser(email, password);
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
});

// Fare Estimation
router.post('/fare/estimate', (req, res) => {
  try {
    const { pickupCoords, dropoffCoords, vehicleType, isAirport, customSurge } = req.body;
    if (!pickupCoords || !dropoffCoords) {
      return res.status(400).json({ error: 'pickupCoords and dropoffCoords are required' });
    }
    const estimation = calculateFare({ pickupCoords, dropoffCoords, vehicleType, isAirport, customSurge });
    res.json({ success: true, data: estimation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bolt Fleet Categories Endpoint
router.get('/fleet/categories', (req, res) => {
  res.json({ success: true, data: BOLT_FLEET_CATEGORIES });
});

// InDrive Bidding Endpoints
router.get('/bidding', (req, res) => {
  res.json({ success: true, data: getActiveBids() });
});

router.post('/bidding/create', (req, res) => {
  try {
    const newBid = createBidRequest(req.body);
    if (req.io) {
      req.io.emit('new_bid_created', newBid);
    }
    res.json({ success: true, data: newBid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bidding/:id/counter', (req, res) => {
  try {
    const { id } = req.params;
    const { driverId, counterPrice } = req.body;
    const updatedBid = submitDriverCounterOffer(id, { driverId, counterPrice });
    if (req.io) {
      req.io.emit('driver_counter_offer_placed', updatedBid);
    }
    res.json({ success: true, data: updatedBid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bidding/:id/accept', (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;
    const result = acceptDriverBid(id, driverId);
    if (req.io) {
      req.io.emit('bid_accepted', result);
    }
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Uber Surge Endpoints
router.get('/surge/zones', (req, res) => {
  res.json({ success: true, data: getSurgeZones() });
});

router.post('/surge/zone/:id/update', (req, res) => {
  try {
    const { id } = req.params;
    const { demandDelta, driverDelta } = req.body;
    const updatedZone = updateZoneDemand(id, demandDelta, driverDelta);
    if (req.io) {
      req.io.emit('surge_updated', updatedZone);
    }
    res.json({ success: true, data: updatedZone });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Live Location Services Endpoints
router.post('/location/update', (req, res) => {
  try {
    const { driverId, coords } = req.body;
    const updated = updateDriverLocation(driverId, coords);
    if (req.io && updated) {
      req.io.emit('location_changed', updated);
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/location/reverse-geocode', (req, res) => {
  try {
    const { lat, lng } = req.body;
    const address = reverseGeocodeAbuja(lat, lng);
    res.json({ success: true, data: { address, lat, lng } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/location/share-link/:rideId', (req, res) => {
  try {
    const { rideId } = req.params;
    const shareData = generateTripShareLink(rideId);
    res.json({ success: true, data: shareData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Payments & Settlement Endpoints (Paystack, Flutterwave, NIBSS, Wallets)
router.get('/payments/methods', (req, res) => {
  res.json({ success: true, data: getPaymentMethods() });
});

router.get('/payments/history', (req, res) => {
  res.json({ success: true, data: getPaymentHistory() });
});

router.post('/payments/initialize', (req, res) => {
  try {
    const result = initializePayment(req.body);
    if (req.io) {
      req.io.emit('payment_initialized', result.transaction);
    }
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/payments/verify', (req, res) => {
  try {
    const { reference } = req.body;
    const verified = verifyPayment(reference);
    if (req.io) {
      req.io.emit('payment_verified', verified);
    }
    res.json({ success: true, data: verified });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/payments/wallets', (req, res) => {
  res.json({ success: true, data: getDriverWallets() });
});

router.post('/payments/payout', (req, res) => {
  try {
    const payout = requestDriverPayout(req.body);
    if (req.io) {
      req.io.emit('driver_payout_settled', payout);
    }
    res.json({ success: true, data: payout });
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
    
    if (req.io) {
      if (booking.status === 'CARPOOL_MATCHED') {
        req.io.emit('carpool_match_found', booking);
        req.io.emit('new_ride_dispatched', booking.rides[0]);
        req.io.emit('new_ride_dispatched', booking.rides[1]);
      } else if (booking.status === 'MATCHED') {
        req.io.emit('new_ride_dispatched', booking.ride);
      }
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

// Submit Driver KYC
router.post('/drivers/kyc/submit', (req, res) => {
  try {
    const { driverId, kycData } = req.body;
    const result = submitKyc(driverId, kycData);
    if (req.io) {
      req.io.emit('driver_kyc_submitted', result);
    }
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
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
  try {
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

    res.json({ success: true, data: sosPayload });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Chat Messages for a Ride
router.get('/messages/:rideId', (req, res) => {
  const { rideId } = req.params;
  const msgs = chatMessages.filter(m => m.rideId === rideId || m.rideId === 'ride_101');
  res.json({ success: true, data: msgs });
});

// Send Chat Message
router.post('/messages/send', (req, res) => {
  try {
    const { rideId, sender, text } = req.body;
    const newMsg = {
      id: `msg_${Date.now()}`,
      rideId: rideId || 'ride_101',
      sender: sender || 'passenger',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    chatMessages.push(newMsg);

    if (req.io) {
      req.io.emit('new_chat_message', newMsg);
    }
    res.json({ success: true, data: newMsg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rate & Tip Driver
router.post('/rides/:id/rate', (req, res) => {
  try {
    const { id } = req.params;
    const { rating, compliments, comment, tipAmount } = req.body;
    
    const rateData = {
      rideId: id,
      rating: rating || 5,
      compliments: compliments || [],
      comment: comment || '',
      tipAmount: tipAmount || 0,
      ratedAt: new Date().toISOString()
    };

    if (req.io) {
      req.io.emit('ride_rated', rateData);
    }

    res.json({ success: true, message: 'Rating & tip submitted successfully!', data: rateData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rate Passenger (Driver-to-Passenger)
router.post('/rides/:id/rate-passenger', (req, res) => {
  try {
    const { id } = req.params;
    const { rating, compliments, comment } = req.body;

    const rateData = {
      rideId: id,
      rating: rating || 5,
      compliments: compliments || [],
      comment: comment || '',
      ratedAt: new Date().toISOString()
    };

    if (req.io) {
      req.io.emit('passenger_rated', rateData);
    }

    res.json({ success: true, message: 'Passenger review submitted!', data: rateData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// In-App Notifications
router.get('/notifications', (req, res) => {
  const notifications = [
    {
      id: 'notif_1',
      title: '🎉 ₦2,000 Welcome Voucher',
      message: 'Use promo code ABUJA50 for ₦2,000 off your next commute in Abuja.',
      time: '10 mins ago',
      type: 'PROMO',
      read: false
    },
    {
      id: 'notif_2',
      title: '⚡ Surge Alert: CBD & Maitama',
      message: 'High commuter demand in Central Business District. 1.2x fares active.',
      time: '1 hour ago',
      type: 'SURGE',
      read: false
    },
    {
      id: 'notif_3',
      title: '🛡️ Safety Features Active',
      message: 'Emergency SOS is connected directly to FCT Command Center.',
      time: 'Yesterday',
      type: 'SAFETY',
      read: true
    }
  ];
  res.json({ success: true, data: notifications });
});

// Referral Code Validation
router.post('/referrals/claim', (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Referral code is required' });
  
  res.json({
    success: true,
    message: 'Referral code accepted! ₦1,000 credit added to your Abuja wallet.',
    bonusAmount: 1000
  });
});

export default router;
