import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { socket } from '../App';

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const driverId = 'drv_101';

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const [walletRes, historyRes] = await Promise.all([
        fetch('/api/payments/wallets'),
        fetch('/api/payments/history')
      ]);
      
      const walletJson = await walletRes.json();
      const historyJson = await historyRes.json();
      
      if (walletJson.success) {
        const myWallet = walletJson.data.find(w => w.driverId === driverId);
        setWallet(myWallet || walletJson.data[0]);
      }
      
      if (historyJson.success) {
        const myHistory = historyJson.data.filter(h => h.driverId === driverId);
        setHistory(myHistory);
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();

    socket.on('driver_payout_settled', () => fetchWalletData());
    socket.on('payment_verified', () => fetchWalletData());

    return () => {
      socket.off('driver_payout_settled');
      socket.off('payment_verified');
    };
  }, []);

  const handleRequestPayout = async () => {
    const amount = Number(payoutAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!wallet || amount > wallet.balance) {
      alert('Insufficient balance');
      return;
    }

    setPayoutLoading(true);
    try {
      const res = await fetch('/api/payments/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId,
          amount,
          bankAccount: wallet?.bankAccount || '0012345678'
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(`Payout request of ₦${amount.toLocaleString()} submitted successfully!`);
        setPayoutAmount('');
        fetchWalletData();
      } else {
        alert('Payout request failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error processing payout request');
    } finally {
      setPayoutLoading(false);
    }
  };

  return (
    <div className="animate-in" style={{ padding: '20px' }}>
      <div className="page-header" style={{ padding: 0, marginBottom: '24px' }}>
        <div>
          <span className="text-sm">Earnings & Settlement</span>
          <h1 className="text-h1">Driver Wallet</h1>
        </div>
        <button 
          onClick={fetchWalletData} 
          className="btn btn-secondary btn-sm" 
          disabled={loading}
          style={{ padding: '8px' }}
        >
          Refresh
        </button>
      </div>

      {/* Balance Card */}
      <div className="glass glass-elevated" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(17, 24, 39, 0.9))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '12px', borderRadius: '12px' }}>
            <WalletIcon size={24} />
          </div>
          <div>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Available Balance</span>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '-1px' }}>
              ₦{wallet?.balance?.toLocaleString() || '0'}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Bank:</span> {wallet?.bankName || 'Access Bank'}
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Account:</span> ****{wallet?.bankAccount?.slice(-4) || '5678'}
          </div>
        </div>
      </div>

      {/* Payout Request Section */}
      <div className="glass" style={{ padding: '20px', marginBottom: '24px' }}>
        <h3 className="text-h3" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpRight size={18} style={{ color: 'var(--accent-primary)' }} />
          Request Payout
        </h3>
        <p className="text-body" style={{ fontSize: '13px', marginBottom: '16px' }}>
          Withdraw your earnings to your registered bank account. Payouts are processed within 24-48 hours.
        </p>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number"
            className="input-field"
            placeholder="Enter amount (₦)"
            value={payoutAmount}
            onChange={e => setPayoutAmount(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary"
            onClick={handleRequestPayout}
            disabled={payoutLoading || !payoutAmount}
            style={{ minWidth: '120px' }}
          >
            {payoutLoading ? 'Processing...' : 'Withdraw'}
          </button>
        </div>
        
        {wallet && (
          <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Maximum withdrawable: ₦{wallet.balance.toLocaleString()}
          </div>
        )}
      </div>

      {/* Payment History */}
      <h3 className="text-h3" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={18} style={{ color: 'var(--text-muted)' }} />
        Transaction History ({history.length})
      </h3>

      {history.length === 0 ? (
        <div className="glass" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CreditCard size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.6 }} />
          No transaction history yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map((tx, idx) => (
            <div key={idx} className="glass" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    background: tx.type === 'credit' ? 'var(--accent-light)' : 'var(--danger-light)',
                    color: tx.type === 'credit' ? 'var(--accent-primary)' : 'var(--danger)',
                    padding: '8px',
                    borderRadius: '10px'
                  }}>
                    {tx.type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <div className="text-sm" style={{ fontWeight: 600 }}>{tx.description || 'Ride Earning'}</div>
                    <div className="text-sm" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {tx.date || new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontWeight: 700, 
                    fontSize: '16px',
                    color: tx.type === 'credit' ? 'var(--accent-primary)' : 'var(--danger)'
                  }}>
                    {tx.type === 'credit' ? '+' : '-'}₦{tx.amount?.toLocaleString() || '0'}
                  </div>
                  <span className={`badge ${tx.status === 'completed' ? 'badge-success' : tx.status === 'pending' ? 'badge-warning' : 'badge-muted'}`} style={{ fontSize: '9px' }}>
                    {tx.status || 'completed'}
                  </span>
                </div>
              </div>
              
              {tx.rideId && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Ride ID: {tx.rideId}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
