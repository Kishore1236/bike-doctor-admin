import React from 'react';
import { CreditCard, CheckCircle, Clock, DollarSign, Truck } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';

export function PaymentsPage({ bookings, stats, onUpdateStatus, updatingId }) {
  return (
    <div>
      {/* Financial Summary */}
      <div className="metrics-grid">
        <MetricCard
          title="Verified Revenue"
          value={stats?.totalRevenue || '₹0'}
          icon={DollarSign}
          type="success"
          subtitle="Captured Razorpay & verified"
        />
        <MetricCard
          title="Paid Orders"
          value={stats?.paidCount || 0}
          icon={CheckCircle}
          type="success"
          subtitle="Status = PAID"
        />
        <MetricCard
          title="Pending Payments"
          value={stats?.pendingCount || 0}
          icon={Clock}
          type="warning"
          subtitle="Awaiting cash / online verification"
        />
        <MetricCard
          title="Pay at Service"
          value={stats?.payAtServiceCount || 0}
          icon={Truck}
          type="info"
          subtitle="Doorstep collection"
        />
      </div>

      {/* Financial Transaction Ledger */}
      <div className="table-card">
        <div className="table-header-tools">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Financial Ledger & Payment Tracking</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Inspect payment methods, transaction amounts, and update doorstep pending payments
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Service Plan</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Booking Date</th>
                <th>Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No payment records available.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const isPaid = b.paymentStatus === 'PAID';
                  const isUpdating = updatingId === b.bookingId;

                  return (
                    <tr key={b.bookingId}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>#{b.bookingId}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.email}</div>
                      </td>
                      <td>{b.planName}</td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>{b.amount}</td>
                      <td>
                        <span className={`badge ${b.paymentMethod.toLowerCase().includes('service') ? 'badge-service' : 'badge-online'}`}>
                          {b.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isPaid ? 'badge-paid' : 'badge-pending'}`}>
                          {isPaid ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.timestamp}</td>
                      <td>
                        {!isPaid ? (
                          <button
                            className="btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => onUpdateStatus(b.bookingId, 'PAID', 'Pay at Service (Collected)')}
                            disabled={isUpdating}
                          >
                            <CheckCircle size={12} />
                            {isUpdating ? 'Updating...' : 'Mark Collected & PAID'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                            Verified Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
