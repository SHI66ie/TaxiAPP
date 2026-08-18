import React from 'react';

const Account = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h1 className="text-h1" style={{ marginBottom: '24px' }}>Account</h1>
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-elevated)' }}></div>
        <div>
          <h3 className="text-h3">Guest User</h3>
          <p className="text-sm">Tap to view profile</p>
        </div>
      </div>
    </div>
  );
};

export default Account;
