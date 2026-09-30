// Main Server Entrypoint for Abuja Express Taxi & Carpooling API
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import apiRouter from './routes/apiRoutes.js';
import { bookRide } from './services/dispatchService.js';
import { buildDriverTripRoutes, getBestRoute } from './services/routeService.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.post('/api/routes/optimize', async (req, res) => {
  try {
    const { driverCoords, pickupCoords, dropoffCoords, origin, destination } = req.body;
    if (origin && destination) {
      const route = await getBestRoute(origin, destination);
      return res.json({ success: true, data: { route } });
    }
    if (!pickupCoords || !dropoffCoords) {
      return res.status(400).json({ success: false, error: 'pickupCoords and dropoffCoords are required' });
    }
    const routes = await buildDriverTripRoutes({ driverCoords, pickupCoords, dropoffCoords });
    res.json({ success: true, data: routes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/rides/book', async (req, res) => {
  try {
    const booking = await bookRide(req.body);

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

app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'Abuja Express Taxi & Carpool Backend API',
    time: new Date().toISOString()
  });
});

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('driver_location_update', (data) => {
    io.emit('location_changed', data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Abuja Taxi Server running on http://localhost:${PORT}`);
});
