import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { triggerPaymentReconciliation } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function ReconciliationPage({ onRefreshBookings }) {
  const { idToken, adminUser } = useAuth();
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRunReconciliation = async () => {
    setRunning(true);
    setErrorMsg('');
    try {
      const result = await triggerPaymentReconciliation({
        token: idToken,
        email: adminUser?.email,
      });
      setReport(result);
      if (onRefreshBookings) {
        onRefreshBookings();
      }
    } catch (err) {
      console.error('Reconciliation error:', err);
      setErrorMsg(err.message || 'Failed to run payment reconciliation audit.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="table-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>
              Razorpay Automated Payment Reconciler
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Audit Google Sheets booking records against live Razorpay captured payment transactions.
            </p>
          </div>

          <button className="btn-primary" onClick={handleRunReconciliation} disabled={running}>
            <RefreshCw size={16} className={running ? 'spin' : ''} />
            <span>{running ? 'Auditing Razorpay...' : 'Run Live Reconciliation Audit'}</span>
          </button>
        </div>

        {errorMsg && (
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, color: '#fca5a5', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}
      </div>

      {report && (
        <div className="table-card" style={{ padding: 24 }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--success)' }}>
            Audit Complete — {report.timestamp}
          </h4>

          <div className="metrics-grid" style={{ marginBottom: 20 }}>
            <div className="detail-section">
              <div className="detail-item-label">Audited Sheet Rows</div>
              <div className="detail-item-value" style={{ fontSize: '1.5rem' }}>{report.totalRowsAudited || 0}</div>
            </div>
            <div className="detail-section">
              <div className="detail-item-label">Reconciled to PAID</div>
              <div className="detail-item-value" style={{ fontSize: '1.5rem', color: 'var(--success)' }}>{report.reconciledPaidCount || report.reconciledPaid?.length || 0}</div>
            </div>
            <div className="detail-section">
              <div className="detail-item-label">Pay at Service (Pending)</div>
              <div className="detail-item-value" style={{ fontSize: '1.5rem', color: 'var(--warning)' }}>{report.legitimatePendingCount || report.legitimatePending?.length || 0}</div>
            </div>
            <div className="detail-section">
              <div className="detail-item-label">Manual Review Needed</div>
              <div className="detail-item-value" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{report.manualReviewCount || report.manualReview?.length || 0}</div>
            </div>
          </div>

          {report.reconciledPaid && report.reconciledPaid.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h5 style={{ fontSize: '0.9rem', color: 'var(--success)', marginBottom: 8, fontWeight: 700 }}>
                ✅ Reconciled & Updated Bookings (Pending → PAID):
              </h5>
              <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.85rem' }}>
                {report.reconciledPaid.map((item, idx) => (
                  <li key={idx} style={{ padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 6, marginBottom: 6 }}>
                    Row #{item.sheetRowIndex} | Booking ID: <strong>#{item.bookingId}</strong> | Customer: {item.name} ({item.email}) | Method: {item.updatedMethod}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.legitimatePending && report.legitimatePending.length > 0 && (
            <div>
              <h5 style={{ fontSize: '0.9rem', color: 'var(--warning)', marginBottom: 8, fontWeight: 700 }}>
                📋 Doorstep Pay at Service Bookings (Safely Kept Pending):
              </h5>
              <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.85rem' }}>
                {report.legitimatePending.map((item, idx) => (
                  <li key={idx} style={{ padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 6, marginBottom: 6 }}>
                    Row #{item.sheetRowIndex} | Booking ID: <strong>#{item.bookingId}</strong> | Customer: {item.name} ({item.email}) | Method: {item.paymentMethod}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
