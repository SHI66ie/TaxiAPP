import React, { useState, useEffect } from 'react';
import { Minus, Plus, Send, Check, X, Shield, Star, User, Clock, Radio, Zap } from 'lucide-react';
import { socket } from '../App';

const BiddingInterface = ({ 
  basePrice = 2500, 
  pickup, 
  destination, 
  onAccepted, 
  onCancel 
}) => {
  const [offer, setOffer] = useState(basePrice);
  const [activeBid, setActiveBid] = useState(null);
  const [counterOffers, setCounterOffers] = useState([]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [loading, setLoading] = useState(false);

  const increase = (amount = 100) => setOffer(prev => prev + amount);
  const decrease = (amount = 100) => setOffer(prev => Math.max(800, prev - amount));

  // Listen for driver counter-offers and bid status updates
  useEffect(() => {
    const handleCounter = (updatedBid) => {
      if (activeBid && updatedBid.id === activeBid.id) {
        setActiveBid(updatedBid);
        setCounterOffers(updatedBid.counterOffers || []);
      }
    };

    const handleBidAccepted = (result) => {
      if (activeBid && result.bid?.id === activeBid.id) {
        if (onAccepted) {
          onAccepted(result.ride || result.bid);
        }
      }
    };

    socket.on('driver_counter_offer_placed', handleCounter);
    socket.on('bid_accepted', handleBidAccepted);

    return () => {
      socket.off('driver_counter_offer_placed', handleCounter);
      socket.off('bid_accepted', handleBidAccepted);
    };
  }, [activeBid, onAccepted]);

  const handleBroadcastBid = async () => {
    setLoading(true);
    try {
      const payload = {
        passengerName: 'Amina Bello',
        passengerPhone: '+234 812 000 1111',
        pickupLocation: pickup?.name || 'Wuse II, Abuja',
        dropoffLocation: destination?.name || 'Central Business District',
        pickupCoords: pickup?.coords || { lat: 9.05785, lng: 7.49508 },
        dropoffCoords: destination?.coords || { lat: 9.0500, lng: 7.4800 },
        passengerOfferedPrice: offer,
        vehicleType: 'standard'
      };

      const res = await fetch('/api/bidding/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setActiveBid(json.data);
        setIsBroadcasting(true);
      }
    } catch (err) {
      console.error('Error broadcasting bid:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDriverCounter = async (driverId) => {
    if (!activeBid) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bidding/${activeBid.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId })
      });
      const json = await res.json();
      if (json.success) {
        if (onAccepted) {
          onAccepted(json.data.ride || json.data);
        }
      }
    } catch (err) {
      console.error('Error accepting bid:', err);
    } finally {
      setLoading(false);
    }
  };

  if (isBroadcasting) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'rgba(255, 212, 40, 0.15)', 
            border: '2px solid var(--aber-yellow)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 12px',
            color: 'var(--aber-yellow)'
          }} className="pulse-yellow">
            <Radio size={30} />
          </div>
          <span className="badge-pill badge-yellow" style={{ marginBottom: '6px' }}>
            Live Radar Broadcast
          </span>
          <h3 className="text-h3" style={{ fontSize: '20px', color: '#FFFFFF', margin: '4px 0' }}>
            Offered ₦{offer.toLocaleString()}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Broadcasting to Abuja drivers in Wuse II, Maitama & CBD...
          </p>
        </div>

        {/* Counter Offers list */}
        {counterOffers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Driver Counter-Offers ({counterOffers.length})
              </span>
            </div>
            {counterOffers.map((counter, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 212, 40, 0.3)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '50%', 
                    background: 'var(--bg-surface-elevated)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--aber-yellow)'
                  }}>
                    <User size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#FFFFFF' }}>
                      {counter.driverName}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={12} color="#FFD428" fill="#FFD428" />
                      <span style={{ color: '#FFFFFF', fontWeight: '600' }}>4.9</span> • 3 mins away
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--aber-yellow)' }}>
                    ₦{counter.counterPrice?.toLocaleString()}
                  </div>
                  <button 
                    className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: '13px', width: 'auto' }}
                    onClick={() => handleAcceptDriverCounter(counter.driverId)}
                    disabled={loading}
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            padding: '16px', 
            background: 'rgba(255, 255, 255, 0.02)', 
            borderRadius: '14px', 
            textAlign: 'center', 
            fontSize: '13px', 
            color: 'var(--text-muted)',
            border: '1px dashed rgba(255, 255, 255, 0.08)'
          }}>
            Drivers nearby are receiving your bid in real time...
          </div>
        )}

        <button 
          className="btn-secondary" 
          onClick={onCancel}
          style={{ width: '100%', padding: '12px' }}
        >
          Cancel Bidding
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
          Aber P2P Fare Negotiation
        </span>
        <h2 className="text-h2" style={{ margin: '4px 0 12px', fontSize: '19px', color: '#FFFFFF' }}>
          Set Your Custom Price
        </h2>
        
        {/* Stepper Display */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '16px',
          background: 'rgba(14, 19, 31, 0.65)',
          padding: '16px',
          borderRadius: '18px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button 
            onClick={() => decrease(100)}
            style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '50%', 
              background: 'var(--bg-surface-elevated)', 
              border: '1px solid rgba(255,255,255,0.12)', 
              color: '#FFFFFF', 
              fontSize: '20px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <Minus size={20} />
          </button>
          
          <h1 className="text-h1" style={{ fontSize: '36px', color: 'var(--aber-yellow)', margin: 0, fontWeight: '800' }}>
            ₦{offer.toLocaleString()}
          </h1>
          
          <button 
            onClick={() => increase(100)}
            style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '50%', 
              background: 'var(--bg-surface-elevated)', 
              border: '1px solid rgba(255,255,255,0.12)', 
              color: '#FFFFFF', 
              fontSize: '20px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Quick Increment Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
          {[+100, +200, +500, +1000].map(bump => (
            <button
              key={bump}
              onClick={() => increase(bump)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                background: 'rgba(255, 212, 40, 0.1)',
                border: '1px solid rgba(255, 212, 40, 0.3)',
                color: 'var(--aber-yellow)',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              +{bump >= 1000 ? `₦1k` : `₦${bump}`}
            </button>
          ))}
        </div>

        <p className="text-sm" style={{ marginTop: '10px', color: 'var(--text-muted)', fontSize: '11px' }}>
          Standard benchmark: <strong style={{ color: '#FFFFFF' }}>₦{basePrice.toLocaleString()}</strong> (closer offers match faster)
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button className="btn-secondary" onClick={onCancel} style={{ flex: 1, padding: '12px' }}>
          Back
        </button>
        <button 
          className="btn-primary" 
          onClick={handleBroadcastBid}
          disabled={loading}
          style={{ flex: 2, padding: '12px' }}
        >
          {loading ? 'Broadcasting...' : `Broadcast ₦${offer.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
};

export default BiddingInterface;

