-- ============================================================================
-- TAXI APP / ABUJA EXPRESS TAXI - CLEAN RE-SYNC MIGRATION
-- Drops previous incomplete mock tables and creates the full fresh schema
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop legacy tables cleanly with CASCADE to avoid column mismatch errors
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.payment_history CASCADE;
DROP TABLE IF EXISTS public.driver_wallets CASCADE;
DROP TABLE IF EXISTS public.surge_zones CASCADE;
DROP TABLE IF EXISTS public.bids CASCADE;
DROP TABLE IF EXISTS public.rides CASCADE;
DROP TABLE IF EXISTS public.driver_kyc CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. Profiles Table (Riders, Drivers, Admins)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'rider' CHECK (role IN ('rider', 'driver', 'admin')),
  rating NUMERIC(3,2) DEFAULT 5.00,
  total_trips INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Drivers Table (Fleet & Telemetry)
CREATE TABLE public.drivers (
  id VARCHAR(50) PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  vehicle_type VARCHAR(100) NOT NULL DEFAULT 'standard',
  plate_number VARCHAR(50) NOT NULL,
  license_number VARCHAR(100),
  base_location VARCHAR(255) DEFAULT 'Abuja Central',
  rating NUMERIC(3,2) DEFAULT 4.90,
  total_trips INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'OFFLINE' CHECK (status IN ('AVAILABLE', 'BUSY', 'OFFLINE')),
  latitude DOUBLE PRECISION DEFAULT 9.05785,
  longitude DOUBLE PRECISION DEFAULT 7.49508,
  speed NUMERIC(5,2) DEFAULT 0,
  heading NUMERIC(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Driver KYC Table
CREATE TABLE public.driver_kyc (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id VARCHAR(50) REFERENCES public.drivers(id) ON DELETE CASCADE,
  nin VARCHAR(50),
  license_no VARCHAR(100),
  vehicle_reg VARCHAR(50),
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- 6. Rides Table
CREATE TABLE public.rides (
  id VARCHAR(50) PRIMARY KEY,
  passenger_name VARCHAR(255) NOT NULL,
  passenger_phone VARCHAR(50) NOT NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION NOT NULL,
  pickup_lng DOUBLE PRECISION NOT NULL,
  dropoff_lat DOUBLE PRECISION NOT NULL,
  dropoff_lng DOUBLE PRECISION NOT NULL,
  vehicle_type VARCHAR(50) DEFAULT 'standard',
  fare NUMERIC(10,2) NOT NULL,
  original_fare NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'MATCHED' CHECK (status IN ('MATCHED', 'ARRIVING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  driver_id VARCHAR(50) REFERENCES public.drivers(id) ON DELETE SET NULL,
  driver_name VARCHAR(255),
  vehicle_info VARCHAR(255),
  security_pin VARCHAR(10),
  is_carpool BOOLEAN DEFAULT FALSE,
  carpool_partner VARCHAR(255),
  payment_method VARCHAR(50) DEFAULT 'Paystack',
  rating NUMERIC(3,2),
  tip_amount NUMERIC(10,2) DEFAULT 0,
  review_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 7. P2P Bidding Table
CREATE TABLE public.bids (
  id VARCHAR(50) PRIMARY KEY,
  passenger_name VARCHAR(255) NOT NULL,
  passenger_phone VARCHAR(50) NOT NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION NOT NULL,
  pickup_lng DOUBLE PRECISION NOT NULL,
  dropoff_lat DOUBLE PRECISION NOT NULL,
  dropoff_lng DOUBLE PRECISION NOT NULL,
  passenger_offered_price NUMERIC(10,2) NOT NULL,
  vehicle_type VARCHAR(50) DEFAULT 'standard',
  status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACCEPTED', 'CANCELLED', 'EXPIRED')),
  counter_offers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Surge Zones Table
CREATE TABLE public.surge_zones (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  radius INTEGER DEFAULT 1200,
  multiplier NUMERIC(3,2) DEFAULT 1.00,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Driver Wallets Table
CREATE TABLE public.driver_wallets (
  driver_id VARCHAR(50) PRIMARY KEY REFERENCES public.drivers(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) DEFAULT 0.00,
  bank_name VARCHAR(100) DEFAULT 'Access Bank',
  bank_account VARCHAR(50) DEFAULT '0012345678',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Payment History Table
CREATE TABLE public.payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id VARCHAR(50) REFERENCES public.drivers(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('credit', 'debit')),
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  ride_id VARCHAR(50) REFERENCES public.rides(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Chat Messages Table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id VARCHAR(50) REFERENCES public.rides(id) ON DELETE CASCADE,
  sender_role VARCHAR(50) NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SEED DATA FOR ABUJA FLEET & CORRIDORS
-- ============================================================================
INSERT INTO public.drivers (id, name, phone, email, vehicle_type, plate_number, license_number, base_location, rating, total_trips, status, latitude, longitude)
VALUES
  ('drv_101', 'Ibrahim Danladi', '+234 803 111 2233', 'ibrahim.danladi@taxiapp.ng', 'Toyota Corolla (Sedan)', 'ABJ-482-AA', 'DRV-2024-ABJ-001', 'Wuse II, Abuja', 4.90, 450, 'AVAILABLE', 9.05785, 7.49508),
  ('drv_102', 'Chidi Okafor', '+234 808 222 3344', 'chidi.okafor@taxiapp.ng', 'Honda Accord (Comfort)', 'ABJ-221-BB', 'DRV-2024-ABJ-002', 'Gwarinpa Estate, Abuja', 4.80, 312, 'AVAILABLE', 9.07648, 7.39857),
  ('drv_103', 'Samuel Musa', '+234 812 333 4455', 'samuel.musa@taxiapp.ng', 'Toyota Sienna (Executive)', 'ABJ-700-CC', 'DRV-2024-ABJ-003', 'Maitama District, Abuja', 4.95, 628, 'AVAILABLE', 9.08000, 7.49000);

INSERT INTO public.driver_kyc (driver_id, nin, license_no, vehicle_reg, status)
VALUES
  ('drv_101', '98234120981', 'FRSC-ABJ-9021', 'ABJ-482-AA', 'APPROVED'),
  ('drv_102', '45129837123', 'FRSC-ABJ-3142', 'ABJ-221-BB', 'APPROVED'),
  ('drv_103', '10928374619', 'FRSC-ABJ-8910', 'ABJ-700-CC', 'APPROVED');

INSERT INTO public.driver_wallets (driver_id, balance, bank_name, bank_account)
VALUES
  ('drv_101', 24850.00, 'GTBank', '0011223344'),
  ('drv_102', 18200.00, 'Access Bank', '0055667788'),
  ('drv_103', 31500.00, 'First Bank', '0099887766');

INSERT INTO public.surge_zones (id, name, lat, lng, radius, multiplier)
VALUES
  ('sz_01', 'Central Business District', 9.0500, 7.4800, 1500, 1.35),
  ('sz_02', 'Maitama District', 9.0800, 7.4900, 1200, 1.20),
  ('sz_03', 'Wuse II Corridor', 9.05785, 7.49508, 900, 1.00);
