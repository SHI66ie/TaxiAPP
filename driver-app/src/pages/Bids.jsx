import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle, Tag, TrendingUp } from 'lucide-react';
import { socket } from '../App';

export default function Bids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [counters, setCounters] = useState({}); // { bidId: counterValue }
  const driverId = 'drv_101';

  const fetchBids = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bidding');
      const json = await res.json();
      if (json.success) {
        // Show open bidding sessions or those accepted/countered by us
        setBids(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();

    socket.on('new_bid_created', () => fetchBids());
    socket.on('driver_counter_offer_placed', () => fetchBids());
    socket.on('bid_accepted', () => fetchBids());

    return () => {
      socket.off('new_bid_created');
      socket.off('driver_counter_offer_placed');
      socket.off('bid_accepted');
    };
  }, []);

  const handlePlaceCounter = async (bidId) => {
    const price = Number(counters[bidId]);
    if (!price || isNaN(price)) return;

    try {
      const res = await fetch(`/api/bidding/${bidId}/counter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId,
          counterPrice: price
        })
      });
      const json = await res.json();
      if (json.success) {
        setCounters(prev => ({ ...prev, [bidId]: '' }));
        fetchBids();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter open bids
  const openBids = bids.filter(b => b.status === 'OPEN');

  return (
    <div className="animate-in" style={{ padding: '20px' }}>
      <div className="page-header" style={{ padding: 0, marginBottom: '24px' }}>
        <div>
          <span className="text-sm">Real-time negotiations</span>
          <h1 className="text-h1">P2P Fare Bidding</h1>
        </div>
        <button 
          onClick={fetchBids} 
          className="btn btn-secondary btn-sm" 
          disabled={loading}
          style={{ padding: '8px' }}
        >
          Refresh
        </button>
      </div>

      <p className="text-body" style={{ fontSize: '13px', marginBottom: '20px' }}>
        Riders propose fares. Pitch your price proposal below. The client chooses based on price, rating, and ETA.
      </p>

      <h2 className="text-h2" style={{ marginBottom: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <MessageSquare size={18} style={{ color: 'var(--accent-primary)' }} />
        Live Price Requests ({openBids.length})
      </h2>

      {openBids.length === 0 ? (
        <div className="glass" style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No active price requests from commuters. When riders broadcast trips, they will appear here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {openBids.map(bid => {
            const hasMyCounter = bid.counterOffers?.some(o => o.driverId === driverId);
            const myCounterOffer = bid.counterOffers?.find(o => o.driverId === driverId);

            return (
              <div key={bid.id} className="glass" style={{ padding: '16px', borderLeft: hasMyCounter ? '4px solid var(--info)' : '4px solid var(--warning)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 className="text-h3" style={{ fontSize: '14px' }}>{bid.passengerName}</h3>
                    <div className="text-sm" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      📍 {bid.pickupLocation} ➔ {bid.dropoffLocation}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="text-sm" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Rider's Offer:</span>
                    <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--warning)' }}>
                      ₦{bid.passengerOfferedPrice?.toLocaleString()}
                    </div>
                  </div>
                </div>

                {bid.counterOffers && bid.counterOffers.length > 0 && (
                  <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}>
                      Active Driver Counters ({bid.counterOffers.length})
                    </span>
                    {bid.counterOffers.map((offer, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                        <span style={{ color: offer.driverId === driverId ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                          {offer.driverName} {offer.driverId === driverId && '(You)'}
                        </span>
                        <span style={{ fontWeight: 700 }}>₦{offer.counterPrice?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Offer Input Section */}
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="Enter Counter Fare (₦)"
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                    value={counters[bid.id] || ''}
                    onChange={e => setCounters({ ...counters, [bid.id]: e.target.value })}
                    disabled={bid.status === 'ACCEPTED'}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ padding: '8px 16px', fontSize: '13px', background: 'var(--bg-surface-elevated)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                    onClick={() => handlePlaceCounter(bid.id)}
                    disabled={bid.status === 'ACCEPTED'}
                  >
                    <Send size={14} style={{ marginRight: '4px', display: 'inline' }} /> Pitch
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
