import React, { useState, useEffect, useCallback } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldCheck, Wrench, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BookingDetailsModal } from './components/BookingDetailsModal';
import { AccessDenied } from './components/AccessDenied';

import { DashboardPage } from './pages/DashboardPage';
import { BookingsPage } from './pages/BookingsPage';
import { CustomersPage } from './pages/CustomersPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReconciliationPage } from './pages/ReconciliationPage';

import { fetchAdminBookings, updateBookingStatus } from './services/api';

export default function App() {
  const { adminUser, idToken, isAdmin, loginSuccess } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadAdminData = useCallback(async () => {
    if (!adminUser || !isAdmin) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await fetchAdminBookings({
        token: idToken,
        email: adminUser.email,
        search,
        paymentStatus: statusFilter,
        paymentMethod: methodFilter,
        plan: planFilter,
        sort,
        page,
        limit,
      });

      setBookings(data.bookings || []);
      setStats(data.stats || {});
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setErrorMsg(err.message || 'Failed to load booking records from backend server.');
    } finally {
      setLoading(false);
    }
  }, [adminUser, idToken, isAdmin, search, statusFilter, methodFilter, planFilter, sort, page, limit]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleUpdateStatus = async (bookingId, paymentStatus, paymentMethod) => {
    setUpdatingId(bookingId);
    try {
      await updateBookingStatus({
        token: idToken,
        email: adminUser.email,
        bookingId,
        paymentStatus,
        paymentMethod,
      });

      // Refresh data
      await loadAdminData();
      if (selectedBooking && selectedBooking.bookingId === bookingId) {
        setSelectedBooking((prev) => ({ ...prev, paymentStatus: 'PAID', paymentMethod }));
      }
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // 1. Unauthenticated Login Screen
  if (!adminUser) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-card" style={{ maxWidth: 480 }}>
          <div className="brand-logo" style={{ width: 64, height: 64, borderRadius: 16, margin: '0 auto 20px' }}>
            <Wrench size={32} />
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>
            Bike Doctor Admin
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: 28, lineHeight: 1.5 }}>
            Authorized Administrator Control Dashboard. Sign in with your administrator Google account to access bookings, revenues, and system controls.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <GoogleLogin
              onSuccess={loginSuccess}
              onError={() => alert('Google Sign-In failed. Please try again.')}
              useOneTap
              theme="filled_black"
              shape="pill"
              text="continue_with"
            />
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Lock size={14} /> Server identity verification enforced
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthorized User Access Denied Screen
  if (!isAdmin) {
    return <AccessDenied />;
  }

  // 3. Authenticated Admin Dashboard Layout
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'bookings': return 'Bookings Management Suite';
      case 'customers': return 'Customer Directory & CRM';
      case 'payments': return 'Payments & Financial Ledger';
      case 'reconciliation': return 'Razorpay Live Reconciler';
      default: return 'Admin Dashboard';
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="main-wrapper">
        <Header
          title={getTabTitle()}
          onRefresh={loadAdminData}
          refreshing={loading}
          setMobileOpen={setMobileOpen}
        />

        <main className="content-body">
          {errorMsg && (
            <div style={{ marginBottom: 20, padding: 14, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 10, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardPage
              stats={stats}
              bookings={bookings}
              onSelectBooking={setSelectedBooking}
              onViewAllBookings={() => setActiveTab('bookings')}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsPage
              bookings={bookings}
              totalCount={totalCount}
              page={page}
              limit={limit}
              totalPages={totalPages}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              methodFilter={methodFilter}
              setMethodFilter={setMethodFilter}
              planFilter={planFilter}
              setPlanFilter={setPlanFilter}
              sort={sort}
              setSort={setSort}
              onPageChange={setPage}
              onSelectBooking={setSelectedBooking}
              onUpdateStatus={handleUpdateStatus}
              updatingId={updatingId}
            />
          )}

          {activeTab === 'customers' && <CustomersPage bookings={bookings} />}

          {activeTab === 'payments' && (
            <PaymentsPage
              bookings={bookings}
              stats={stats}
              onUpdateStatus={handleUpdateStatus}
              updatingId={updatingId}
            />
          )}

          {activeTab === 'reconciliation' && (
            <ReconciliationPage onRefreshBookings={loadAdminData} />
          )}
        </main>
      </div>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdateStatus={handleUpdateStatus}
          updating={updatingId === selectedBooking.bookingId}
        />
      )}
    </div>
  );
}
