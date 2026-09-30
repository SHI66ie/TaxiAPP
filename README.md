# 🚕 Abuja Express Taxi & Carpooling Platform (MVP)

A resilient, locally-optimized ride-hailing and split-fare carpooling application tailored for **Abuja, Nigeria**. Built with enhanced safety protocols, hybrid payment options (Cash, Paystack, Paga), low-data resilience, and an intelligent route-overlapping carpool engine.

---

## 🌟 Key Features

### 1. 👥 Ride Sharing / Carpooling Engine (Primary Differentiator)
- **Route Overlap Matching**: Dynamically groups 2 passengers traveling along common Abuja transit corridors (e.g. Berger ↔ Airport Rd, Wuse II ↔ Maitama, Gwarinpa ↔ CBD).
- **Split-Fare Savings**: Automatically splits base distance fare, offering passengers up to **35% – 50% savings** while increasing driver per-trip earnings.

### 2. 🛡️ Enhanced Safety Suite
- **Dynamic QR Trip Verification**: Passenger scans driver's dynamic QR code before trip start to prevent unauthorized driver impersonation.
- **One-Tap SOS Emergency Dispatch**: Instantly broadcasts GPS coordinates to emergency contacts & dispatch center with automated SMS fallback.
- **Trip Live Sharing**: Encrypted tracking link shareable via WhatsApp and SMS.

### 3. 💳 Hybrid Payment Integration
- **Paystack & Paga Gateway**: Card, bank transfer, USSD, and mobile wallet payments.
- **Cash Management**: Driver wallet balance tracking with automated commission deduction (15% platform fee).

### 4. 🗺️ Live Mapbox Fleet Tracking
- Real-time driver positions on a dark Mapbox map centred on Abuja.
- Colour-coded markers (emerald = available, gold = busy) + active ride pulses.
- Click markers for driver / passenger popups.
- **Driver navigation**: shortest + lowest-traffic legs (driver → hailer, hailer → destination) via Mapbox `driving-traffic` with fallback routing when no token is set.

### 5. 🌍 Geofenced Abuja Tariff Matrix
- Custom zone pricing for Abuja landmarks (Nnamdi Azikiwe International Airport express, CBD, Wuse II, Gwarinpa, Kubwa, Lugbe).
- Multi-vehicle support: **Standard Taxi**, **Comfort Sedan**, and **Express Okada/Bike**.

---

## Traffic-aware driver routes

Set `MAPBOX_ACCESS_TOKEN` in the server `.env` (same token as `VITE_MAPBOX_ACCESS_TOKEN` works for MVP).

- `POST /api/routes/optimize` with `{ driverCoords, pickupCoords, dropoffCoords }`
- Booking (`POST /api/rides/book`) attaches `ride.routes.toPickup` and `ride.routes.toDestination`
- Blue polyline = driver → hailer; yellow polyline = hailer → destination
- Alternatives from Mapbox are scored by live duration, distance, and congestion

---

## 🚀 Quick Start (Local)

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Environment
```bash
cp .env.example .env
cp .env.example admin-dashboard/.env
```

Add:
```
VITE_MAPBOX_ACCESS_TOKEN=pk.your_token_here
MAPBOX_ACCESS_TOKEN=pk.your_token_here
```

### 3. Run Backend & Admin Dashboard
```bash
npm run dev
```

- **Backend API**: `http://localhost:5000`
- **Admin Dashboard**: `http://localhost:5173`

---

## 📝 License
[MIT License](LICENSE)
