import React, { useState } from 'react';
import { Banknote, Send, CheckCircle, UserCheck, RefreshCw, Sparkles, Tag, ShieldCheck } from 'lucide-react';


export default function InDriveBidding({ bids = [], onCreateBid, onAcceptBid, onCounterOffer }) {
  const [passengerName, setPassengerName] = useState('Bisi Akande');
  const [pickup, setPickup] = useState('Wuse Zone 4, Abuja');
  const [dropoff, setDropoff] = useState('Maitama Shopping Centre');
  const [offeredPrice, setOfferedPrice] = useState(1800);
  const [vehicleType, setVehicleType] = useState('standard');
  const [customCounter, setCustomCounter] = useState({});

  const handleSubmitNewBid = (e) => {
    e.preventDefault();
    onCreateBid({
      passengerName,
      passengerPhone: '+234 803 111 9988',
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      pickupCoords: { lat: 9.0650, lng: 7.4750 },
      dropoffCoords: { lat: 9.0820, lng: 7.4920 },
      vehicleType,
      passengerOfferedPrice: Number(offeredPrice),
      estimatedBasePrice: Number(offeredPrice) + 400
    });
  };

  const handleDriverCounter = (bidId) => {
    const amount = customCounter[bidId];
    if (!amount) return;
    onCounterOffer(bidId, 'drv_101', amount);
    setCustomCounter(prev => ({ ...prev, [bidId]: '' }));
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--accent-gold)' }}>🤝</span> TaxiAPP Real-Time Bidding Engine
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Passengers propose custom fares, drivers place counter-bids, and riders select preferred offers by price & driver rating — powered by TaxiAPP's peer-to-peer negotiation engine.
          </p>
        </div>
        <span className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}>
          <Sparkles size={14} style={{ display: 'inline', marginRight: 4 }} /> P2P Negotiation Active
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Create Bid Card */}
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.6)' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>
            🙋‍♂️ Submit Passenger Ride & Price Proposal
          </h3>
          <form onSubmit={handleSubmitNewBid} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Passenger Name</label>
              <input
                type="text"
                className="input-field"
                value={passengerName}
                onChange={e => setPassengerName(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pickup Location</label>
              <input
                type="text"
                className="input-field"
                value={pickup}
                onChange={e => setPickup(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Destination</label>
              <input
                type="text"
                className="input-field"
                value={dropoff}
                onChange={e => setDropoff(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vehicle Class</label>
                <select
                  className="input-field"
                  value={vehicleType}
                  onChange={e => setVehicleType(e.target.value)}
                >
                  <option value="standard">Standard Sedan</option>
                  <option value="comfort">Executive Comfort</option>
                  <option value="lite">Economy Lite</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Your Offered Fare (₦)</label>
                <input
                  type="number"
                  className="input-field"
                  value={offeredPrice}
                  onChange={e => setOfferedPrice(e.target.value)}
                  step="50"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <Send size={16} /> Broadcast Price Offer to Drivers
            </button>
          </form>
        </div>

        {/* Active Bids Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--accent-cyan)' }}>
            📡 Live Active Price Negotiations ({bids.length})
          </h3>

          {bids.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No active bidding sessions. Broadcast a new proposal above!
            </div>
          ) : (
            bids.map((bid) => (
              <div key={bid.id} className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(20, 26, 43, 0.8)', borderLeft: bid.status === 'ACCEPTED' ? '4px solid var(--accent-emerald)' : '4px solid var(--accent-gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <strong style={{ fontSize: '1.05rem' }}>{bid.passengerName}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      📍 {bid.pickupLocation} → {bid.dropoffLocation}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                      Offered ₦{bid.passengerOfferedPrice?.toLocaleString()}
                    </div>
                    <span className={`badge ${bid.status === 'ACCEPTED' ? 'badge-success' : 'badge-warning'}`}>
                      {bid.status}
                    </span>
                  </div>
                </div>

                {/* Driver Counter Offers */}
                <div style={{ marginTop: '0.75rem', background: 'rgba(10, 14, 24, 0.6)', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Incoming Driver Bids ({bid.counterOffers?.length || 0})
                  </div>

                  {bid.counterOffers?.map((offer, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: idx !== bid.counterOffers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          🚕 {offer.driverName} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>⭐ {offer.driverRating}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {offer.driverVehicle} · ETA {offer.etaMinutes} mins
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>
                          ₦{offer.counterPrice?.toLocaleString()}
                        </span>
                        {bid.status !== 'ACCEPTED' && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => onAcceptBid(bid.id, offer.driverId)}
                          >
                            <CheckCircle size={12} /> Accept Bid
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {bid.status !== 'ACCEPTED' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                      <input
                        type="number"
                        className="input-field"
                        placeholder="Simulate Counter Offer (₦)"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                        value={customCounter[bid.id] || ''}
                        onChange={e => setCustomCounter({ ...customCounter, [bid.id]: e.target.value })}
                        step="50"
                      />
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        onClick={() => handleDriverCounter(bid.id)}
                      >
                        Submit Counter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
