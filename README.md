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

### 4. 🗺️ Geofenced Abuja Tariff Matrix
- Custom zone pricing for Abuja landmarks (Nnamdi Azikiwe International Airport express, CBD, Wuse II, Gwarinpa, Kubwa, Lugbe).
- Multi-vehicle support: **Standard Taxi**, **Comfort Sedan**, and **Express Okada/Bike**.

---

## 🏗️ Repository Architecture

```
TaxiAPP/
├── server/               # Node.js + Express + Socket.io Backend API & Real-time Matching
│   ├── src/
│   │   ├── services/     # Carpool split-fare engine, dispatch, fare matrix, safety
│   │   ├── routes/       # Auth, rides, carpool, drivers, admin, payments
│   │   └── data/         # In-memory & JSON state store for testing
├── admin-dashboard/      # React + Vite Web Management Portal (Live Dispatch, KYC, Analytics)
└── package.json          # Root scripts for running full application
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Run Backend & Admin Dashboard Simultaneously
```bash
npm run dev
```

- **Backend API**: `http://localhost:5000`
- **Admin Dashboard & Web Simulator**: `http://localhost:5173`

---

## 📜 License
[MIT License](LICENSE)
