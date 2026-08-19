import React, { useState, useEffect } from 'react';
import { Car, Zap, Users, Leaf, Bike, Check, Sparkles } from 'lucide-react';

const FleetSelector = ({ pickup, destination, onSelect, initialSelected = 'standard' }) => {
  const [selected, setSelected] = useState(initialSelected);
  const [estimates, setEstimates] = useState({});
  const [loading, setLoading] = useState(false);

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
      name: 'Standard Taxi', 
      icon: Car, 
      price: estimates.standard ? `₦${estimates.standard.toLocaleString()}` : '₦2,500', 
      numericPrice: estimates.standard || 2500,
      time: '3 min', 
      desc: 'Affordable, everyday rides',
      badge: 'Popular',
      color: '#10b981' 
    },
    { 
      id: 'carpool', 
      name: 'Carpool Split', 
      icon: Users, 
      price: estimates.carpool ? `₦${estimates.carpool.toLocaleString()}` : '₦1,500', 
      numericPrice: estimates.carpool || 1500,
      time: '6 min', 
      desc: 'Shared ride, save up to 40%',
      badge: 'Save 40%',
      badgeColor: '#f59e0b',
      color: '#f59e0b' 
    },
    { 
      id: 'comfort', 
      name: 'Comfort Exec', 
      icon: Zap, 
      price: estimates.comfort ? `₦${estimates.comfort.toLocaleString()}` : '₦3,500', 
      numericPrice: estimates.comfort || 3500,
      time: '4 min', 
      desc: 'AC & high-rated drivers',
      color: '#3b82f6' 
    },
    { 
      id: 'lite', 
      name: 'TaxiAPP Lite', 
      icon: Car, 
      price: estimates.lite ? `₦${estimates.lite.toLocaleString()}` : '₦1,800', 
      numericPrice: estimates.lite || 1800,
      time: '5 min', 
      desc: 'Budget-friendly compact',
      color: '#94a3b8' 
    },
    { 
      id: 'okada', 
      name: 'Express Bike', 
      icon: Bike, 
      price: estimates.okada ? `₦${estimates.okada.toLocaleString()}` : '₦1,100', 
      numericPrice: estimates.okada || 1100,
      time: '2 min', 
      desc: 'Beat Abuja peak traffic',
      color: '#ec4899' 
    }
  ];

  const handleChoose = (cat) => {
    setSelected(cat.id);
    onSelect(cat);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
        {categories.map(cat => {
          const isSelected = selected === cat.id;
          const Icon = cat.icon;
          return (
            <div 
              key={cat.id}
              onClick={() => handleChoose(cat)}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)',
                border: `1.5px solid ${isSelected ? cat.color : 'rgba(255,255,255,0.06)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '10px', 
                  background: 'var(--bg-surface-elevated)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: cat.color 
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{cat.name}</span>
                    {cat.badge && (
                      <span style={{ 
                        fontSize: '10px', 
                        padding: '1px 6px', 
                        borderRadius: '6px', 
                        background: cat.badgeColor ? `${cat.badgeColor}22` : 'rgba(16, 185, 129, 0.2)', 
                        color: cat.badgeColor || 'var(--accent-primary)',
                        fontWeight: '700'
                      }}>
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cat.desc} • {cat.time} away</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '15px', fontWeight: '800', color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                  {cat.price}
                </div>
                {cat.id === 'carpool' && (
                  <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: '600' }}>Co-rider match</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FleetSelector;
