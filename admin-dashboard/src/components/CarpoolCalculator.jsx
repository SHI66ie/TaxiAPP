import React, { useState } from 'react';
import { Sparkles, Users, TrendingDown, ArrowRight, Banknote } from 'lucide-react';


export default function CarpoolCalculator() {
  const [pickup1, setPickup1] = useState('Berger Junction, Abuja');
  const [dropoff1, setDropoff1] = useState('Nnamdi Azikiwe Airport');
  const [pickup2, setPickup2] = useState('Wuse Market, Abuja');
  const [dropoff2, setDropoff2] = useState('Lugbe Car Wash, Airport Rd');
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      // Mock coordinates for test corridors
      const trip1 = {
        pickupCoords: { lat: 9.0600, lng: 7.4600 },
        dropoffCoords: { lat: 9.0068, lng: 7.2631 },
        vehicleType: 'standard'
      };
      const trip2 = {
        pickupCoords: { lat: 9.0620, lng: 7.4720 },
        dropoffCoords: { lat: 9.0150, lng: 7.3200 },
        vehicleType: 'standard'
      };

      const res = await fetch('/api/carpool/match-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip1, trip2 })
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>👥 Abuja Split-Fare Carpooling Engine</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Simulate route overlap matching and cost-reduction for 2 commuters traveling along common corridors.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Passenger 1 Card */}
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(15, 20, 32, 0.6)' }}>
          <h4 style={{ color: 'var(--accent-emerald)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} /> Commuter A (Solo Fare ₦5,500)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PICKUP LOCATION</label>
              <input
                type="text"
                value={pickup1}
                onChange={e => setPickup1(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid var(--border-color)', background: '#0b0f19', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DROPOFF LOCATION</label>
              <input
                type="text"
                value={dropoff1}
                onChange={e => setDropoff1(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid var(--border-color)', background: '#0b0f19', color: '#fff' }}
              />
            </div>
          </div>
        </div>

        {/* Passenger 2 Card */}
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(15, 20, 32, 0.6)' }}>
          <h4 style={{ color: 'var(--accent-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} /> Commuter B (Solo Fare ₦4,000)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PICKUP LOCATION</label>
              <input
                type="text"
                value={pickup2}
                onChange={e => setPickup2(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid var(--border-color)', background: '#0b0f19', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DROPOFF LOCATION</label>
              <input
                type="text"
                value={dropoff2}
                onChange={e => setDropoff2(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid var(--border-color)', background: '#0b0f19', color: '#fff' }}
              />
            </div>
          </div>
        </div>
      </div>

      <button className="btn btn-gold" onClick={handleCalculate} disabled={loading} style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginBottom: '1.5rem' }}>
        <Sparkles size={20} /> {loading ? 'Calculating Route Overlap...' : 'Run Carpool Matching & Fare Split Algorithm'}
      </button>

      {/* Results View */}
      {result && (
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <span className="badge badge-success" style={{ fontSize: '0.9rem' }}>
                MATCH COMPATIBLE ({result.overlapScore}% Route Overlap)
              </span>
            </div>
            <div style={{ color: 'var(--accent-emerald)', fontWeight: 800, fontSize: '1.2rem' }}>
              Commuter Savings: {result.passenger1.discountPercent}% OFF
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 8 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Commuter A Shared Fare</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                ₦{result.passenger1.carpoolFare.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <s>₦{result.passenger1.originalFare.toLocaleString()}</s> (Saves ₦{result.passenger1.savingsNGN.toLocaleString()})
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 8 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Commuter B Shared Fare</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                ₦{result.passenger2.carpoolFare.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <s>₦{result.passenger2.originalFare.toLocaleString()}</s> (Saves ₦{result.passenger2.savingsNGN.toLocaleString()})
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 8 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Driver Earnings (Boosted!)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                ₦{result.combinedSummary.driverEarnings.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>
                +25% higher earnings than single trip!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
