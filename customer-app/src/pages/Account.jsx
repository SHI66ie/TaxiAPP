import React, { useState } from 'react';
import { User, Shield, MapPin, Bell, Phone, Lock, Heart, ChevronRight, CheckCircle2, WifiOff, HelpCircle, LogOut } from 'lucide-react';

const Account = () => {
  const [profile, setProfile] = useState({
    name: 'Amina Bello',
    phone: '+234 812 000 1111',
    email: 'amina.bello@example.com',
    location: 'Wuse II, Abuja'
  });

  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: 'Dr. Usman Bello (Husband)', phone: '+234 803 222 3344' },
    { name: 'FCT Emergency Control Room', phone: '112' }
  ]);

  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [lowDataMode, setLowDataMode] = useState(false);
  const [autoCarpool, setAutoCarpool] = useState(true);

  const handleAddContact = (e) => {
    e.preventDefault();
    if (newContactName && newContactPhone) {
      setEmergencyContacts(prev => [...prev, { name: newContactName, phone: newContactPhone }]);
      setNewContactName('');
      setNewContactPhone('');
      setShowAddContact(false);
    }
  };

  return (
    <div style={{ padding: '20px', paddingBottom: 'calc(var(--nav-height) + 24px)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Passenger Profile</span>
        <h1 className="text-h1" style={{ fontSize: '24px', margin: 0 }}>Account</h1>
      </div>

      {/* User Profile Card */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '20px', 
          borderRadius: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          marginBottom: '20px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <div style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(16, 185, 129, 0.15)', 
          border: '2px solid var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-primary)'
        }}>
          <User size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 className="text-h3" style={{ fontSize: '16px', margin: 0 }}>{profile.name}</h3>
            <CheckCircle2 size={16} color="var(--accent-primary)" />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)', margin: '2px 0 0' }}>{profile.phone}</p>
          <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '600' }}>⭐ 4.98 Rider Rating</span>
        </div>
      </div>

      {/* Emergency Contacts Section (Crucial for SOS) */}
      <div className="glass-panel" style={{ padding: '18px', borderRadius: '14px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="#ef4444" />
            <h3 className="text-h3" style={{ fontSize: '15px', margin: 0 }}>Emergency SOS Contacts</h3>
          </div>
          <button 
            onClick={() => setShowAddContact(!showAddContact)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            {showAddContact ? 'Cancel' : '+ Add'}
          </button>
        </div>

        <p className="text-sm" style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '12px' }}>
          When you activate SOS, these contacts will automatically receive your live Abuja GPS tracking link.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {emergencyContacts.map((contact, idx) => (
            <div 
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>{contact.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{contact.phone}</div>
              </div>
              <Phone size={14} color="var(--accent-primary)" />
            </div>
          ))}
        </div>

        {showAddContact && (
          <form onSubmit={handleAddContact} style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Contact Name (e.g. Brother)" 
              value={newContactName}
              onChange={e => setNewContactName(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px', outline: 'none' }}
              required
            />
            <input 
              type="tel" 
              placeholder="Phone Number (+234...)" 
              value={newContactPhone}
              onChange={e => setNewContactPhone(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px', outline: 'none' }}
              required
            />
            <button type="submit" className="btn-primary" style={{ padding: '8px', fontSize: '12px' }}>
              Save Emergency Contact
            </button>
          </form>
        )}
      </div>

      {/* Saved Places */}
      <div className="glass-panel" style={{ padding: '18px', borderRadius: '14px', marginBottom: '20px' }}>
        <h3 className="text-h3" style={{ fontSize: '15px', marginBottom: '12px' }}>Saved Places</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={16} color="var(--accent-primary)" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>Home</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Aminu Kano Crescent, Wuse II</div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={16} color="#3b82f6" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600' }}>Office</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Central Business District, Abuja</div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="glass-panel" style={{ padding: '18px', borderRadius: '14px', marginBottom: '20px' }}>
        <h3 className="text-h3" style={{ fontSize: '15px', marginBottom: '12px' }}>Preferences</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>Low Data / Offline Mode</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Optimizes map tile caching for Nigerian networks</div>
          </div>
          <input 
            type="checkbox" 
            checked={lowDataMode} 
            onChange={(e) => setLowDataMode(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>Auto-Suggest Carpool Corridors</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automatically checks route overlapping for 40% savings</div>
          </div>
          <input 
            type="checkbox" 
            checked={autoCarpool} 
            onChange={(e) => setAutoCarpool(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* 24/7 Abuja Support */}
      <div className="glass-panel" style={{ padding: '16px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HelpCircle size={18} color="var(--accent-primary)" />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>24/7 Abuja Support Hotline</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>support@abujataxi.ng • 0800-ABUJA-TAXI</div>
          </div>
        </div>
        <a href="tel:0800228528294" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>
          Call
        </a>
      </div>
    </div>
  );
};

export default Account;
