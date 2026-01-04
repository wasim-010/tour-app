// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Keep the loading state

  // This effect still runs on app load to check localStorage
  useEffect(() => {
    console.log("[AuthContext] Initializing...");
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      console.log("[AuthContext] Stored Token:", storedToken ? "Found" : "Not Found");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        console.log("[AuthContext] User restored from storage.");
      } else {
        console.log("[AuthContext] No user found in storage.");
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
      // If something is wrong, clear the stored data
      logout();
    } finally {
      setLoading(false); // Signal that the check is complete
    }
  }, []);

  const login = (authData) => {
    console.log("[AuthContext] Login called with:", authData);
    setUser(authData.user);
    setToken(authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    localStorage.setItem('token', authData.token);
    console.log("[AuthContext] State updated and data saved to localStorage");
  };

  const logout = () => {
    console.log("[AuthContext] Logout called!");
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
  };

  // Prevent the app from rendering until the auth check is complete
  if (loading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};