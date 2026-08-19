import React, { useState, useEffect } from 'react';
import { Minus, Plus, Send, Check, X, Shield, Star, User, Clock, Radio } from 'lucide-react';
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

  const increase = () => setOffer(prev => prev + 100);
  const decrease = () => setOffer(prev => Math.max(800, prev - 100));

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
        passengerName: 'Amina Bello (Customer)',
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
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div style={{ 
            width: '54px', 
            height: '54px', 
            borderRadius: '50%', 
            background: 'rgba(245, 158, 11, 0.15)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 12px',
            color: 'var(--accent-gold)'
          }}>
            <Radio size={28} className="pulse" />
          </div>
          <h3 className="text-h3" style={{ fontSize: '16px', marginBottom: '4px' }}>
            Broadcasting ₦{offer.toLocaleString()} Offer
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Awaiting Abuja drivers to accept or counter-pitch...
          </p>
        </div>

        {/* Counter Offers list */}
        {counterOffers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Incoming Driver Offers ({counterOffers.length})
            </span>
            {counterOffers.map((counter, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '10px',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
                    {counter.driverName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    ⭐ 4.9 • 3 min away
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-gold)' }}>
                    ₦{counter.counterPrice?.toLocaleString()}
                  </div>
                  <button 
                    className="btn-primary"
                    style={{ padding: '8px 12px', fontSize: '12px' }}
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
            background: 'rgba(255,255,255,0.02)', 
            borderRadius: '10px', 
            textAlign: 'center', 
            fontSize: '12px', 
            color: 'var(--text-muted)' 
          }}>
            Drivers in Wuse II & CBD are viewing your bid.
          </div>
        )}

        <button 
          className="btn-secondary" 
          onClick={onCancel}
          style={{ width: '100%', padding: '10px' }}
        >
          Cancel Bidding
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ textAlign: 'center' }}>
        <p className="text-muted" style={{ marginBottom: '8px', fontSize: '13px' }}>
          Propose your fare for this trip
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <button 
            onClick={decrease}
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '50%', 
              background: 'var(--bg-surface-elevated)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: '#fff', 
              fontSize: '20px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Minus size={18} />
          </button>
          <h1 className="text-h1" style={{ fontSize: '36px', color: 'var(--accent-gold)', margin: 0 }}>
            ₦{offer.toLocaleString()}
          </h1>
          <button 
            onClick={increase}
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '50%', 
              background: 'var(--bg-surface-elevated)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: '#fff', 
              fontSize: '20px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Plus size={18} />
          </button>
        </div>
        <p className="text-sm" style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '11px' }}>
          Recommended benchmark: ₦{basePrice.toLocaleString()} (Drivers accept closer to benchmark)
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button className="btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
          Cancel
        </button>
        <button 
          className="btn-primary" 
          onClick={handleBroadcastBid}
          disabled={loading}
          style={{ flex: 2, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
        >
          {loading ? 'Broadcasting...' : `Broadcast ₦${offer.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
};

export default BiddingInterface;
