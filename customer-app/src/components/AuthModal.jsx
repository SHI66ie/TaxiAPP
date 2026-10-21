import React, { useState } from 'react';
import { User, Car, Lock, Phone, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('rider'); // 'rider' (passenger) | 'driver' (captain)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    vehicleModel: '',
    vehiclePlate: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      name: formData.name || (formData.phone ? `User ${formData.phone.slice(-4)}` : 'Amina Bello'),
      phone: formData.phone || '+234 812 000 1111',
      email: formData.email || 'user@taxiapp.ng',
      role, // 'rider' or 'driver'
      vehicle: role === 'driver' ? `${formData.vehicleModel || 'Toyota Corolla'} (${formData.vehiclePlate || 'ABJ-123-AA'})` : null
    };
    login(userData);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 15, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div className="animate-slide-up" style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#131927',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #FFD428, #FFA000)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 8px 24px rgba(255, 212, 40, 0.35)'
          }}>
            <Car size={28} color="#0E131F" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {mode === 'login' 
              ? 'Sign in to book rides & track Abuja corridors' 
              : 'Join Abuja Express Taxi Platform'}
          </p>
        </div>

        {/* Role Selector: Rider vs Driver */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '4px',
          borderRadius: '14px',
          marginBottom: '20px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <button
            type="button"
            onClick={() => setRole('rider')}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              background: role === 'rider' ? '#FFD428' : 'transparent',
              color: role === 'rider' ? '#0E131F' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <User size={16} /> Rider (Passenger)
          </button>

          <button
            type="button"
            onClick={() => setRole('driver')}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              background: role === 'driver' ? '#FFD428' : 'transparent',
              color: role === 'driver' ? '#0E131F' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Car size={16} /> Driver (Captain)
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 14px'
              }}>
                <User size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="e.g. Amina Bello"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#fff',
                    fontSize: '14px',
                    width: '100%'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
              Phone Number
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px 14px'
            }}>
              <Phone size={16} color="var(--text-muted)" />
              <input
                type="tel"
                placeholder="+234 812 000 1111"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '14px',
                  width: '100%'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px 14px'
            }}>
              <Lock size={16} color="var(--text-muted)" />
              <input
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '14px',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* Extra fields for Driver Registration */}
          {role === 'driver' && mode === 'signup' && (
            <div style={{
              background: 'rgba(255, 212, 40, 0.05)',
              border: '1px dashed rgba(255, 212, 40, 0.3)',
              borderRadius: '14px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <span style={{ fontSize: '11px', color: '#FFD428', fontWeight: '700', textTransform: 'uppercase' }}>
                🚕 Vehicle Verification (Abuja Fleet)
              </span>
              <input
                type="text"
                placeholder="Vehicle Model (e.g. Toyota Corolla)"
                value={formData.vehicleModel}
                onChange={e => setFormData({ ...formData, vehicleModel: e.target.value })}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Plate Number (e.g. ABJ-482-AA)"
                value={formData.vehiclePlate}
                onChange={e => setFormData({ ...formData, vehiclePlate: e.target.value })}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '14px',
              fontSize: '15px',
              marginTop: '4px',
              boxShadow: '0 8px 20px rgba(255, 212, 40, 0.3)'
            }}
          >
            {mode === 'login' ? `Sign In as ${role === 'rider' ? 'Rider' : 'Driver'}` : `Register as ${role === 'rider' ? 'Rider' : 'Driver'}`}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Toggle mode */}
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {mode === 'login' ? "Don't have an account? " : "Already registered? "}
          <span
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{ color: '#FFD428', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </span>
        </div>

        {/* Quick Dismiss */}
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
