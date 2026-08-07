import React from 'react';
import { Car, ShieldAlert, Users, FileCheck, MapPin, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onTriggerSos, sosAlert }) {
  return (
    <>
      {sosAlert && (
        <div className="sos-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldAlert size={26} />
            <div>
              <strong>🚨 EMERGENCY SOS ALERT ACTIVATED!</strong>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                {sosAlert.passengerName} triggered SOS in Abuja (Ride: {sosAlert.rideId}). Control room notified!
              </div>
            </div>
          </div>
          <button className="btn btn-primary" style={{ background: '#fff', color: '#7f1d1d' }} onClick={() => alert('Dispatching Abuja Security Response Team!')}>
            Dispatch Emergency Unit
          </button>
        </div>
      )}

      <nav className="navbar">
        <div className="brand-logo">
          <div className="brand-icon">
            <Car size={24} color="#07090e" />
          </div>
          <div>
            <div>Abuja Express Taxi</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Ride-Hailing & Carpooling Command
            </div>
          </div>
          <span className="brand-badge">ABUJA MVP</span>
        </div>

        <div className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'dispatch' ? 'active' : ''}`}
            onClick={() => setActiveTab('dispatch')}
          >
            <MapPin size={16} /> Live Dispatch & Map
          </button>
          <button
            className={`tab-btn ${activeTab === 'carpool' ? 'active' : ''}`}
            onClick={() => setActiveTab('carpool')}
          >
            <Sparkles size={16} /> Carpool Split Calculator
          </button>
          <button
            className={`tab-btn ${activeTab === 'kyc' ? 'active' : ''}`}
            onClick={() => setActiveTab('kyc')}
          >
            <FileCheck size={16} /> Driver KYC Approval
          </button>
        </div>

        <button className="btn btn-danger" onClick={onTriggerSos}>
          <ShieldAlert size={16} /> Test SOS Alarm
        </button>
      </nav>
    </>
  );
}
