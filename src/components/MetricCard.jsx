import React from 'react';

export function MetricCard({ title, value, icon: Icon, type = 'primary', subtitle }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span className="metric-label">{title}</span>
        <div className={`metric-icon ${type}`}>
          <Icon size={22} />
        </div>
      </div>
      <div className="metric-value">{value}</div>
      {subtitle && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</div>}
    </div>
  );
}
