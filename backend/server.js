const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://taxi-abuja.netlify.app'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://taxi-abuja.netlify.app']
}));
app.use(express.json());

// ─── In-Memory Store ────────────────────────────────────────────────────────
const store = {
  drivers: [
    {
      id: 'drv_101',
      name: 'Ibrahim Danladi',
      phone: '+234 803 111 2233',
      email: 'ibrahim.danladi@taxiapp.ng',
      vehicleType: 'Toyota Corolla (Sedan)',
      plateNumber: 'ABJ-482-AA',
      licenseNumber: 'DRV-2024-ABJ-001',
      baseLocation: 'Wuse II, Abuja',
      rating: 4.9,
      totalTrips: 450,
      status: 'OFFLINE',
      location: { lat: 9.05785, lng: 7.49508, speed: 0, heading: 0 }
    },
    {
      id: 'drv_102',
      name: 'Chidi Okafor',
      phone: '+234 808 222 3344',
      email: 'chidi.okafor@taxiapp.ng',
      vehicleType: 'Honda Accord (Comfort)',
      plateNumber: 'ABJ-221-BB',
      licenseNumber: 'DRV-2024-ABJ-002',
      baseLocation: 'Gwarinpa Estate, Abuja',
      rating: 4.8,
      totalTrips: 312,
      status: 'AVAILABLE',
      location: { lat: 9.07648, lng: 7.39857, speed: 30, heading: 90 }
    },
    {
      id: 'drv_103',
      name: 'Samuel Musa',
      phone: '+234 812 333 4455',
      email: 'samuel.musa@taxiapp.ng',
      vehicleType: 'Toyota Sienna (Executive)',
      plateNumber: 'ABJ-700-CC',
      licenseNumber: 'DRV-2024-ABJ-003',
      baseLocation: 'Maitama District, Abuja',
      rating: 4.95,
      totalTrips: 628,
      status: 'AVAILABLE',
      location: { lat: 9.08, lng: 7.49, speed: 25, heading: 180 }
    }
  ],
  rides: [
    {
      id: 'ride_demo_001',
      passengerName: 'Amina Bello',
      passengerPhone: '+234 812 000 1111',
      pickupLocation: 'Wuse II (Aminu Kano Crescent)',
      dropoffLocation: 'Central Business District, Abuja',
      pickupCoords: { lat: 9.05785, lng: 7.49508 },
      dropoffCoords: { lat: 9.0500, lng: 7.4800 },
      vehicleType: 'standard',
      fare: 2500,
      originalFare: 2500,
      status: 'COMPLETED',
      driverId: 'drv_101',
      driverName: 'Ibrahim Danladi',
      vehicle: 'Toyota Corolla (ABJ-482-AA)',
      isCarpool: false,
      paymentMethod: 'Paystack',
      securityPin: '7392',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  bids: [],
  surgeZones: [
    { id: 'sz_01', name: 'Central Business District', lat: 9.0500, lng: 7.4800, radius: 1500, multiplier: 1.35 },
    { id: 'sz_02', name: 'Maitama District', lat: 9.0800, lng: 7.4900, radius: 1200, multiplier: 1.2 },
    { id: 'sz_03', name: 'Wuse II Corridor', lat: 9.05785, lng: 7.49508, radius: 900, multiplier: 1.0 }
  ],
  kyc: [
    { driverId: 'drv_101', status: 'APPROVED', submittedAt: '2024-01-10' },
    { driverId: 'drv_102', status: 'APPROVED', submittedAt: '2024-01-12' },
    { driverId: 'drv_103', status: 'APPROVED', submittedAt: '2024-01-15' }
  ],
  wallets: [
    { driverId: 'drv_101', balance: 24850, bankName: 'GTBank', bankAccount: '0011223344' },
    { driverId: 'drv_102', balance: 18200, bankName: 'Access Bank', bankAccount: '0055667788' },
    { driverId: 'drv_103', balance: 31500, bankName: 'First Bank', bankAccount: '0099887766' }
  ],
  paymentHistory: [
    { driverId: 'drv_101', type: 'credit', description: 'Trip Earning (CBD)', amount: 2500, rideId: 'ride_demo_001', status: 'completed', date: 'Today, 10:15 AM' },
    { driverId: 'drv_101', type: 'debit', description: 'Platform Commission (15%)', amount: 375, status: 'completed', date: 'Today, 10:16 AM' }
  ],
  messages: {},
  notifications: [
    { id: 'notif_01', type: 'PROMO', title: '₦2,000 Commute Voucher!', message: 'Use code ABUJA50 to claim your free ₦2,000 wallet credit. Valid for 7 days.', time: '2h ago', read: false },
    { id: 'notif_02', type: 'SURGE', title: 'Surge Pricing Active in CBD', message: 'High demand detected. Fares are 1.35x in the Central Business District right now.', time: '4h ago', read: false },
    { id: 'notif_03', type: 'SAFETY', title: 'New Safety Feature Enabled', message: 'Real-time Abuja SOS Dispatch is now active on your account. Stay safe!', time: 'Yesterday', read: true }
  ]
};

// ─── Helper ──────────────────────────────────────────────────────────────────
const respond = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data });

