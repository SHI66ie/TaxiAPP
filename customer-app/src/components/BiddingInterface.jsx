import React, { useState } from 'react';

const BiddingInterface = ({ basePrice, onPropose, onCancel }) => {
  const [offer, setOffer] = useState(2500); // Default placeholder
  
  const increase = () => setOffer(prev => prev + 100);
  const decrease = () => setOffer(prev => Math.max(1000, prev - 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ textAlign: 'center' }}>
        <p className="text-muted" style={{ marginBottom: '8px' }}>Propose a fair price</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <button 
            onClick={decrease}
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}
          >-</button>
          <h1 className="text-h1" style={{ fontSize: '36px', color: 'var(--accent-primary)' }}>
            ₦{offer.toLocaleString()}
          </h1>
          <button 
            onClick={increase}
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}
          >+</button>
        </div>
        <p className="text-sm" style={{ marginTop: '8px', color: 'var(--warning)' }}>
          Surge is active. Drivers are more likely to accept higher bids.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={() => onPropose(offer)}>Propose ₦{offer.toLocaleString()}</button>
      </div>
    </div>
  );
};

export default BiddingInterface;
