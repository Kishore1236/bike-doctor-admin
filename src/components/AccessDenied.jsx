import React from 'react';
import { ShieldAlert, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AccessDenied() {
  const { adminUser, logout } = useAuth();

  return (
    <div className="access-denied-container">
      <div className="access-denied-card">
        <div className="access-denied-icon">
          <ShieldAlert size={36} />
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>
          Access Denied
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20, lineHeight: 1.5 }}>
          The account <strong>{adminUser?.email || 'this user'}</strong> is not authorized to access the Bike Doctor Administrator Dashboard.
        </p>

        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, padding: 12, marginBottom: 24, fontSize: '0.8rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lock size={16} style={{ flexShrink: 0 }} />
          <span>Server security authorization requirement: Registered administrator Google account required.</span>
        </div>

        <button className="btn-primary" onClick={logout} style={{ width: '100%', justifyContent: 'center' }}>
          <LogOut size={16} />
          Sign Out & Switch Account
        </button>
      </div>
    </div>
  );
}