const respondError = (res, message, statusCode = 400) =>
  res.status(statusCode).json({ success: false, message });

const calcFare = (pickup, dropoff, vehicleType = 'standard') => {
  const R = 6371;
  const dLat = (dropoff.lat - pickup.lat) * Math.PI / 180;
  const dLng = (dropoff.lng - pickup.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(pickup.lat * Math.PI / 180) * Math.cos(dropoff.lat * Math.PI / 180) *
    Math.sin(dLng/2) ** 2;
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const baseRatePerKm = { lite: 150, standard: 200, comfort: 280, carpool: 120, okada: 100 };
  const rate = baseRatePerKm[vehicleType] || 200;
  const baseFare = 500;
  const fare = Math.round((baseFare + distance * rate) / 50) * 50;
  return Math.max(fare, 800);
};

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => respond(res, { status: 'ok', version: '1.0.0', platform: 'TaxiAPP Abuja' }));

// Drivers
app.get('/api/drivers', (req, res) => respond(res, store.drivers));
app.get('/api/drivers/kyc', (req, res) => respond(res, store.kyc));

app.post('/api/location/update', (req, res) => {
  const { driverId, coords } = req.body;
  if (!driverId || !coords) return respondError(res, 'driverId and coords required');
  const driver = store.drivers.find(d => d.id === driverId);
  if (!driver) return respondError(res, 'Driver not found', 404);
  driver.location = { ...driver.location, ...coords };
  if (coords.status) driver.status = coords.status;
  io.emit('location_changed', { ...driver });
  io.emit('driver_location_update', { driverId, location: driver.location, name: driver.name });
  respond(res, driver);
});

// Rides
app.get('/api/rides', (req, res) => respond(res, store.rides));

app.post('/api/rides/book', (req, res) => {
  const { passengerName, passengerPhone, pickupLocation, dropoffLocation, pickupCoords, dropoffCoords, vehicleType, isCarpool, fare, originalFare, paymentMethod } = req.body;
  if (!pickupLocation || !dropoffLocation) return respondError(res, 'Pickup and dropoff required');
  
  const finalFare = fare || calcFare(pickupCoords || { lat: 9.05785, lng: 7.49508 }, dropoffCoords || { lat: 9.0500, lng: 7.4800 }, vehicleType);
  const onlineDrivers = store.drivers.filter(d => d.status === 'AVAILABLE');
  const assignedDriver = onlineDrivers[Math.floor(Math.random() * onlineDrivers.length)] || store.drivers[0];

  const ride = {
    id: `ride_${uuidv4().slice(0, 8)}`,
    passengerName: passengerName || 'Rider',
    passengerPhone: passengerPhone || '+234 812 000 0000',
    pickupLocation,
    dropoffLocation,
    pickupCoords: pickupCoords || { lat: 9.05785, lng: 7.49508 },
    dropoffCoords: dropoffCoords || { lat: 9.0500, lng: 7.4800 },
    vehicleType: vehicleType || 'standard',
    fare: finalFare,
    originalFare: originalFare || finalFare,
    isCarpool: isCarpool || false,
    paymentMethod: paymentMethod || 'Paystack',
    status: 'MATCHED',
    driverId: assignedDriver?.id || 'drv_101',
    driverName: assignedDriver?.name || 'Ibrahim Danladi',
    vehicle: `${assignedDriver?.vehicleType || 'Toyota Corolla'} (${assignedDriver?.plateNumber || 'ABJ-482-AA'})`,
    securityPin: String(Math.floor(1000 + Math.random() * 9000)),
    createdAt: new Date().toISOString()
  };

  store.rides.push(ride);
  if (assignedDriver) assignedDriver.status = 'BUSY';

  io.emit('new_ride_dispatched', ride);
  respond(res, { ride });
});

