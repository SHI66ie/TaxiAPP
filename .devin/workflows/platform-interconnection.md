---
description: Platform Interconnection and Real-time Communication Workflow
---

# Platform Interconnection Workflow

This workflow ensures all three platforms (Admin Dashboard, Customer App, Driver App) are interconnected and communicate bidirectionally through the shared backend API and Socket.io real-time events.

## Architecture Overview

The system uses a **centralized backend** (`server/`) that serves as the communication hub:
- **REST API endpoints** for CRUD operations
- **Socket.io** for real-time event broadcasting
- All platforms connect to the same backend at `http://localhost:5000`

## Socket.io Event Flow

### Backend Emits → All Platforms Listen

The backend emits the following events that all platforms should listen to:

1. **emergency_sos_alert** - Emergency SOS triggered by passenger
2. **new_ride_dispatched** - New ride booking created
3. **ride_status_updated** - Ride status changed (MATCHED → ARRIVING → IN_PROGRESS → COMPLETED)
4. **driver_kyc_approved** - Driver KYC verification approved
5. **new_bid_created** - New P2P fare bid created
6. **driver_counter_offer_placed** - Driver submitted counter-offer
7. **bid_accepted** - Customer accepted driver's bid
8. **surge_updated** - Surge zone multiplier updated
9. **location_changed** - Driver GPS location updated
10. **payment_verified** - Payment transaction verified
11. **driver_payout_settled** - Driver wallet payout processed
12. **carpool_match_found** - Carpool route match identified

## Platform-Specific Responsibilities

### Admin Dashboard (`admin-dashboard/`)
- **Listens to**: All 12 events (full visibility)
- **Emits to backend**: Via REST API calls only
- **Key actions**: 
  - Approve driver KYC
  - Update surge zones
  - Monitor live fleet
  - Handle SOS alerts

### Customer App (`customer-app/`)
- **Listens to**: emergency_sos_alert, new_bid_created, driver_counter_offer_placed, bid_accepted, surge_updated, location_changed, payment_verified, carpool_match_found
- **Emits to backend**: Via REST API calls only
- **Key actions**:
  - Book rides
  - Create fare bids
  - Accept driver counter-offers
  - Trigger SOS
  - Verify payments

### Driver App (`driver-app/`)
- **Listens to**: All 12 events (full visibility for driver operations)
- **Emits to backend**: Via REST API calls + `driver_location_update` socket event
- **Key actions**:
  - Accept/decline ride offers
  - Submit counter-offers
  - Update GPS location
  - Update ride status
  - Request payouts
  - Trigger SOS

## Verification Steps

### 1. Check Socket Connection
```bash
# Start backend
cd server
npm run dev

# Start admin dashboard
cd admin-dashboard
npm run dev

# Start customer app
cd customer-app
npm run dev

# Start driver app
cd driver-app
npm run dev
```

### 2. Verify Event Propagation
1. **Customer books a ride** → Check Admin Dashboard sees `new_ride_dispatched`
2. **Driver goes online** → Check Customer App sees location updates via `location_changed`
3. **Driver accepts ride** → Check Customer App sees `ride_status_updated`
4. **Customer triggers SOS** → Check Admin Dashboard and Driver App see `emergency_sos_alert`
5. **Customer creates bid** → Check Driver App sees `new_bid_created`
6. **Driver counters** → Check Customer App sees `driver_counter_offer_placed`
7. **Admin approves KYC** → Check Driver App sees `driver_kyc_approved`

### 3. Check API Endpoints
All platforms share these REST endpoints:
- `POST /api/rides/book` - Book a ride
- `PATCH /api/rides/:id/status` - Update ride status
- `GET /api/rides` - Get all rides
- `GET /api/drivers` - Get all drivers
- `POST /api/bidding/create` - Create fare bid
- `POST /api/bidding/:id/counter` - Submit counter-offer
- `POST /api/bidding/:id/accept` - Accept bid
- `GET /api/surge/zones` - Get surge zones
- `POST /api/surge/zone/:id/update` - Update surge
- `POST /api/location/update` - Update driver location
- `POST /api/sos/trigger` - Trigger emergency SOS
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/wallets` - Get driver wallets
- `POST /api/payments/payout` - Request payout

## Common Issues & Solutions

### Issue: Socket events not received
- **Check**: All platforms using same `SOCKET_URL` (default: `http://localhost:5000`)
- **Check**: Backend server is running
- **Check**: No CORS errors in browser console
- **Solution**: Set `VITE_BACKEND_URL` environment variable if backend is on different host

### Issue: Events received but UI not updating
- **Check**: Event listeners are registered in component `useEffect`
- **Check**: State updates are triggering re-renders
- **Solution**: Ensure socket listeners are cleaned up in `useEffect` return

### Issue: Driver location not updating
- **Check**: Driver app is emitting `driver_location_update` socket event
- **Check**: Backend is broadcasting `location_changed` event
- **Solution**: Verify driver status is `AVAILABLE` or `BUSY`

## Testing Communication Flow

### End-to-End Test: Customer Books Ride → Driver Accepts → Admin Monitors

1. **Customer App**: Book ride from Maitama to CBD
   - Calls `POST /api/rides/book`
   - Backend emits `new_ride_dispatched`

2. **Driver App**: (Online) Receives ride offer modal
   - Listens to `new_ride_dispatched`
   - Clicks "Accept Ride"
   - Calls `PATCH /api/rides/:id/status` with status `IN_PROGRESS`
   - Backend emits `ride_status_updated`

3. **Admin Dashboard**: Sees ride status change
   - Listens to `ride_status_updated`
   - Live map updates with driver position

4. **Customer App**: Sees driver en route
   - Listens to `ride_status_updated`
   - ActiveRide component updates status

5. **Driver App**: Completes ride
   - Calls `PATCH /api/rides/:id/status` with status `COMPLETED`
   - Backend emits `ride_status_updated`

6. **All Platforms**: Ride marked complete
   - All listeners update UI accordingly

## Environment Configuration

### Backend (`.env`)
```
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Customer App (`customer-app/.env`)
```
VITE_BACKEND_URL=http://localhost:5000
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Driver App (`driver-app/.env`)
```
VITE_BACKEND_URL=http://localhost:5000
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

### Admin Dashboard (`admin-dashboard/.env`)
```
VITE_BACKEND_URL=http://localhost:5000
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Deployment Considerations

### Production Socket URL
Update `SOCKET_URL` in each platform's `App.jsx`:
```javascript
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'https://your-production-api.com';
```

### CORS Configuration
Backend `server/src/index.js` already allows all origins. For production, restrict to your deployed domains:
```javascript
cors: {
  origin: ['https://admin.yourdomain.com', 'https://customer.yourdomain.com', 'https://driver.yourdomain.com'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE']
}
```

## Summary

All three platforms are now fully interconnected through:
1. **Shared REST API** - All CRUD operations
2. **Socket.io real-time events** - 12 broadcasted events
3. **Bidirectional communication** - Each platform can trigger and receive events
4. **Consistent state synchronization** - UI updates automatically on socket events

The system ensures that actions in one platform immediately reflect across all connected platforms.
