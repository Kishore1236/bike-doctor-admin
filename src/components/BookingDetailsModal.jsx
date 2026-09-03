import React from 'react';
import { X, CheckCircle, Clock, MapPin, Phone, Mail, User, Bike, CreditCard, Calendar } from 'lucide-react';

export function BookingDetailsModal({ booking, onClose, onUpdateStatus, updating }) {
  if (!booking) return null;

  const isPaid = booking.paymentStatus === 'PAID';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Booking #{booking.bookingId}</h3>
            <span className={`badge ${isPaid ? 'badge-paid' : 'badge-pending'}`}>
              {isPaid ? <CheckCircle size={12} /> : <Clock size={12} />}
              {booking.paymentStatus}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          {/* Customer Information */}
          <div className="detail-section">
            <div className="detail-section-title">Customer Information</div>
            <div className="detail-grid">
              <div>
                <div className="detail-item-label">Customer Name</div>
                <div className="detail-item-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} color="var(--primary)" /> {booking.name}
                </div>
              </div>
              <div>
                <div className="detail-item-label">Email Address</div>
                <div className="detail-item-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} color="var(--accent)" /> {booking.email || 'Not provided'}
                </div>
              </div>
              <div>
                <div className="detail-item-label">Primary Mobile</div>
                <div className="detail-item-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={14} color="var(--success)" /> {booking.mobile}
                </div>
              </div>
              <div>
                <div className="detail-item-label">Alternate Contact</div>
                <div className="detail-item-value">{booking.altMobile || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Bike & Service Information */}
          <div className="detail-section">
            <div className="detail-section-title">Bike & Service Details</div>
            <div className="detail-grid">
              <div>
                <div className="detail-item-label">Bike Model</div>
                <div className="detail-item-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Bike size={14} color="var(--warning)" /> {booking.bikeModel}
                </div>
              </div>
              <div>
                <div className="detail-item-label">Service Plan</div>
                <div className="detail-item-value">{booking.planName}</div>
              </div>
              <div>
                <div className="detail-item-label">Total Amount</div>
                <div className="detail-item-value" style={{ color: 'var(--success)', fontSize: '1.1rem' }}>{booking.totalAmount}</div>
              </div>
              <div>
                <div className="detail-item-label">Scheduled Time Slot</div>
                <div className="detail-item-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} color="var(--info)" /> {booking.timeSlot}
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="detail-section">
            <div className="detail-section-title">Pickup & Drop Location</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <MapPin size={16} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div className="detail-item-value">{booking.location}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Type: {booking.locationType.toUpperCase()}</div>
              </div>
            </div>
          </div>

          {/* Payment & Audit Info */}
          <div className="detail-section">
            <div className="detail-section-title">Payment Audit Details</div>
            <div className="detail-grid">
              <div>
                <div className="detail-item-label">Payment Method</div>
                <div className="detail-item-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CreditCard size={14} color="var(--accent)" /> {booking.paymentMethod}
                </div>
              </div>
              <div>
                <div className="detail-item-label">Payment Status</div>
                <div className="detail-item-value">{booking.paymentStatus}</div>
              </div>
              <div>
                <div className="detail-item-label">Created Date</div>
                <div className="detail-item-value">{booking.timestamp}</div>
              </div>
              <div>
                <div className="detail-item-label">Sheet Row Index</div>
                <div className="detail-item-value">Row #{booking.rowIndex}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isPaid && onUpdateStatus && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <button
                className="btn-primary"
                onClick={() => onUpdateStatus(booking.bookingId, 'PAID', 'Pay Online (Admin Verified)')}
                disabled={updating}
              >
                <CheckCircle size={16} />
                {updating ? 'Updating Status...' : 'Mark as PAID'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
