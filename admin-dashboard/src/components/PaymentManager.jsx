import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, Landmark, ArrowUpRight, CheckCircle, RefreshCw, ShieldCheck, ExternalLink, Send } from 'lucide-react';

export default function PaymentManager() {
  const [methods, setMethods] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [payoutAmount, setPayoutAmount] = useState(5000);
  const [selectedGateway, setSelectedGateway] = useState('paystack');
  const [payAmount, setPayAmount] = useState(3500);
  const [passengerEmail, setPassengerEmail] = useState('commuter@abuja.ng');
  const [initResult, setInitResult] = useState(null);
  const [payoutSuccess, setPayoutSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPaymentData = async () => {
    try {
      const [resM, resW, resH] = await Promise.all([
        fetch('/api/payments/methods'),
        fetch('/api/payments/wallets'),
        fetch('/api/payments/history')
      ]);
      const dataM = await resM.json();
      const dataW = await resW.json();
      const dataH = await resH.json();

      if (dataM.success) setMethods(dataM.data);
      if (dataW.success) {
        setWallets(dataW.data);
        if (dataW.data.length > 0 && !selectedDriver) {
          setSelectedDriver(dataW.data[0].driverId);
        }
      }
      if (dataH.success) setHistory(dataH.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const handleTestCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: payAmount,
          email: passengerEmail,
          channel: selectedGateway,
          passengerName: 'Abuja Commuter'
        })
      });
      const data = await res.json();
      if (data.success) {
        setInitResult(data.data);
        fetchPaymentData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTx = async (ref) => {
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref })
      });
      const data = await res.json();
      if (data.success) {
        setInitResult(null);
        fetchPaymentData();
        alert(`✅ Payment Verified & Settled via ${data.data.gateway}! Transaction Reference: ${data.data.reference}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDriverPayout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/payments/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: selectedDriver,
          amount: payoutAmount
        })
      });
      const data = await res.json();
      if (data.success) {
        setPayoutSuccess(data.data);
        fetchPaymentData();
      } else {
        alert(`Payout Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentDriverWallet = wallets.find(w => w.driverId === selectedDriver);

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--accent-emerald)' }}>💳</span> Nigerian Payments & NIBSS Driver Settlement Engine
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Paystack & Flutterwave Checkout integration, USSD (*737#), and Instant NIBSS Bank Payouts in Naira (₦).
          </p>
        </div>
        <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}>
          <ShieldCheck size={16} style={{ display: 'inline', marginRight: 4 }} /> Paystack & NIBSS Live Ready
        </span>
      </div>

      {/* Active Channels Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {methods.map((method) => (
          <div key={method.id} className="glass-panel" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.6)', borderLeft: '4px solid var(--accent-emerald)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-emerald)' }}>{method.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{method.desc}</div>
            <span className="badge badge-success" style={{ marginTop: '0.6rem', fontSize: '0.7rem' }}>
              {method.status}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Rider Checkout Terminal */}
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.7)' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>
            🛍️ Simulate Passenger Fare Payment (₦)
          </h3>
          <form onSubmit={handleTestCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Payment Gateway</label>
              <select
                className="input-field"
                value={selectedGateway}
                onChange={e => setSelectedGateway(e.target.value)}
              >
                <option value="paystack">Paystack Nigeria (Card, USSD, Transfer)</option>
                <option value="flutterwave">Flutterwave (NIBSS Instant & Mobile Money)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Passenger Email</label>
              <input
                type="email"
                className="input-field"
                value={passengerEmail}
                onChange={e => setPassengerEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Trip Fare Amount (₦)</label>
              <input
                type="number"
                className="input-field"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                step="100"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', background: 'linear-gradient(135deg, #10b981, #059669)' }} disabled={loading}>
              <CreditCard size={16} /> Initialize Gateway Checkout
            </button>
          </form>

          {initResult && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(10, 14, 24, 0.8)', borderRadius: '8px', border: '1px solid var(--accent-emerald)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-emerald)', marginBottom: '0.4rem' }}>
                💳 Gateway Initialized! (Ref: {initResult.transaction.reference})
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <strong>Virtual Wema Bank Acc:</strong> {initResult.virtualAccountNumber}<br/>
                <strong>USSD Code:</strong> <code style={{ color: 'var(--accent-gold)' }}>{initResult.ussdCode}</code>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.8rem' }}
                onClick={() => handleVerifyTx(initResult.transaction.reference)}
              >
                <CheckCircle size={14} /> Confirm & Verify Instant Payment
              </button>
            </div>
          )}
        </div>

        {/* Driver NIBSS Instant Payout Terminal */}
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.7)' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--accent-cyan)' }}>
            🏦 Driver NIBSS Direct Bank Payout (₦)
          </h3>
          <form onSubmit={handleDriverPayout} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Select Driver</label>
              <select
                className="input-field"
                value={selectedDriver}
                onChange={e => setSelectedDriver(e.target.value)}
              >
                {wallets.map(w => (
                  <option key={w.driverId} value={w.driverId}>
                    {w.driverName} — ₦{w.balance.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {currentDriverWallet && (
              <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '6px' }}>
                <div><strong>Bank:</strong> {currentDriverWallet.bankName}</div>
                <div><strong>Account:</strong> {currentDriverWallet.accountNumber}</div>
                <div style={{ color: 'var(--accent-emerald)', fontWeight: 700, marginTop: '0.25rem' }}>
                  Available Balance: ₦{currentDriverWallet.balance.toLocaleString()}
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Payout Transfer Amount (₦)</label>
              <input
                type="number"
                className="input-field"
                value={payoutAmount}
                onChange={e => setPayoutAmount(e.target.value)}
                step="500"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }} disabled={loading}>
              <Send size={16} /> Execute NIBSS Bank Transfer
            </button>
          </form>

          {payoutSuccess && (
            <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '8px', border: '1px solid var(--accent-cyan)', fontSize: '0.8rem' }}>
              <strong style={{ color: 'var(--accent-cyan)' }}>✅ NIBSS Transfer Settled!</strong><br/>
              Ref: {payoutSuccess.nibssReference}<br/>
              Transferred ₦{payoutSuccess.amount.toLocaleString()} to {payoutSuccess.bankName} ({payoutSuccess.accountNumber})
            </div>
          )}
        </div>
      </div>

      {/* Payment History Table */}
      <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
        📜 Recent Payment Settlements in Naira (₦)
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.75rem' }}>Passenger & Ride</th>
              <th style={{ padding: '0.75rem' }}>Gateway</th>
              <th style={{ padding: '0.75rem' }}>Payment Channel</th>
              <th style={{ padding: '0.75rem' }}>Amount (₦)</th>
              <th style={{ padding: '0.75rem' }}>Reference</th>
              <th style={{ padding: '0.75rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((tx) => (
              <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.75rem' }}>
                  <strong>{tx.passengerName}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.rideId}</div>
                </td>
                <td style={{ padding: '0.75rem' }}>{tx.gateway}</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{tx.channel}</td>
                <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  ₦{tx.amount?.toLocaleString()}
                </td>
                <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>{tx.reference}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span className={`badge ${tx.status === 'SUCCESS' ? 'badge-success' : 'badge-warning'}`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