app.patch('/api/rides/:rideId/status', (req, res) => {
  const { rideId } = req.params;
  const { status, driverId } = req.body;
  const ride = store.rides.find(r => r.id === rideId);
  if (!ride) return respondError(res, 'Ride not found', 404);
  ride.status = status;
  if (driverId) ride.driverId = driverId;
  if (status === 'COMPLETED' || status === 'CANCELLED') {
    const driver = store.drivers.find(d => d.id === ride.driverId);
    if (driver) driver.status = 'AVAILABLE';
  }
  io.emit('ride_status_updated', ride);
  respond(res, ride);
});

app.post('/api/rides/:rideId/rate', (req, res) => {
  const { rideId } = req.params;
  const { rating, compliments, tipAmount, comment } = req.body;
  const ride = store.rides.find(r => r.id === rideId);
  if (ride) {
    ride.rating = rating;
    ride.tip = tipAmount;
    ride.review = comment;
  }
  respond(res, { rated: true, rideId, rating });
});

// Fare Estimation
app.post('/api/fare/estimate', (req, res) => {
  const { pickupCoords, dropoffCoords, vehicleType } = req.body;
  if (!pickupCoords || !dropoffCoords) return respondError(res, 'Coords required');
  const estimatedFare = calcFare(pickupCoords, dropoffCoords, vehicleType || 'standard');
  respond(res, { estimatedFare, currency: 'NGN', vehicleType });
});

// Bidding
app.get('/api/bidding', (req, res) => respond(res, store.bids));

app.post('/api/bidding/create', (req, res) => {
  const { passengerName, passengerPhone, pickupLocation, dropoffLocation, pickupCoords, dropoffCoords, passengerOfferedPrice, vehicleType } = req.body;
  if (!passengerOfferedPrice) return respondError(res, 'Offered price required');
  const bid = {
    id: `bid_${uuidv4().slice(0, 8)}`,
    passengerName: passengerName || 'Rider',
    passengerPhone: passengerPhone || '+234 812 000 0000',
    pickupLocation,
    dropoffLocation,
    pickupCoords,
    dropoffCoords,
    passengerOfferedPrice,
    vehicleType: vehicleType || 'standard',
    status: 'OPEN',
    counterOffers: [],
    createdAt: new Date().toISOString()
  };
  store.bids.push(bid);
  io.emit('new_bid_created', bid);

  // Simulate a driver counter-offer after 3 seconds
  setTimeout(() => {
    const counterDriver = store.drivers.find(d => d.status === 'AVAILABLE') || store.drivers[0];
    const counterPrice = Math.round((passengerOfferedPrice * 1.15) / 100) * 100;
    bid.counterOffers.push({
      driverId: counterDriver.id,
      driverName: counterDriver.name,
      counterPrice,
      placedAt: new Date().toISOString()
    });
    io.emit('driver_counter_offer_placed', bid);
  }, 3000);

  respond(res, bid);
});

app.post('/api/bidding/:bidId/counter', (req, res) => {
  const { bidId } = req.params;
  const { driverId, counterPrice } = req.body;
  const bid = store.bids.find(b => b.id === bidId);
  if (!bid) return respondError(res, 'Bid not found', 404);
  const driver = store.drivers.find(d => d.id === driverId) || { name: 'Driver', id: driverId };
  bid.counterOffers = bid.counterOffers.filter(o => o.driverId !== driverId);
  bid.counterOffers.push({ driverId, driverName: driver.name, counterPrice, placedAt: new Date().toISOString() });
  io.emit('driver_counter_offer_placed', bid);
  respond(res, bid);
});

app.post('/api/bidding/:bidId/accept', (req, res) => {
  const { bidId } = req.params;
  const { driverId } = req.body;
  const bid = store.bids.find(b => b.id === bidId);
  if (!bid) return respondError(res, 'Bid not found', 404);
  bid.status = 'ACCEPTED';
  const acceptedOffer = bid.counterOffers.find(o => o.driverId === driverId) || bid.counterOffers[0];
  const driver = store.drivers.find(d => d.id === (driverId || bid.counterOffers[0]?.driverId));
  const ride = {
    id: `ride_${uuidv4().slice(0, 8)}`,
    passengerName: bid.passengerName,
    passengerPhone: bid.passengerPhone,
    pickupLocation: bid.pickupLocation,
    dropoffLocation: bid.dropoffLocation,
    pickupCoords: bid.pickupCoords,
    dropoffCoords: bid.dropoffCoords,
    vehicleType: bid.vehicleType,
    fare: acceptedOffer?.counterPrice || bid.passengerOfferedPrice,
    status: 'MATCHED',
    driverId: driver?.id || 'drv_101',
    driverName: driver?.name || 'Ibrahim Danladi',
    vehicle: `${driver?.vehicleType || 'Toyota Corolla'} (${driver?.plateNumber || 'ABJ-482-AA'})`,
    securityPin: String(Math.floor(1000 + Math.random() * 9000)),
    paymentMethod: 'Paystack',
    isCarpool: false,
    createdAt: new Date().toISOString()
  };
  store.rides.push(ride);
  if (driver) driver.status = 'BUSY';
  io.emit('bid_accepted', { bid, ride });
  io.emit('new_ride_dispatched', ride);
  respond(res, { bid, ride });
});

