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

### 2. Run Backend & Admin Dashboard Simultaneously
```bash
npm run dev
```

- **Backend API**: `http://localhost:5000`
- **Admin Dashboard & Web Simulator**: `http://localhost:5173`

---

## 🗄️ Supabase Setup (Dev Database)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** → New query → paste the contents of `supabase/schema.sql` → Run.
3. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` `public` key
   - `service_role` key (keep secret)
4. Create environment files:

```bash
# Root / server
cp .env.example .env
# Edit .env and add SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY

# Admin dashboard
cp .env.example admin-dashboard/.env
# Edit and add the VITE_SUPABASE_* variables
```

5. Restart the server. If the keys are present the backend will use Supabase; otherwise it falls back to the in-memory mock store automatically.

---

## 🌐 Netlify Deploy (Admin UI)

1. Push this repo to GitHub (already done).
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → Import from Git → select `SHI66ie/TaxiAPP`.
3. Netlify will automatically detect `netlify.toml`:
   - Base directory: `admin-dashboard`
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Under **Site settings → Environment variables** add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. You will get a public URL (e.g. `https://abuja-taxi-admin.netlify.app`) so you can open the dashboard on your phone and laptop at the same time.

> Tip: While the backend is still local, use a tunnel (ngrok / Cloudflare Tunnel) or deploy the API later to Railway/Render and point the dashboard at it.

---

## 📜 License
[MIT License](LICENSE)
