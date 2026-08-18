import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';

const BookingPanel = ({ onSearch }) => {
  const [destination, setDestination] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (destination.trim()) {
      onSearch(destination);
    }
  };

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
      <h2 className="text-h2" style={{ marginBottom: '20px' }}>Where to?</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: 'var(--bg-surface-elevated)', 
          padding: '12px 16px', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '16px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Search size={20} color="var(--text-muted)" style={{ marginRight: '12px' }} />
          <input 
            type="text" 
            placeholder="Search destination..." 
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '16px',
              width: '100%'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', cursor: 'pointer' }}>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '50%', 
            background: 'var(--bg-surface-elevated)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', marginRight: '16px' 
          }}>
            <MapPin size={18} color="var(--accent-primary)" />
          </div>
          <div>
            <h4 className="text-h3" style={{ fontSize: '15px' }}>Saved Places</h4>
            <p className="text-sm">Home, Work, etc.</p>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={!destination.trim()}>
          Find a Ride
        </button>
      </form>
    </div>
  );
};

export default BookingPanel;
