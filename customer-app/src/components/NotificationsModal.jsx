import React, { useState, useEffect } from 'react';
import { Bell, X, Tag, Zap, Shield, CheckCheck, Clock } from 'lucide-react';

const NotificationsModal = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setNotifications(json.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'PROMO':
        return <Tag size={18} color="var(--aber-yellow)" />;
      case 'SURGE':
        return <Zap size={18} color="#FF8900" />;
      case 'SAFETY':
        return <Shield size={18} color="#10B981" />;
      default:
        return <Bell size={18} color="var(--aber-yellow)" />;
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
        maxHeight: '80vh',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'rgba(14, 19, 31, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="var(--aber-yellow)" />
            <h2 className="text-h2" style={{ fontSize: '18px', color: '#FFFFFF', margin: 0 }}>Notifications</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={markAllAsRead}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--aber-yellow)',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Mark Read
            </button>
            <button 
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map(notif => (
            <div 
              key={notif.id}
              style={{
                padding: '14px',
                borderRadius: '16px',
                background: notif.read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 212, 40, 0.08)',
                border: notif.read ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(255, 212, 40, 0.3)',
                display: 'flex',
                gap: '12px'
              }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'var(--bg-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getIcon(notif.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>{notif.title}</div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{notif.time}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
                  {notif.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
