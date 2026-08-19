import React, { useState } from 'react';
import { Star, Heart, Check, X, ThumbsUp, DollarSign, Sparkles } from 'lucide-react';

const COMPLIMENTS = [
  { id: 'clean', label: '✨ Clean Car' },
  { id: 'polite', label: '🤝 Polite & Courteous' },
  { id: 'ac', label: '❄️ Great AC' },
  { id: 'smooth', label: '🚗 Smooth Driving' },
  { id: 'route', label: '🗺️ Fast Route' },
  { id: 'music', label: '🎵 Good Music' }
];

const TIP_AMOUNTS = [0, 200, 500, 1000, 2000];

const TripRatingModal = ({ ride, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [selectedCompliments, setSelectedCompliments] = useState(['clean', 'polite']);
  const [selectedTip, setSelectedTip] = useState(500);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const driverName = ride?.driverName || 'Ibrahim Danladi';
  const fare = ride?.fare || 2500;
  const rideId = ride?.id || 'ride_101';

  const toggleCompliment = (id) => {
    if (selectedCompliments.includes(id)) {
      setSelectedCompliments(selectedCompliments.filter(c => c !== id));
    } else {
      setSelectedCompliments([...selectedCompliments, id]);
    }
  };

  const handleSubmitRating = async () => {
    setLoading(true);
    try {
      await fetch(`/api/rides/${rideId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          compliments: selectedCompliments,
          tipAmount: selectedTip,
          comment
        })
      });
      setSubmitted(true);
      setTimeout(() => {
        if (onSubmit) onSubmit({ rating, selectedTip });
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Rating submit err:', err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
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
      padding: '16px'
    }}>
      <div className="glass-panel-elevated animate-slide-up" style={{
        width: '100%',
        maxWidth: '390px',
        padding: '24px',
        borderRadius: '24px',
        textAlign: 'center',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={16} />
        </button>

        {submitted ? (
          <div style={{ padding: '24px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255, 212, 40, 0.2)',
              color: 'var(--aber-yellow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '2px solid var(--aber-yellow)'
            }}>
              <Heart size={32} fill="var(--aber-yellow)" />
            </div>
            <h2 className="text-h2" style={{ color: '#FFFFFF', marginBottom: '6px' }}>Thank You!</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your feedback & tip of ₦{selectedTip.toLocaleString()} has been sent to {driverName}.
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--bg-surface-elevated)',
              border: '2.5px solid var(--aber-yellow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: 'var(--aber-yellow)'
            }}>
              <ThumbsUp size={28} />
            </div>

            <span className="badge-pill badge-green" style={{ marginBottom: '6px' }}>
              Trip Completed
            </span>
            <h2 className="text-h2" style={{ color: '#FFFFFF', margin: '4px 0 2px' }}>How was your ride?</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              with {driverName} • ₦{fare.toLocaleString()}
            </p>

            {/* Star Rating Selector */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transform: rating >= star ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    padding: '4px'
                  }}
                >
                  <Star 
                    size={32} 
                    color={rating >= star ? '#FFD428' : 'rgba(255,255,255,0.2)'} 
                    fill={rating >= star ? '#FFD428' : 'transparent'} 
                  />
                </button>
              ))}
            </div>

            {/* Compliments Tags */}
            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Give a Compliment
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {COMPLIMENTS.map(c => {
                  const isSelected = selectedCompliments.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCompliment(c.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '12px',
                        background: isSelected ? 'rgba(255, 212, 40, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1px solid var(--aber-yellow)' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isSelected ? 'var(--aber-yellow)' : 'var(--text-secondary)',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Driver Tip Selection */}
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '8px' }}>
                Add Driver Tip (Optional)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {TIP_AMOUNTS.map(amt => {
                  const isSelected = selectedTip === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSelectedTip(amt)}
                      style={{
                        padding: '8px 2px',
                        borderRadius: '10px',
                        background: isSelected ? 'var(--aber-yellow)' : 'rgba(255, 255, 255, 0.04)',
                        border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isSelected ? '#0E131F' : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {amt === 0 ? 'None' : `₦${amt}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Textarea */}
            <textarea
              placeholder="Leave a friendly note for the driver (optional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '10px 12px',
                color: '#FFFFFF',
                fontSize: '12px',
                outline: 'none',
                marginBottom: '16px',
                resize: 'none'
              }}
            />

            <button
              className="btn-primary"
              onClick={handleSubmitRating}
              disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              {loading ? 'Submitting...' : `Submit Rating & ₦${selectedTip} Tip`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripRatingModal;
