import React, { useState } from 'react';
import { Gift, Copy, Check, X, Share2, Users, Sparkles } from 'lucide-react';

const InviteFriendsModal = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const referralCode = 'ABUJA-FREE1K';
  const shareUrl = `https://taxi-abuja.netlify.app/?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Join me on Taxi Abuja and get ₦1,000 off your first ride! Use my code: ${referralCode} at ${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
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
        maxWidth: '380px',
        padding: '24px',
        borderRadius: '24px',
        textAlign: 'center',
        position: 'relative'
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

        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(255, 212, 40, 0.15)',
          border: '2px solid var(--aber-yellow)',
          color: 'var(--aber-yellow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px'
        }}>
          <Gift size={32} />
        </div>

        <span className="badge-pill badge-yellow" style={{ marginBottom: '6px' }}>
          ₦1,000 Referral Reward
        </span>
        <h2 className="text-h2" style={{ color: '#FFFFFF', margin: '4px 0 6px' }}>Invite Friends, Earn Rides</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Share your referral code with Abuja commuters. When they complete their first trip, you both receive ₦1,000 wallet credits!
        </p>

        {/* Code Box */}
        <div style={{
          background: 'rgba(14, 19, 31, 0.8)',
          border: '1.5px dashed var(--aber-yellow)',
          borderRadius: '14px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Your Invite Code</span>
            <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '2px', color: 'var(--aber-yellow)' }}>
              {referralCode}
            </div>
          </div>
          <button
            onClick={handleCopy}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              background: copied ? '#10B981' : 'var(--bg-surface-elevated)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            className="btn-primary"
            onClick={handleShareWhatsApp}
            style={{ width: '100%', padding: '13px', background: '#25D366', color: '#FFFFFF' }}
          >
            <Share2 size={16} /> Share via WhatsApp
          </button>
          <button
            className="btn-secondary"
            onClick={handleCopy}
            style={{ width: '100%', padding: '12px' }}
          >
            Copy Referral Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsModal;
