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

### 5. 🌍 Geofenced Abuja Tariff Matrix
- Custom zone pricing for Abuja landmarks (Nnamdi Azikiwe International Airport express, CBD, Wuse II, Gwarinpa, Kubwa, Lugbe).
- Multi-vehicle support: **Standard Taxi**, **Comfort Sedan**, and **Express Okada/Bike**.

---

## 🏗️ Repository Architecture

```
TaxiAPP/
├── server/               # Node.js + Express + Socket.io Backend API & Real-time Matching
│   ├── src/
│   │   ├── lib/          # Supabase client (service role)
│   │   ├── services/     # Carpool split-fare engine, dispatch, fare matrix, safety
│   │   ├── routes/       # Auth, rides, carpool, drivers, admin, payments
│   │   └── data/         # In-memory mock store (fallback when Supabase is not configured)
├── admin-dashboard/      # React + Vite Web Management Portal (Live Dispatch, KYC, Analytics)
│   └── src/lib/          # Supabase client (anon key)
├── supabase/
│   └── schema.sql        # Database schema + seed zones
├── netlify.toml          # Netlify deploy config for the admin dashboard
└── package.json          # Root scripts for running full application
```

---

## 🚀 Quick Start (Local)

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Environment
```bash
# Server
cp .env.example .env

# Admin dashboard (Mapbox + Supabase)
cp .env.example admin-dashboard/.env
```

Edit `admin-dashboard/.env` and add at minimum:

```
VITE_MAPBOX_ACCESS_TOKEN=pk.your_token_here
```

Get a free token at [account.mapbox.com/access-tokens](https://account.mapbox.com/access-tokens/).

### 3. Run Backend & Admin Dashboard
```bash
npm run dev
```

- **Backend API**: `http://localhost:5000`
- **Admin Dashboard**: `http://localhost:5173`

---

## 🗄️ Supabase Setup (Dev Database)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** → New query → paste the contents of `supabase/schema.sql` → Run.
3. Go to **Project Settings → API** and copy the Project URL + keys.
4. Put them in `.env` (server) and `admin-dashboard/.env`.

If keys are missing the backend falls back to the in-memory mock store automatically.

---

## 🌐 Netlify Deploy (Admin UI)

1. Import `SHI66ie/TaxiAPP` on [app.netlify.com](https://app.netlify.com).
2. `netlify.toml` already sets base = `admin-dashboard`.
3. Add environment variables:
   - `VITE_MAPBOX_ACCESS_TOKEN`
   - `VITE_SUPABASE_URL` (optional)
   - `VITE_SUPABASE_ANON_KEY` (optional)
4. Deploy.

---

## 📜 License
[MIT License](LICENSE)
