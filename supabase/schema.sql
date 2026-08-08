-- Abuja Express Taxi & Carpool Platform
-- Run this once in the Supabase SQL Editor (Dashboard → SQL → New query)

-- Zones (Abuja tariff matrix)
CREATE TABLE IF NOT EXISTS zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_fare INTEGER NOT NULL DEFAULT 0,
  per_km INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drivers
CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  vehicle TEXT,
  type TEXT NOT NULL DEFAULT 'standard', -- standard | comfort | okada
  rating NUMERIC(3,2) DEFAULT 5.0,
  trips_completed INTEGER DEFAULT 0,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  zone TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL', -- AVAILABLE | BUSY | OFFLINE | PENDING_APPROVAL
  kyc_status TEXT NOT NULL DEFAULT 'SUBMITTED', -- SUBMITTED | VERIFIED | REJECTED
  wallet_balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rides
CREATE TABLE IF NOT EXISTS rides (
  id TEXT PRIMARY KEY,
  passenger_name TEXT,
  passenger_phone TEXT,
  pickup_location TEXT,
  dropoff_location TEXT,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  dropoff_lat DOUBLE PRECISION,
  dropoff_lng DOUBLE PRECISION,
  vehicle_type TEXT DEFAULT 'standard',
  is_carpool BOOLEAN DEFAULT FALSE,
  carpool_partner TEXT,
  status TEXT NOT NULL DEFAULT 'MATCHED', -- MATCHED | IN_PROGRESS | COMPLETED | CANCELLED
  fare INTEGER,
  original_fare INTEGER,
  driver_id TEXT REFERENCES drivers(id),
  qr_code TEXT,
  payment_method TEXT DEFAULT 'Paystack',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KYC submissions
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id TEXT REFERENCES drivers(id),
  driver_name TEXT,
  nin TEXT,
  license_no TEXT,
  vehicle_reg TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | APPROVED | REJECTED
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_kyc ON drivers(kyc_status);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_submissions(status);

-- Enable Realtime for admin dashboard live updates
ALTER PUBLICATION supabase_realtime ADD TABLE drivers;
ALTER PUBLICATION supabase_realtime ADD TABLE rides;
ALTER PUBLICATION supabase_realtime ADD TABLE kyc_submissions;

-- Seed some Abuja zones (optional)
INSERT INTO zones (id, name, base_fare, per_km) VALUES
  ('cbd', 'Central Business District (CBD)', 800, 250),
  ('wuse2', 'Wuse II', 750, 240),
  ('maitama', 'Maitama', 900, 280),
  ('gwarinpa', 'Gwarinpa Estate', 700, 220),
  ('kubwa', 'Kubwa', 600, 200),
  ('lugbe', 'Lugbe Corridor', 550, 190),
  ('airport', 'Nnamdi Azikiwe Airport Express', 2500, 300)
ON CONFLICT (id) DO NOTHING;
