import React, { useState } from 'react';
import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, Tag, Sparkles, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

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
      setPromoMessage({ type: 'success', text: '🎉 ₦2,000 Aber Commute Voucher Credited!' });
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
    <div style={{ padding: '20px', paddingBottom: '90px', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
          Aber Payments & Pass
        </span>
        <h1 className="text-h1" style={{ fontSize: '24px', margin: 0, color: '#FFFFFF' }}>Wallet</h1>
      </div>

      {/* Aber Yellow Gold Card */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '24px', 
          background: 'linear-gradient(135deg, #FFD428 0%, #E6AC00 100%)',
          borderRadius: '22px',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 28px rgba(255, 212, 40, 0.35)',
          color: '#0E131F'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#3A3000', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '800' }}>
              Aber Virtual Balance
            </span>
            <h2 style={{ fontSize: '34px', color: '#0E131F', margin: '4px 0 0', fontWeight: '800', letterSpacing: '-0.5px' }}>
              ₦{balance.toLocaleString()}
            </h2>
          </div>
          <div style={{ 
            width: '46px', 
            height: '46px', 
            borderRadius: '14px', 
            background: 'rgba(14, 19, 31, 0.12)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#0E131F'
          }}>
            <CreditCard size={26} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px', fontSize: '12px', color: '#2A2200', fontWeight: '600' }}>
          <ShieldCheck size={16} />
          <span>Paystack Encrypted & CBN Compliant Gateway</span>
        </div>

        <button 
          onClick={() => setShowTopupModal(true)}
          style={{ 
            width: '100%', 
            marginTop: '18px', 
            padding: '13px', 
            borderRadius: '12px',
            background: '#0E131F',
            color: '#FFD428',
            border: 'none',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)'
          }}
        >
          <Plus size={18} /> Top-up Wallet Funds
        </button>
      </div>

      {/* Promo Code Section */}
      <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Tag size={16} color="var(--aber-yellow)" />
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>Commute Promo Code</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Try code: ABUJA50" 
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '10px 12px',
              color: '#FFFFFF',
              fontSize: '13px',
              outline: 'none',
              textTransform: 'uppercase',
              fontWeight: '600'
            }}
          />
          <button 
            className="btn-primary"
            onClick={handleApplyPromo}
            disabled={!promoCode.trim()}
            style={{ padding: '10px 18px', fontSize: '13px', width: 'auto' }}
          >
            Apply
          </button>
        </div>
        {promoMessage && (
          <div style={{ 
            marginTop: '8px', 
            fontSize: '12px', 
            color: promoMessage.type === 'success' ? 'var(--aber-yellow)' : 'var(--danger)',
            fontWeight: '600'
          }}>
            {promoMessage.text}
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 className="text-h3" style={{ fontSize: '16px', color: '#FFFFFF', margin: 0 }}>Transaction History</h3>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Latest {transactions.length} records</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {transactions.map(tx => {
          const isPositive = tx.amount > 0;
          return (
            <div 
              key={tx.id}
              className="glass-panel"
              style={{ 
                padding: '14px 16px', 
                borderRadius: '14px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '10px', 
                  background: isPositive ? 'rgba(255, 212, 40, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: isPositive ? 'var(--aber-yellow)' : 'var(--danger)',
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
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {tx.date}
                  </div>
                </div>
              </div>

              <div style={{ 
                fontSize: '15px', 
                fontWeight: '800', 
                color: isPositive ? 'var(--aber-yellow)' : '#FFFFFF' 
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
          background: 'rgba(0, 0, 0, 0.88)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel-elevated" style={{ width: '100%', maxWidth: '380px', padding: '24px' }}>
            <h2 className="text-h2" style={{ marginBottom: '6px', fontSize: '20px', color: '#FFFFFF' }}>Top-up Aber Wallet</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Select an amount to fund your Abuja commuter balance via Paystack.
            </p>

            {/* Quick Amount Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {[2000, 5000, 10000, 20000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setTopupAmount(amt)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: topupAmount === amt ? '2px solid var(--aber-yellow)' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: topupAmount === amt ? 'rgba(255, 212, 40, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: topupAmount === amt ? 'var(--aber-yellow)' : '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
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
                style={{ flex: 1, padding: '12px' }}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleTopup}
                disabled={loading}
                style={{ flex: 1.6, padding: '12px' }}
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

