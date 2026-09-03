import React from 'react';
import { Menu, RefreshCw, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Header({ title, onRefresh, refreshing, setMobileOpen }) {
  const { adminUser, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="menu-toggle-btn" onClick={() => setMobileOpen((prev) => !prev)}>
          <Menu size={20} />
        </button>
        <h2 className="page-title">{title}</h2>
      </div>

      <div className="header-right">
        {onRefresh && (
          <button className="refresh-btn" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        )}

        <div className="admin-profile">
          {adminUser?.picture ? (
            <img src={adminUser.picture} alt="Admin Avatar" className="admin-avatar-img" style={{ width: 32, height: 32, borderRadius: '50%' }} />
          ) : (
            <div className="admin-avatar">{getInitials(adminUser?.name)}</div>
          )}
          <div className="admin-info">
            <span className="admin-name">{adminUser?.name || 'Authorized Admin'}</span>
            <span className="admin-email">{adminUser?.email || 'admin@bikedoctor.com'}</span>
          </div>
          <ShieldCheck size={16} style={{ color: '#10b981', marginLeft: 4 }} />
        </div>
      </div>
    </header>
  );
}
