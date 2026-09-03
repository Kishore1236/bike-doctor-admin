import React from 'react';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  CreditCard, 
  RefreshCw, 
  Settings, 
  LogOut, 
  Wrench 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings Suite', icon: CalendarCheck },
    { id: 'customers', label: 'Customers Ledger', icon: Users },
    { id: 'payments', label: 'Payments & Revenue', icon: CreditCard },
    { id: 'reconciliation', label: 'Razorpay Reconciler', icon: RefreshCw },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-logo">
          <Wrench size={20} />
        </div>
        <div className="brand-info">
          <h1 className="brand-name">Bike Doctor</h1>
        </div>
        <span className="brand-badge">ADMIN</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item text-danger" onClick={logout}>
          <LogOut size={18} />
          <span>Logout Admin</span>
        </button>
      </div>
    </aside>
  );
}
