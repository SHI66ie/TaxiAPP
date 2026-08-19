import React, { useState, useEffect } from 'react';
import { Car, Zap, Users, Bike, Check, CreditCard, Wallet, Banknote, Sparkles } from 'lucide-react';

const FleetSelector = ({ 
  pickup, 
  destination, 
  onSelect, 
  initialSelected = 'standard',
  selectedPayment = 'Paystack',
  onPaymentChange
}) => {
  const [selected, setSelected] = useState(initialSelected);
  const [estimates, setEstimates] = useState({});
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(selectedPayment);

  useEffect(() => {
    if (!pickup?.coords || !destination?.coords) return;

    const fetchFares = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/fare/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pickupCoords: pickup.coords,
            dropoffCoords: destination.coords,
            vehicleType: 'standard'
          })
        });
        const json = await res.json();
        if (json.success) {
          const baseEst = json.data.estimatedFare || 2500;
          setEstimates({
            lite: Math.round(baseEst * 0.85 / 50) * 50,
            standard: baseEst,
            comfort: Math.round(baseEst * 1.35 / 50) * 50,
            carpool: Math.round(baseEst * 0.60 / 50) * 50, // 40% discount for carpool!
            okada: Math.round(baseEst * 0.50 / 50) * 50
          });
        }
      } catch (err) {
        console.error('Fare estimation error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFares();
  }, [pickup, destination]);

  const categories = [
    { 
      id: 'standard', 
      name: 'Aber Standard', 
      icon: Car, 
      price: estimates.standard ? `₦${estimates.standard.toLocaleString()}` : '₦2,500', 
      numericPrice: estimates.standard || 2500,
      time: '3 min', 
      seats: '4 seats',
      desc: 'Top-rated, clean sedans',
      badge: 'Popular',
      badgeClass: 'badge-yellow',
      color: '#FFD428' 
    },
    { 
      id: 'carpool', 
      name: 'Aber Carpool', 
      icon: Users, 
      price: estimates.carpool ? `₦${estimates.carpool.toLocaleString()}` : '₦1,500', 
      numericPrice: estimates.carpool || 1500,
      time: '5 min', 
      seats: 'Shared',
      desc: 'Match route & save 40%',
      badge: 'Save 40%',
      badgeClass: 'badge-orange',
      color: '#FF8900' 
    },
    { 
      id: 'comfort', 
      name: 'Aber Comfort', 
      icon: Zap, 
      price: estimates.comfort ? `₦${estimates.comfort.toLocaleString()}` : '₦3,500', 
      numericPrice: estimates.comfort || 3500,
      time: '4 min', 
      seats: '4 seats',
      desc: 'AC & Executive SUVs',
      badge: 'Premium',
      badgeClass: 'badge-green',
      color: '#10B981' 
    },
    { 
      id: 'lite', 
      name: 'Aber Lite', 
      icon: Car, 
      price: estimates.lite ? `₦${estimates.lite.toLocaleString()}` : '₦1,800', 
      numericPrice: estimates.lite || 1800,
      time: '5 min', 
      seats: '4 seats',
      desc: 'Budget-friendly daily commute',
      color: '#9DA8BE' 
    },
    { 
      id: 'okada', 
      name: 'Aber Express Bike', 
      icon: Bike, 
      price: estimates.okada ? `₦${estimates.okada.toLocaleString()}` : '₦1,100', 
      numericPrice: estimates.okada || 1100,
      time: '2 min', 
      seats: '1 seat',
      desc: 'Beat peak Abuja traffic',
      color: '#EC4899' 
    }
  ];

  const paymentOptions = [
    { id: 'Paystack', name: 'Paystack Card', icon: CreditCard, subtitle: 'Instant & Secure' },
    { id: 'Wallet', name: 'Abuja Wallet', icon: Wallet, subtitle: 'Bal: ₦12,500' },
    { id: 'Cash', name: 'Cash to Driver', icon: Banknote, subtitle: 'Pay on arrival' }
  ];

  const handleChoose = (cat) => {
    setSelected(cat.id);
    onSelect({ ...cat, paymentMethod });
  };

  const handlePaymentSelect = (pm) => {
    setPaymentMethod(pm.id);
    if (onPaymentChange) onPaymentChange(pm.id);
    const currCat = categories.find(c => c.id === selected) || categories[0];
    onSelect({ ...currCat, paymentMethod: pm.id });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Fleet Category Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '2px' }}>
        {categories.map(cat => {
          const isSelected = selected === cat.id;
          const Icon = cat.icon;
          return (
            <div 
              key={cat.id}
              onClick={() => handleChoose(cat)}
              style={{
                padding: '12px 14px',
                borderRadius: '16px',
                background: isSelected ? 'rgba(255, 212, 40, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: `1.5px solid ${isSelected ? '#FFD428' : 'rgba(255, 255, 255, 0.07)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isSelected ? '0 4px 16px rgba(255, 212, 40, 0.15)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '12px', 
                  background: isSelected ? 'var(--aber-yellow)' : 'var(--bg-surface-elevated)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: isSelected ? '#0E131F' : '#FFD428',
                  transition: 'all 0.2s ease'
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF' }}>{cat.name}</span>
                    {cat.badge && (
                      <span className={`badge-pill ${cat.badgeClass || 'badge-yellow'}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {cat.desc} • <span style={{ color: 'var(--text-secondary)' }}>{cat.time}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: isSelected ? 'var(--aber-yellow)' : '#FFFFFF' }}>
                  {cat.price}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                  {cat.seats}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Aber Payment Method Selector */}
      <div style={{ 
        background: 'rgba(14, 19, 31, 0.7)', 
        borderRadius: '14px', 
        padding: '10px 12px', 
        border: '1px solid rgba(255, 255, 255, 0.08)' 
      }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
          Payment Method
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {paymentOptions.map(pm => {
            const isPmSelected = paymentMethod === pm.id;
            const PmIcon = pm.icon;
            return (
              <button
                key={pm.id}
                type="button"
                onClick={() => handlePaymentSelect(pm)}
                style={{
                  padding: '8px 6px',
                  borderRadius: '10px',
                  background: isPmSelected ? 'rgba(255, 212, 40, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: isPmSelected ? '1px solid var(--aber-yellow)' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isPmSelected ? 'var(--aber-yellow)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <PmIcon size={16} />
                <span style={{ fontSize: '11px', fontWeight: '700', color: isPmSelected ? '#FFFFFF' : 'var(--text-secondary)' }}>{pm.name.split(' ')[0]}</span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{pm.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FleetSelector;

