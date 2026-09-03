import React from 'react';
import { Search, CheckCircle, Clock, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export function BookingsPage({
  bookings,
  totalCount,
  page,
  limit,
  totalPages,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  methodFilter,
  setMethodFilter,
  planFilter,
  setPlanFilter,
  sort,
  setSort,
  onPageChange,
  onSelectBooking,
  onUpdateStatus,
  updatingId,
}) {
  return (
    <div className="table-card">
      {/* Search & Tool Suite */}
      <div className="table-header-tools">
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search booking ID, customer name, mobile, email, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {/* Status Filter */}
          <select className="select-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">PAID Only</option>
            <option value="PENDING">Pending Only</option>
          </select>

          {/* Payment Method Filter */}
          <select className="select-filter" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option value="all">All Payment Methods</option>
            <option value="online">Pay Online (UPI / Card)</option>
            <option value="service">Pay at Service</option>
          </select>

          {/* Plan Filter */}
          <select className="select-filter" value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
            <option value="all">All Service Plans</option>
            <option value="basic">Basic Wash (₹219)</option>
            <option value="premium">Premium Care (₹319)</option>
            <option value="care">Monthly Care (₹519)</option>
          </select>

          {/* Sorting */}
          <select className="select-filter" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="amount-high">Amount: High to Low</option>
            <option value="amount-low">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* Bookings Data Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer Details</th>
              <th>Bike Model</th>
              <th>Service Plan</th>
              <th>Time Slot</th>
              <th>Location</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: 50, color: 'var(--text-muted)' }}>
                  No bookings found matching your search and filter criteria.
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.mobile}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{b.email}</div>
                    </td>
                    <td>{b.bikeModel}</td>
                    <td>{b.planName}</td>
                    <td>{b.timeSlot}</td>
                    <td>
                      <div style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.location}
                      </div>
                    </td>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => onSelectBooking(b)}>
                          <Eye size={14} />
                        </button>

                        {isPaid ? (
                          <button
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#f59e0b', borderColor: '#f59e0b' }}
                            onClick={() => onUpdateStatus(b.bookingId, 'Pending', 'Pay at Service')}
                            disabled={isUpdating}
                            title="Revert status to UNPAID if marked PAID mistakenly"
                          >
                            {isUpdating ? 'Updating...' : 'Mark UNPAID'}
                          </button>
                        ) : (
                          <button
                            className="btn-primary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => onUpdateStatus(b.bookingId, 'PAID', 'Pay Online (Admin Updated)')}
                            disabled={isUpdating}
                          >
                            {isUpdating ? 'Updating...' : 'Mark PAID'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Showing {bookings.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalCount)} of {totalCount} bookings
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft size={16} /> Prev
          </button>

          <span style={{ fontSize: '0.85rem', padding: '0 8px' }}>
            Page {page} of {totalPages}
          </span>

          <button className="btn-secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
