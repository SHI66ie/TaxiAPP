import React, { useState } from 'react';
import { Car, Zap, Users, Leaf } from 'lucide-react';

const FleetSelector = ({ onSelect }) => {
  const [selected, setSelected] = useState('standard');

  const categories = [
    { id: 'lite', name: 'Bolt Lite', icon: Car, price: '₦1,800', time: '3 min', color: '#94a3b8' },
    { id: 'standard', name: 'Standard', icon: Car, price: '₦2,500', time: '2 min', color: '#10b981' },
    { id: 'comfort', name: 'Comfort', icon: Zap, price: '₦3,500', time: '5 min', color: '#3b82f6' },
    { id: 'carpool', name: 'Carpool', icon: Users, price: '₦1,200', time: '7 min', color: '#f59e0b' },
    { id: 'green', name: 'Green EV', icon: Leaf, price: '₦2,800', time: '4 min', color: '#10b981' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div 
        style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          gap: '12px', 
          paddingBottom: '8px',
          scrollSnapType: 'x mandatory'
        }}
      >
        {categories.map(cat => (
          <div 
            key={cat.id}
            onClick={() => { setSelected(cat.id); onSelect(cat); }}
            style={{
              minWidth: '110px',
              padding: '16px 12px',
              borderRadius: 'var(--radius-md)',
              background: selected === cat.id ? 'var(--bg-surface-elevated)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${selected === cat.id ? cat.color : 'rgba(255,255,255,0.05)'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              scrollSnapAlign: 'start',
              transition: 'all 0.2s ease',
              boxShadow: selected === cat.id ? `0 0 10px ${cat.color}33` : 'none'
            }}
          >
            <cat.icon size={28} color={cat.color} style={{ marginBottom: '8px' }} />
            <span style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{cat.name}</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{cat.price}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cat.time} away</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FleetSelector;
