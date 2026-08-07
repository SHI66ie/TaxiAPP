import React from 'react';
import { FileCheck, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function KycManager({ kycDocs, onApproveKyc }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>📋 Driver Verification & KYC Audit Center</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Review National Identification Number (NIN), FRSC Driver's License & Vehicle Inspection records for Abuja drivers.
        </p>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>NIN Number</th>
              <th>License No</th>
              <th>Vehicle Reg (Abuja)</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {kycDocs.map((doc, idx) => (
              <tr key={idx}>
                <td>
                  <strong>{doc.driverName}</strong>
                </td>
                <td><code>{doc.nin}</code></td>
                <td><code>{doc.licenseNo}</code></td>
                <td>{doc.vehicleReg}</td>
                <td>{new Date(doc.submittedAt).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${doc.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                    {doc.status}
                  </span>
                </td>
                <td>
                  {doc.status === 'PENDING' ? (
                    <button className="btn btn-primary" onClick={() => onApproveKyc(doc.driverId)}>
                      <CheckCircle2 size={16} /> Approve & Activate Driver
                    </button>
                  ) : (
                    <span style={{ color: 'var(--accent-emerald)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ShieldCheck size={16} /> Verified Active
                    </span>
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
