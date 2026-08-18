import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Navbar from './components/Navbar';
import LiveMap from './components/LiveMap';
import InDriveBidding from './components/InDriveBidding';
import UberSurgeManager from './components/UberSurgeManager';
import BoltFleetManager from './components/BoltFleetManager';
import PaymentManager from './components/PaymentManager';
import CarpoolCalculator from './components/CarpoolCalculator';
import KycManager from './components/KycManager';
import RidesTable from './components/RidesTable';
import { Car, Users, Banknote, ShieldAlert, Sparkles, Navigation, Zap, Radio, CreditCard } from 'lucide-react';

const socket = io('http://localhost:5000');

export default function App() {
  const [activeTab, setActiveTab] = useState('dispatch');
  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]);
  const [kycDocs, setKycDocs] = useState([]);
  const [bids, setBids] = useState([]);
  const [surgeZones, setSurgeZones] = useState([]);
  const [sosAlert, setSosAlert] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [resD, resR, resK, resB, resS] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/rides'),
        fetch('/api/drivers/kyc'),
        fetch('/api/bidding'),
        fetch('/api/surge/zones')
      ]);
      const dataD = await resD.json();
      const dataR = await resR.json();
      const dataK = await resK.json();
      const dataB = await resB.json();
      const dataS = await resS.json();

      if (dataD.success) setDrivers(dataD.data);
      if (dataR.success) setRides(dataR.data);
      if (dataK.success) setKycDocs(dataK.data);
      if (dataB.success) setBids(dataB.data);
      if (dataS.success) setSurgeZones(dataS.data);
    } catch (err) {
      console.error('API Connection Error:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    socket.on('emergency_sos_alert', (payload) => {
      setSosAlert(payload);
    });

    socket.on('new_ride_dispatched', () => fetchDashboardData());
    socket.on('ride_status_updated', () => fetchDashboardData());
    socket.on('driver_kyc_approved', () => fetchDashboardData());
    socket.on('new_bid_created', () => fetchDashboardData());
    socket.on('driver_counter_offer_placed', () => fetchDashboardData());
    socket.on('bid_accepted', () => fetchDashboardData());
    socket.on('surge_updated', () => fetchDashboardData());
    socket.on('location_changed', () => fetchDashboardData());
    socket.on('payment_verified', () => fetchDashboardData());
    socket.on('driver_payout_settled', () => fetchDashboardData());

    return () => {
      socket.off('emergency_sos_alert');
      socket.off('new_ride_dispatched');
      socket.off('ride_status_updated');
      socket.off('driver_kyc_approved');
      socket.off('new_bid_created');
      socket.off('driver_counter_offer_placed');
      socket.off('bid_accepted');
      socket.off('surge_updated');
      socket.off('location_changed');
      socket.off('payment_verified');
      socket.off('driver_payout_settled');
    };
  }, []);

  // InDrive Bidding Actions
  const handleCreateBid = async (bidData) => {
    try {
      await fetch('/api/bidding/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bidData)
      });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCounterOffer = async (bidId, driverId, counterPrice) => {
    try {
      await fetch(`/api/bidding/${bidId}/counter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, counterPrice })
      });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptBid = async (bidId, driverId) => {
    try {
      await fetch(`/api/bidding/${bidId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId })
      });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // Uber Surge Action
  const handleUpdateZoneDemand = async (zoneId, demandDelta, driverDelta) => {
    try {
      await fetch(`/api/surge/zone/${zoneId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demandDelta, driverDelta })
      });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // Bolt Telemetry Action
  const handleSimulateTelemetry = async (driverId) => {
    try {
      const driver = drivers.find(d => d.id === driverId) || drivers[0];
      if (!driver) return;

      const newLat = driver.location.lat + (Math.random() - 0.5) * 0.008;
      const newLng = driver.location.lng + (Math.random() - 0.5) * 0.008;

      await fetch('/api/location/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: driver.id,
          coords: { lat: newLat, lng: newLng, speed: 42, heading: 90 }
        })
      });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateBooking = async () => {
    try {
      const testRide = {
        passengerName: 'Zainab Mohammed',
        passengerPhone: '+234 803 555 9900',
        pickupLocation: 'Maitama District Hospital',
        dropoffLocation: 'Central Bank of Nigeria Headquarters (CBD)',
        pickupCoords: { lat: 9.0800, lng: 7.4900 },
        dropoffCoords: { lat: 9.0500, lng: 7.4800 },
        vehicleType: 'standard',
        isCarpool: true,
        fare: 2600,
        originalFare: 3800,
        paymentMethod: 'Paystack'
      };

      await fetch('/api/rides/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testRide)
      });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRideStatus = async (rideId, status) => {
    try {
      await fetch(`/api/rides/${rideId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveKyc = async (driverId) => {
    try {
      await fetch(`/api/drivers/${driverId}/approve-kyc`, { method: 'POST' });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerSos = async () => {
    try {
      await fetch('/api/sos/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rideId: 'ride_901',
          passengerName: 'Amina Bello',
          coords: { lat: 9.0620, lng: 7.4720 }
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const activeDriversCount = drivers.filter(d => d.status === 'AVAILABLE' || d.status === 'BUSY').length;
  const carpoolCount = rides.filter(r => r.isCarpool).length;
  const totalRevenue = rides.reduce((acc, r) => acc + (r.status === 'COMPLETED' ? r.fare : 0), 18500);
  const activeBidsCount = bids.filter(b => b.status === 'OPEN').length;

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTriggerSos={handleTriggerSos}
        sosAlert={sosAlert}
      />

      <main className="main-content">
        {/* Top Metric Cards */}
        <div className="dashboard-stats">
          <div className="glass-panel stat-card">
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Active Abuja Drivers</div>
              <div className="stat-val" style={{ color: 'var(--accent-emerald)' }}>{activeDriversCount} Online</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
              <Car size={24} />
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>InDrive Active Bids</div>
              <div className="stat-val" style={{ color: 'var(--accent-gold)' }}>{activeBidsCount} Open</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)' }}>
              <Banknote size={24} />
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Uber Surge Peak</div>
              <div className="stat-val" style={{ color: '#ef4444' }}>
                {surgeZones.find(z => z.multiplier >= 1.7)?.multiplier || 1.8}x Surge
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <Zap size={24} />
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Gross Abuja Revenue</div>
              <div className="stat-val">₦{totalRevenue.toLocaleString()}</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
              <CreditCard size={24} />
            </div>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'dispatch' && (
          <>
            <LiveMap
              drivers={drivers}
              rides={rides}
              onSimulateBooking={handleSimulateBooking}
            />
            <RidesTable
              rides={rides}
              onUpdateStatus={handleUpdateRideStatus}
            />
          </>
        )}

        {activeTab === 'bidding' && (
          <InDriveBidding
            bids={bids}
            onCreateBid={handleCreateBid}
            onAcceptBid={handleAcceptBid}
            onCounterOffer={handleCounterOffer}
          />
        )}

        {activeTab === 'surge' && (
          <UberSurgeManager
            surgeZones={surgeZones}
            onUpdateZoneDemand={handleUpdateZoneDemand}
          />
        )}

        {activeTab === 'bolt' && (
          <BoltFleetManager
            drivers={drivers}
            onSimulateTelemetry={handleSimulateTelemetry}
          />
        )}

        {activeTab === 'payments' && <PaymentManager />}

        {activeTab === 'carpool' && <CarpoolCalculator />}

        {activeTab === 'kyc' && (
          <KycManager
            kycDocs={kycDocs}
            onApproveKyc={handleApproveKyc}
          />
        )}
      </main>
    </div>
  );
}


