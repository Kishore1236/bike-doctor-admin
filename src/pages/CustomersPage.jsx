import React, { useMemo } from 'react';
import { Users, Phone, Mail, MapPin, Calendar } from 'lucide-react';

export function CustomersPage({ bookings }) {
  const customerMap = useMemo(() => {
    const map = new Map();

    bookings.forEach((b) => {
      const key = b.email && b.email !== 'Not provided' ? b.email.toLowerCase() : b.mobile;
      if (!key) return;

      if (!map.has(key)) {
        map.set(key, {
          key,
          name: b.name,
          email: b.email,
          mobile: b.mobile,
          altMobile: b.altMobile,
          location: b.location,
          totalBookings: 0,
          totalSpend: 0,
          paidBookingsCount: 0,
          lastBookingDate: b.timestamp,
        });
      }

      const cust = map.get(key);
      cust.totalBookings += 1;
      if (b.paymentStatus === 'PAID') {
        cust.paidBookingsCount += 1;
        cust.totalSpend += b.numAmount || 319;
      }
    });

    return Array.from(map.values());
  }, [bookings]);

  return (
    <div className="table-card">
      <div className="table-header-tools">
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Customer CRM Directory</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Aggregated profile list from {customerMap.length} unique customer records
          </p>
        </div>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Contact Email</th>
              <th>Mobile Number</th>
              <th>Primary Location</th>
              <th>Total Orders</th>
              <th>Paid Orders</th>
              <th>Total Spend</th>
              <th>Last Booking</th>
            </tr>
          </thead>
          <tbody>
            {customerMap.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No customer records discovered.
                </td>
              </tr>
            ) : (
              customerMap.map((c) => (
                <tr key={c.key}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={14} color="var(--accent)" /> {c.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={14} color="var(--success)" /> {c.mobile}
                    </div>
                  </td>
                  <td>
                    <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.location}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{c.totalBookings} order(s)</td>
                  <td>
                    <span className="badge badge-paid">{c.paidBookingsCount} paid</span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{c.totalSpend}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.lastBookingDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