// SOS
app.post('/api/sos/trigger', (req, res) => {
  const { rideId, passengerName, coords } = req.body;
  const alert = { rideId, passengerName, coords, triggeredAt: new Date().toISOString(), message: `EMERGENCY! ${passengerName || 'Passenger'} at Lat:${coords?.lat}, Lng:${coords?.lng}` };
  io.emit('emergency_sos_alert', alert);
  respond(res, { dispatched: true, ...alert });
});

// Surge Zones
app.get('/api/surge/zones', (req, res) => respond(res, store.surgeZones));
app.post('/api/surge/zones', (req, res) => {
  const { name, lat, lng, radius, multiplier } = req.body;
  const zone = { id: `sz_${uuidv4().slice(0, 6)}`, name, lat, lng, radius: radius || 1200, multiplier: multiplier || 1.0 };
  store.surgeZones.push(zone);
  io.emit('surge_updated', zone);
  respond(res, zone);
});

// Messages (Chat)
app.get('/api/messages/:rideId', (req, res) => {
  const msgs = store.messages[req.params.rideId] || [];
  respond(res, msgs);
});

app.post('/api/messages/send', (req, res) => {
  const { rideId, sender, text } = req.body;
  if (!rideId || !text) return respondError(res, 'rideId and text required');
  if (!store.messages[rideId]) store.messages[rideId] = [];
  const msg = { id: uuidv4(), rideId, sender, text, time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }), createdAt: new Date().toISOString() };
  store.messages[rideId].push(msg);
  io.emit('new_chat_message', msg);
  respond(res, msg);
});

// Payments
app.get('/api/payments/wallets', (req, res) => respond(res, store.wallets));
app.get('/api/payments/history', (req, res) => respond(res, store.paymentHistory));

app.post('/api/payments/initialize', (req, res) => {
  const { amount, customerEmail } = req.body;
  respond(res, { reference: `PAY_${uuidv4().slice(0, 8)}`, amount, customerEmail, gateway: 'Paystack', status: 'initialized' });
});

app.post('/api/payments/payout', (req, res) => {
  const { driverId, amount, bankAccount } = req.body;
  const wallet = store.wallets.find(w => w.driverId === driverId);
  if (!wallet) return respondError(res, 'Wallet not found', 404);
  if (amount > wallet.balance) return respondError(res, 'Insufficient balance');
  wallet.balance -= amount;
  const tx = { driverId, type: 'debit', description: `Payout to ${bankAccount?.slice(-4) ? '****' + bankAccount.slice(-4) : 'Bank Account'}`, amount, status: 'pending', date: 'Just now' };
  store.paymentHistory.unshift(tx);
  io.emit('driver_payout_settled', { driverId, amount, newBalance: wallet.balance });
  respond(res, { payout: tx, newBalance: wallet.balance });
});

// Notifications
app.get('/api/notifications', (req, res) => respond(res, store.notifications));

// ─── Socket.IO ───────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });

  // Driver goes online/offline
  socket.on('driver_status_change', ({ driverId, status }) => {
    const driver = store.drivers.find(d => d.id === driverId);
    if (driver) {
      driver.status = status;
      io.emit('location_changed', driver);
    }
  });

  // Real-time location stream
  socket.on('location_update', ({ driverId, location }) => {
    const driver = store.drivers.find(d => d.id === driverId);
    if (driver) {
      driver.location = { ...driver.location, ...location };
      io.emit('driver_location_update', { driverId, location: driver.location, name: driver.name });
    }
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ TaxiAPP Backend running on http://localhost:${PORT}`);
  console.log(`   Routes: /api/health, /api/drivers, /api/rides, /api/bidding, /api/payments, /api/surge/zones, /api/sos/trigger`);
});
