import React, { useState, useEffect } from 'react';
import { User, Star, ShieldCheck, FileText, Phone, Mail, MapPin, Car, Award, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { socket } from '../App';

export default function Profile() {
  const [driver, setDriver] = useState(null);
  const [kycStatus, setKycStatus] = useState('PENDING');
  const [loading, setLoading] = useState(false);
  const driverId = 'drv_101';

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [driverRes, kycRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/drivers/kyc')
      ]);
      
      const driverJson = await driverRes.json();
      const kycJson = await kycRes.json();
      
      if (driverJson.success) {
        const currentDriver = driverJson.data.find(d => d.id === driverId);
        setDriver(currentDriver || driverJson.data[0]);
      }
      
      if (kycJson.success) {
        const myKyc = kycJson.data.find(k => k.driverId === driverId);
        setKycStatus(myKyc?.status || 'PENDING');
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();

    socket.on('driver_kyc_approved', () => {
      fetchProfileData();
    });

    return () => {
      socket.off('driver_kyc_approved');
    };
  }, []);

  const getKycStatusColor = () => {
    switch (kycStatus) {
      case 'APPROVED': return 'var(--accent-primary)';
      case 'REJECTED': return 'var(--danger)';
      case 'PENDING': return 'var(--warning)';
      default: return 'var(--text-muted)';
    }
  };

  const getKycStatusIcon = () => {
    switch (kycStatus) {
      case 'APPROVED': return <CheckCircle size={20} />;
      case 'REJECTED': return <AlertCircle size={20} />;
      case 'PENDING': return <Clock size={20} />;
      default: return <FileText size={20} />;
    }
  };

  return (
    <div className="animate-in" style={{ padding: '20px' }}>
      <div className="page-header" style={{ padding: 0, marginBottom: '24px' }}>
        <div>
          <span className="text-sm">Driver Account</span>
          <h1 className="text-h1">My Profile</h1>
        </div>
        <button 
          onClick={fetchProfileData} 
          className="btn btn-secondary btn-sm" 
          disabled={loading}
          style={{ padding: '8px' }}
        >
          Refresh
        </button>
      </div>

      {/* Driver Profile Card */}
      <div className="glass glass-elevated" style={{ padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
          borderRadius: '50%',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          fontWeight: 700,
          color: '#fff'
        }}>
          {driver?.name?.charAt(0) || 'D'}
        </div>
        
        <h2 className="text-h2" style={{ fontSize: '20px', marginBottom: '4px' }}>
          {driver?.name || 'Driver Name'}
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
          <Star size={16} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
          <span style={{ fontWeight: 600, fontSize: '16px' }}>{driver?.rating || '4.8'}</span>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            ({driver?.totalTrips || '124'} trips)
          </span>
        </div>

        <div className="stat-row" style={{ marginBottom: 0 }}>
          <div className="stat-card" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="stat-value" style={{ fontSize: '18px' }}>{driver?.vehicleType || 'Sedan'}</span>
            <span className="stat-label">Vehicle</span>
          </div>
          <div className="stat-card" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="stat-value" style={{ fontSize: '18px' }}>{driver?.plateNumber || 'ABC-123'}</span>
            <span className="stat-label">Plate</span>
          </div>
          <div className="stat-card" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="stat-value" style={{ fontSize: '18px', color: 'var(--accent-primary)' }}>{driver?.status || 'OFFLINE'}</span>
            <span className="stat-label">Status</span>
          </div>
        </div>
      </div>

      {/* KYC Status Card */}
      <div className="glass" style={{ padding: '20px', marginBottom: '24px', borderLeft: `4px solid ${getKycStatusColor()}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ 
            background: kycStatus === 'APPROVED' ? 'var(--accent-light)' : kycStatus === 'REJECTED' ? 'var(--danger-light)' : 'var(--warning-light)',
            color: getKycStatusColor(),
            padding: '10px',
            borderRadius: '12px'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="text-h3" style={{ fontSize: '15px' }}>KYC Verification</h3>
            <span className={`badge ${kycStatus === 'APPROVED' ? 'badge-success' : kycStatus === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`} style={{ marginTop: '4px' }}>
              {getKycStatusIcon()} {kycStatus}
            </span>
          </div>
        </div>
        
        <p className="text-body" style={{ fontSize: '13px', marginBottom: '12px' }}>
          {kycStatus === 'APPROVED' 
            ? 'Your identity documents have been verified. You are fully approved to drive on the platform.'
            : kycStatus === 'REJECTED'
            ? 'Your KYC submission was rejected. Please resubmit your documents for verification.'
            : 'Your KYC documents are under review. This typically takes 1-2 business days.'}
        </p>

        {kycStatus !== 'APPROVED' && (
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            <FileText size={14} style={{ marginRight: '6px' }} />
            {kycStatus === 'REJECTED' ? 'Resubmit Documents' : 'View Submission Status'}
          </button>
        )}
      </div>

      {/* Contact Information */}
      <h3 className="text-h3" style={{ marginBottom: '12px', paddingLeft: '4px' }}>Contact Information</h3>
      <div className="glass" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--info-light)', color: 'var(--info)', padding: '8px', borderRadius: '10px' }}>
              <Phone size={16} />
            </div>
            <div>
              <div className="text-sm" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Phone</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{driver?.phone || '+234 801 234 5678'}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--info-light)', color: 'var(--info)', padding: '8px', borderRadius: '10px' }}>
              <Mail size={16} />
            </div>
            <div>
              <div className="text-sm" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Email</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{driver?.email || 'driver@example.com'}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--info-light)', color: 'var(--info)', padding: '8px', borderRadius: '10px' }}>
              <MapPin size={16} />
            </div>
            <div>
              <div className="text-sm" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Base Location</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{driver?.baseLocation || 'Central Area, Abuja'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Details */}
      <h3 className="text-h3" style={{ marginBottom: '12px', paddingLeft: '4px' }}>Vehicle Details</h3>
      <div className="glass" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '8px', borderRadius: '10px' }}>
              <Car size={16} />
            </div>
            <div>
              <div className="text-sm" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Vehicle Type</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{driver?.vehicleType || 'Toyota Corolla (Sedan)'}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '8px', borderRadius: '10px' }}>
              <Award size={16} />
            </div>
            <div>
              <div className="text-sm" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>License Plate</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{driver?.plateNumber || 'ABJ-123-CD'}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '8px', borderRadius: '10px' }}>
              <User size={16} />
            </div>
            <div>
              <div className="text-sm" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Driver License</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{driver?.licenseNumber || 'DRV-2024-ABJ-001'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="glass" style={{ padding: '16px' }}>
        <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '10px' }}>
          Edit Profile
        </button>
        <button className="btn btn-danger" style={{ width: '100%' }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
