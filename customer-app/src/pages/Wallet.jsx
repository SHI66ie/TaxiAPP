import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, Tag, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { socket } from '../App';

const Wallet = () => {
  const [balance, setBalance] = useState(12500);
  const [transactions, setTransactions] = useState([
    { id: 'tx_101', type: 'TOPUP', title: 'Paystack Card Top-up', amount: 10000, date: 'Today, 10:15 AM', status: 'SUCCESS' },
    { id: 'tx_102', type: 'RIDE', title: 'Trip to Central Bank CBD', amount: -2600, date: 'Yesterday, 4:30 PM', status: 'SUCCESS' },
    { id: 'tx_103', type: 'CARPOOL', title: 'Carpool Split Savings Refund', amount: 1200, date: '18 Aug, 1:12 PM', status: 'SUCCESS' },
    { id: 'tx_104', type: 'RIDE', title: 'Trip to Maitama Hospital', amount: -3100, date: '17 Aug, 8:45 AM', status: 'SUCCESS' }
  ]);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState(5000);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTopup = async () => {
    setLoading(true);
    try {
      // Initialize Paystack checkout via backend
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: topupAmount,
          customerEmail: 'amina.bello@example.com',
          paymentMethod: 'Paystack Card Checkout'
        })
      });
      const json = await res.json();
      
      // Credit balance
      setBalance(prev => prev + topupAmount);
      setTransactions(prev => [
        {
          id: `tx_${Date.now()}`,
          type: 'TOPUP',
          title: 'Paystack Instant Top-up',
          amount: topupAmount,
          date: 'Just now',
          status: 'SUCCESS'
        },
        ...prev
      ]);
      setShowTopupModal(false);
    } catch (err) {
      console.error('Topup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'ABUJA50' || promoCode.trim().toUpperCase() === 'TAXI2026') {
      setPromoMessage({ type: 'success', text: '🎉 ₦2,000 Abuja Commute Voucher Applied!' });
      setBalance(prev => prev + 2000);
      setTransactions(prev => [
        {
          id: `tx_${Date.now()}`,
          type: 'TOPUP',
          title: 'Promo Voucher (ABUJA50)',
          amount: 2000,
          date: 'Just now',
          status: 'SUCCESS'
        },
        ...prev
      ]);
      setPromoCode('');
    } else {
      setPromoMessage({ type: 'error', text: 'Invalid promo code. Try "ABUJA50" or "TAXI2026"' });
    }
  };

  return (
    <div style={{ padding: '20px', paddingBottom: 'calc(var(--nav-height) + 24px)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Abuja Digital Cash & Card</span>
        <h1 className="text-h1" style={{ fontSize: '24px', margin: 0 }}>Wallet</h1>
      </div>

      {/* Main Balance Card */}
      <div 
        className="glass-panel animate-scale" 
        style={{ 
          padding: '24px', 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1))',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '16px',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Available Balance
            </span>
            <h2 className="text-h1" style={{ fontSize: '32px', color: 'var(--accent-primary)', margin: '6px 0 0' }}>
              ₦{balance.toLocaleString()}
            </h2>
          </div>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            background: 'rgba(16, 185, 129, 0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}>
            <CreditCard size={24} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <ShieldCheck size={16} color="var(--accent-primary)" />
          <span>Protected by Paystack & CBN Compliant Gateway</span>
        </div>

        <button 
          className="btn-primary" 
          onClick={() => setShowTopupModal(true)}
          style={{ width: '100%', marginTop: '20px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Add Funds to Wallet
        </button>
      </div>

      {/* Promo Code Section */}
      <div className="glass-panel" style={{ padding: '16px', borderRadius: '14px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Tag size={16} color="var(--accent-gold)" />
          <span style={{ fontSize: '13px', fontWeight: '600' }}>Have a Promo Code?</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Try code: ABUJA50" 
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '10px 12px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
              textTransform: 'uppercase'
            }}
          />
          <button 
            className="btn-secondary"
            onClick={handleApplyPromo}
            disabled={!promoCode.trim()}
            style={{ padding: '10px 16px', fontSize: '13px' }}
          >
            Apply
          </button>
        </div>
        {promoMessage && (
          <div style={{ 
            marginTop: '8px', 
            fontSize: '12px', 
            color: promoMessage.type === 'success' ? 'var(--accent-primary)' : 'var(--danger)',
            fontWeight: '500'
          }}>
            {promoMessage.text}
          </div>
        )}
      </div>

      {/* Transaction History */}
      <h3 className="text-h3" style={{ fontSize: '16px', marginBottom: '12px' }}>Transaction History</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {transactions.map(tx => {
          const isPositive = tx.amount > 0;
          return (
            <div 
              key={tx.id}
              className="glass-panel"
              style={{ 
                padding: '14px 16px', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: isPositive ? 'var(--accent-primary)' : 'var(--danger)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  {isPositive ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {tx.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {tx.date}
                  </div>
                </div>
              </div>

              <div style={{ 
                fontSize: '15px', 
                fontWeight: '700', 
                color: isPositive ? 'var(--accent-primary)' : 'var(--text-primary)' 
              }}>
                {isPositive ? `+₦${tx.amount.toLocaleString()}` : `-₦${Math.abs(tx.amount).toLocaleString()}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Topup Modal */}
      {showTopupModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '380px', padding: '24px' }}>
            <h2 className="text-h2" style={{ marginBottom: '8px', fontSize: '20px' }}>Top-up Wallet</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              Select an amount to fund your Abuja Express account via Paystack.
            </p>

            {/* Quick Amount Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {[2000, 5000, 10000, 20000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setTopupAmount(amt)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: topupAmount === amt ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
                    background: topupAmount === amt ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                    color: topupAmount === amt ? 'var(--accent-primary)' : 'var(--text-primary)',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  ₦{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setShowTopupModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleTopup}
                disabled={loading}
                style={{ flex: 1.5 }}
              >
                {loading ? 'Processing...' : `Pay ₦${topupAmount.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
