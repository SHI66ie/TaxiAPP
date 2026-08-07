// Main Server Entrypoint for Abuja Express Taxi & Carpooling API
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import apiRouter from './routes/apiRoutes.js';

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

// Attach io to request object for route triggers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount REST API
app.use('/api', apiRouter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'Abuja Express Taxi & Carpool Backend API',
    time: new Date().toISOString()
  });
});

// Socket.io Realtime Events
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Driver sends live location ping
  socket.on('driver_location_update', (data) => {
    // Broadcast updated location to admin & passenger clients
    io.emit('location_changed', data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Abuja Taxi Server running on http://localhost:${PORT}`);
});
