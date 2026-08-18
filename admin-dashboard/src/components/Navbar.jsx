import React from 'react';
import { Car, ShieldAlert, Users, FileCheck, MapPin, Sparkles, Banknote, CreditCard, Zap, Radio } from 'lucide-react';

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
          <span className="brand-badge">PRO EDITION</span>
        </div>

        <div className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'dispatch' ? 'active' : ''}`}
            onClick={() => setActiveTab('dispatch')}
          >
            <MapPin size={16} /> Live Radar & GPS
          </button>
          <button
            className={`tab-btn ${activeTab === 'bidding' ? 'active' : ''}`}
            onClick={() => setActiveTab('bidding')}
          >
            <Banknote size={16} /> P2P Fare Bidding
          </button>
          <button
            className={`tab-btn ${activeTab === 'surge' ? 'active' : ''}`}
            onClick={() => setActiveTab('surge')}
          >
            <Zap size={16} /> Dynamic Surge Engine
          </button>
          <button
            className={`tab-btn ${activeTab === 'bolt' ? 'active' : ''}`}
            onClick={() => setActiveTab('bolt')}
          >
            <Radio size={16} /> Fleet Telemetry & GPS
          </button>
          <button
            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={16} /> Paystack & Payments
          </button>
          <button
            className={`tab-btn ${activeTab === 'carpool' ? 'active' : ''}`}
            onClick={() => setActiveTab('carpool')}
          >
            <Sparkles size={16} /> Carpool Split
          </button>
          <button
            className={`tab-btn ${activeTab === 'kyc' ? 'active' : ''}`}
            onClick={() => setActiveTab('kyc')}
          >
            <FileCheck size={16} /> Driver KYC
          </button>
        </div>

        <button className="btn btn-danger" onClick={onTriggerSos}>
          <ShieldAlert size={16} /> Test SOS Alarm
        </button>
      </nav>
    </>
  );
}


