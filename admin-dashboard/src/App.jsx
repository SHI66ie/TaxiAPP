import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Navbar from './components/Navbar';
import LiveMap from './components/LiveMap';
import CarpoolCalculator from './components/CarpoolCalculator';
import KycManager from './components/KycManager';
import RidesTable from './components/RidesTable';
import { Car, Users, DollarSign, ShieldAlert, Sparkles, Navigation } from 'lucide-react';

const socket = io('http://localhost:5000');

export default function App() {
  const [activeTab, setActiveTab] = useState('dispatch');
  const [drivers, setDrivers] = useState([]);
  const [rides, setRides] = useState([]);
  const [kycDocs, setKycDocs] = useState([]);
  const [sosAlert, setSosAlert] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [resD, resR, resK] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/rides'),
        fetch('/api/drivers/kyc')
      ]);
      const dataD = await resD.json();
      const dataR = await resR.json();
      const dataK = await resK.json();

      if (dataD.success) setDrivers(dataD.data);
      if (dataR.success) setRides(dataR.data);
      if (dataK.success) setKycDocs(dataK.data);
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

    return () => {
      socket.off('emergency_sos_alert');
      socket.off('new_ride_dispatched');
      socket.off('ride_status_updated');
      socket.off('driver_kyc_approved');
    };
  }, []);

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
  const pendingKycCount = kycDocs.filter(k => k.status === 'PENDING').length;

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
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Carpool Split Trips</div>
              <div className="stat-val" style={{ color: 'var(--accent-gold)' }}>{carpoolCount} Active</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)' }}>
              <Sparkles size={24} />
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Gross Abuja Revenue</div>
              <div className="stat-val">₦{totalRevenue.toLocaleString()}</div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
              <DollarSign size={24} />
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>KYC Verification Queue</div>
              <div className="stat-val" style={{ color: pendingKycCount > 0 ? '#ef4444' : 'var(--text-muted)' }}>
                {pendingKycCount} Pending
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <ShieldAlert size={24} />
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
