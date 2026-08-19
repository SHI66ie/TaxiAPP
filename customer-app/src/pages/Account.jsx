import React, { useState } from 'react';
import { User, Shield, MapPin, Bell, Phone, Lock, Heart, ChevronRight, CheckCircle2, WifiOff, HelpCircle, LogOut, Star, Plus, Gift, Settings } from 'lucide-react';
import InviteFriendsModal from '../components/InviteFriendsModal';
import NotificationsModal from '../components/NotificationsModal';

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
  const [showInvite, setShowInvite] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
    <div style={{ padding: '20px', paddingBottom: '90px', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
          Passenger Profile
        </span>
        <h1 className="text-h1" style={{ fontSize: '24px', margin: 0, color: '#FFFFFF' }}>Account</h1>
      </div>

      {/* User Profile Card */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '20px', 
          borderRadius: '18px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--bg-surface-elevated)', 
          border: '2px solid var(--aber-yellow)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--aber-yellow)',
          flexShrink: 0
        }}>
          <User size={30} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 className="text-h3" style={{ fontSize: '17px', margin: 0, color: '#FFFFFF' }}>{profile.name}</h3>
            <CheckCircle2 size={16} color="var(--aber-yellow)" />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)', margin: '2px 0 4px' }}>{profile.phone}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 212, 40, 0.12)', padding: '2px 8px', borderRadius: '12px' }}>
            <Star size={12} color="#FFD428" fill="#FFD428" />
            <span style={{ fontSize: '11px', color: 'var(--aber-yellow)', fontWeight: '700' }}>4.98 Rider Score</span>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Section */}
      <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="#EF4444" />
            <h3 className="text-h3" style={{ fontSize: '15px', margin: 0, color: '#FFFFFF' }}>Emergency SOS Contacts</h3>
          </div>
          <button 
            onClick={() => setShowAddContact(!showAddContact)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--aber-yellow)', 
              fontSize: '12px', 
              fontWeight: '700', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            {showAddContact ? 'Cancel' : '+ Add Contact'}
          </button>
        </div>

        <p className="text-sm" style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '12px' }}>
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
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>{contact.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{contact.phone}</div>
              </div>
              <a href={`tel:${contact.phone}`} style={{ color: 'var(--aber-yellow)', textDecoration: 'none' }}>
                <Phone size={16} />
              </a>
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
              style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '13px', outline: 'none' }}
              required
            />
            <input 
              type="tel" 
              placeholder="Phone Number (+234...)" 
              value={newContactPhone}
              onChange={e => setNewContactPhone(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF', fontSize: '13px', outline: 'none' }}
              required
            />
            <button type="submit" className="btn-primary" style={{ padding: '10px', fontSize: '13px' }}>
              Save Emergency Contact
            </button>
          </form>
        )}
      </div>

      {/* Saved Places */}
      <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px', marginBottom: '20px' }}>
        <h3 className="text-h3" style={{ fontSize: '15px', marginBottom: '12px', color: '#FFFFFF' }}>Saved Places</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 212, 40, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--aber-yellow)' }}>
                <MapPin size={16} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>Home</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Aminu Kano Crescent, Wuse II</div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                <MapPin size={16} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>Office / Ministry</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Central Business District, Abuja</div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="glass-panel" style={{ padding: '18px', borderRadius: '16px', marginBottom: '20px' }}>
        <h3 className="text-h3" style={{ fontSize: '15px', marginBottom: '12px', color: '#FFFFFF' }}>Preferences</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>Low Data / Offline Mode</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Optimizes map tile caching for Nigerian networks</div>
          </div>
          <input 
            type="checkbox" 
            checked={lowDataMode} 
            onChange={(e) => setLowDataMode(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--aber-yellow)', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>Auto-Suggest Carpool Corridors</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automatically checks route overlapping for 40% savings</div>
          </div>
          <input 
            type="checkbox" 
            checked={autoCarpool} 
            onChange={(e) => setAutoCarpool(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--aber-yellow)', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Quick Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setShowInvite(true)}
          style={{
            padding: '14px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(255, 212, 40, 0.15), rgba(255, 137, 0, 0.1))',
            border: '1px solid rgba(255, 212, 40, 0.3)',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <Gift size={22} color="var(--aber-yellow)" />
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>Invite Friends</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>₦1,000 per referral</div>
        </button>

        <button
          onClick={() => setShowNotifications(true)}
          style={{
            padding: '14px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <Bell size={22} color="var(--aber-yellow)" />
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>Notifications</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>2 unread alerts</div>
        </button>
      </div>

      {/* 24/7 Abuja Support */}
      <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 212, 40, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--aber-yellow)' }}>
            <HelpCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>24/7 Abuja Support Hotline</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>support@abujataxi.ng • 0800-ABUJA-TAXI</div>
          </div>
        </div>
        <a href="tel:0800228528294" className="btn-primary" style={{ padding: '8px 14px', width: 'auto', fontSize: '12px', textDecoration: 'none' }}>
          Call
        </a>
      </div>

      {/* Modals */}
      {showInvite && <InviteFriendsModal onClose={() => setShowInvite(false)} />}
      {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}
    </div>
  );
};

export default Account;
