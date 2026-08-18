import React from 'react';
import { Shield, Phone, MessageSquare, User, Star } from 'lucide-react';

const ActiveRide = ({ driver, eta, onCancel }) => {
  return (
    <div 
      className="glass-panel animate-slide-up"
      style={{ 
        position: 'absolute', 
        bottom: 'calc(var(--nav-height) + 16px)', 
        left: '16px', 
        right: '16px', 
        padding: '24px',
        zIndex: 10
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 className="text-h2">Driver is arriving</h2>
          <p className="text-body" style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{eta} away</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h3 className="text-h1" style={{ fontSize: '24px' }}>{driver?.licensePlate || 'ABJ-123-XY'}</h3>
          <p className="text-muted">{driver?.carModel || 'Toyota Corolla (Black)'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={32} color="var(--text-muted)" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 className="text-h3">{driver?.name || 'Samuel'}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <span className="text-sm" style={{ fontWeight: '600' }}>4.9</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ width: '44px', height: '44px', borderRadius: '50%', border: 'none', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={20} />
          </button>
          <button style={{ width: '44px', height: '44px', borderRadius: '50%', border: 'none', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={20} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
        <button className="btn-secondary" style={{ flex: 1, padding: '10px' }} onClick={onCancel}>Cancel Ride</button>
        <button className="btn-secondary" style={{ flex: 1, padding: '10px', display: 'flex', gap: '8px', color: 'var(--danger)' }}>
          <Shield size={18} /> Safety
        </button>
      </div>
    </div>
  );
};

export default ActiveRide;
