import React from 'react';

const Wallet = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 className="text-h1" style={{ marginBottom: '8px' }}>Wallet</h1>
      <div className="glass-panel" style={{ padding: '24px', marginTop: '16px' }}>
        <p className="text-muted">Balance</p>
        <h2 className="text-h1" style={{ color: 'var(--accent-primary)' }}>₦ 0.00</h2>
      </div>
      <button className="btn-primary" style={{ marginTop: '24px' }}>Add Funds</button>
    </div>
  );
};

export default Wallet;
