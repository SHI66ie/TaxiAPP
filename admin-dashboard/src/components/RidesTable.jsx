import React from 'react';
import { QrCode, CheckCircle, Navigation, Clock } from 'lucide-react';

export default function RidesTable({ rides, onUpdateStatus }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h3>🚕 Active Trips & Dispatch Log ({rides.length})</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Live status tracking, trip QR verification codes & Paystack payment confirmations
          </p>
        </div>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Ride ID</th>
              <th>Passenger</th>
              <th>Route (Pickup ➔ Dropoff)</th>
              <th>Type</th>
              <th>Trip Fare (NGN)</th>
              <th>QR Code</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Control</th>
            </tr>
          </thead>
          <tbody>
            {rides.map((ride) => (
              <tr key={ride.id}>
                <td><code>{ride.id}</code></td>
                <td>
                  <strong>{ride.passengerName}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{ride.passengerPhone}</div>
                </td>
                <td style={{ maxWidth: 220 }}>
                  <div style={{ fontSize: '0.85rem' }}>📍 {ride.pickupLocation}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)' }}>🏁 {ride.dropoffLocation}</div>
                </td>
                <td>
                  {ride.isCarpool ? (
                    <span className="badge badge-info">👥 Carpool</span>
                  ) : (
                    <span className="badge badge-warning">🚕 Solo</span>
                  )}
                </td>
                <td>
                  <strong style={{ color: 'var(--accent-emerald)' }}>₦{ride.fare.toLocaleString()}</strong>
                  {ride.isCarpool && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <s>₦{ride.originalFare.toLocaleString()}</s>
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'monospace', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '3px 6px', borderRadius: 4 }}>
                    <QrCode size={14} color="var(--accent-gold)" />
                    {ride.qrCode}
                  </div>
                </td>
                <td><span className="badge badge-success">{ride.paymentMethod}</span></td>
                <td>
                  <span className={`badge ${ride.status === 'COMPLETED' ? 'badge-success' : ride.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-info'}`}>
                    {ride.status}
                  </span>
                </td>
                <td>
                  {ride.status === 'MATCHED' && (
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => onUpdateStatus(ride.id, 'IN_PROGRESS')}>
                      Start Trip
                    </button>
                  )}
                  {ride.status === 'IN_PROGRESS' && (
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: 'var(--accent-emerald)' }} onClick={() => onUpdateStatus(ride.id, 'COMPLETED')}>
                      Complete Trip
                    </button>
                  )}
                  {ride.status === 'COMPLETED' && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>✓ Settled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
