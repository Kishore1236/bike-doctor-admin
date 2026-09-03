import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bikeDoctor_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [idToken, setIdToken] = useState(() => {
    return localStorage.getItem('bikeDoctor_admin_token') || '';
  });

  const [loading, setLoading] = useState(false);

  const configuredAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'kishoredeveloper123@gmail.com').trim().toLowerCase();

  const verifyIsAdmin = (userEmail) => {
    if (!userEmail) return false;
    const norm = String(userEmail).trim().toLowerCase();
    const envEmails = (import.meta.env.VITE_ADMIN_EMAIL || 'rgdeepak91@gmail.com,kk863614@gmail.com')
      .toLowerCase()
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    return envEmails.includes(norm);
  };

  const loginSuccess = (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      if (!token) return;

      const parts = token.split('.');
      if (parts.length !== 3) return;

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);

      const userObj = {
        email: decoded.email.trim().toLowerCase(),
        name: decoded.name || decoded.given_name || 'Admin User',
        picture: decoded.picture || '',
        isAdmin: verifyIsAdmin(decoded.email),
      };

      setAdminUser(userObj);
      setIdToken(token);
      localStorage.setItem('bikeDoctor_admin_user', JSON.stringify(userObj));
      localStorage.setItem('bikeDoctor_admin_token', token);
    } catch (err) {
      console.error('Failed to parse Google login token:', err);
    }
  };

  const logout = () => {
    setAdminUser(null);
    setIdToken('');
    localStorage.removeItem('bikeDoctor_admin_user');
    localStorage.removeItem('bikeDoctor_admin_token');
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        idToken,
        loading,
        setLoading,
        loginSuccess,
        logout,
        isAdmin: adminUser ? verifyIsAdmin(adminUser.email) : false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
