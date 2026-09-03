import React from 'react';
import { 
  CalendarCheck, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  Truck, 
  ArrowRight,
  Eye
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';

export function DashboardPage({ stats, bookings, onSelectBooking, onViewAllBookings }) {
  const metricItems = [
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: CalendarCheck,
      type: 'primary',
      subtitle: 'All historical orders',
    },
    {
      title: "Today's Bookings",
      value: stats?.todayBookings || 0,
      icon: Calendar,
      type: 'info',
      subtitle: 'Scheduled for today',
    },
    {
      title: 'Total Revenue',
      value: stats?.totalRevenue || '₹0',
      icon: DollarSign,
      type: 'success',
      subtitle: 'Verified paid orders',
    },
    {
      title: 'Paid Payments',
      value: stats?.paidCount || 0,
      icon: CheckCircle,
      type: 'success',
      subtitle: 'Razorpay & verified',
    },
    {
      title: 'Pending Payments',
      value: stats?.pendingCount || 0,
      icon: Clock,
      type: 'warning',
      subtitle: 'Doorstep / Pending',
    },
    {
      title: 'Pay at Service',
      value: stats?.payAtServiceCount || 0,
      icon: Truck,
      type: 'accent',
      subtitle: 'Physical collection',
    },
  ];

  const recentBookings = bookings.slice(0, 5);

  return (
    <div>
      {/* Metrics Section */}
      <div className="metrics-grid">
        {metricItems.map((m, idx) => (
          <MetricCard key={idx} {...m} />
        ))}
      </div>

      {/* Recent Bookings Section */}
      <div className="table-card" style={{ marginBottom: 28 }}>
        <div className="table-header-tools">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Booking Activity</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing latest {recentBookings.length} booking records
            </p>
          </div>
          <button className="btn-secondary" onClick={onViewAllBookings}>
            <span>View All Bookings</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Service Plan</th>
                <th>Time Slot</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No recent bookings available.
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => {
                  const isPaid = b.paymentStatus === 'PAID';
                  return (
                    <tr key={b.bookingId}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>#{b.bookingId}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.mobile}</div>
                      </td>
                      <td>{b.planName}</td>
                      <td>{b.timeSlot}</td>
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
                      <td>
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => onSelectBooking(b)}
                        >
                          <Eye size={14} /> Inspect
                        </button>
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
