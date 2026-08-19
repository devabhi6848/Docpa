import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('docpa_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [clinics, setClinics] = useState([]);
  const [activeClinic, setActiveClinic] = useState(() => {
    try {
      const savedClinic = localStorage.getItem('docpa_active_clinic');
      return savedClinic ? JSON.parse(savedClinic) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Fetch user profile and available clinics
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('docpa_access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/v1/users/me');
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('docpa_user', JSON.stringify(res.data.user));
      }

      // Fetch user's clinics
      const clinicsRes = await api.get('/v1/clinics/my-clinics');
      const clinicList = clinicsRes.data?.clinics || [];
      setClinics(clinicList);

      // Restore or set active clinic
      const currentActiveId = localStorage.getItem('docpa_active_clinic_id');
      const matched = clinicList.find((c) => c._id === currentActiveId);

      if (matched) {
        setActiveClinic(matched);
        localStorage.setItem('docpa_active_clinic', JSON.stringify(matched));
      } else if (clinicList.length > 0) {
        setActiveClinic(clinicList[0]);
        localStorage.setItem('docpa_active_clinic_id', clinicList[0]._id);
        localStorage.setItem('docpa_active_clinic', JSON.stringify(clinicList[0]));
      }
    } catch (err) {
      console.error('Failed to fetch user or clinic info:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();

    const handleExpired = () => {
      setUser(null);
      setActiveClinic(null);
      setClinics([]);
    };

    window.addEventListener('docpa_auth_expired', handleExpired);
    return () => window.removeEventListener('docpa_auth_expired', handleExpired);
  }, [fetchUserData]);

  // Login with Password
  const loginWithPassword = async (identifier, password) => {
    const res = await api.post('/v1/users/login', { identifier, password });
    const { user: userData, accessToken, refreshToken, activeClinicId } = res.data;

    localStorage.setItem('docpa_access_token', accessToken);
    localStorage.setItem('docpa_refresh_token', refreshToken);
    localStorage.setItem('docpa_user', JSON.stringify(userData));
    setUser(userData);

    if (activeClinicId) {
      localStorage.setItem('docpa_active_clinic_id', activeClinicId);
    }

    await fetchUserData();
    return res;
  };

  // Register with Password
  const registerWithPassword = async (payload) => {
    const res = await api.post('/v1/users/register', payload);
    const { user: userData, accessToken, refreshToken } = res.data;

    localStorage.setItem('docpa_access_token', accessToken);
    localStorage.setItem('docpa_refresh_token', refreshToken);
    localStorage.setItem('docpa_user', JSON.stringify(userData));
    setUser(userData);

    await fetchUserData();
    return res;
  };

  // Send OTP
  const sendOtp = async (channel, recipient) => {
    return await api.post('/v1/users/otp/send', { channel, recipient });
  };

  // Login with OTP
  const loginWithOtp = async (channel, recipient, otp) => {
    const res = await api.post('/v1/users/otp/verify', { channel, recipient, otp });
    const { user: userData, accessToken, refreshToken, activeClinicId } = res.data;

    localStorage.setItem('docpa_access_token', accessToken);
    localStorage.setItem('docpa_refresh_token', refreshToken);
    localStorage.setItem('docpa_user', JSON.stringify(userData));
    setUser(userData);

    if (activeClinicId) {
      localStorage.setItem('docpa_active_clinic_id', activeClinicId);
    }

    await fetchUserData();
    return res;
  };

  // Register with OTP
  const registerWithOtp = async (payload) => {
    const res = await api.post('/v1/users/otp/register', payload);
    const { user: userData, accessToken, refreshToken } = res.data;

    localStorage.setItem('docpa_access_token', accessToken);
    localStorage.setItem('docpa_refresh_token', refreshToken);
    localStorage.setItem('docpa_user', JSON.stringify(userData));
    setUser(userData);

    await fetchUserData();
    return res;
  };

  // Google OAuth Login
  const loginWithGoogle = async (idToken) => {
    const res = await api.post('/v1/users/google', { idToken });
    const { user: userData, accessToken, refreshToken } = res.data;

    localStorage.setItem('docpa_access_token', accessToken);
    localStorage.setItem('docpa_refresh_token', refreshToken);
    localStorage.setItem('docpa_user', JSON.stringify(userData));
    setUser(userData);

    await fetchUserData();
    return res;
  };

  // Switch Active Clinic
  const switchClinic = async (clinicId) => {
    try {
      await api.post('/v1/clinics/switch-active', { clinicId });
    } catch (err) {
      console.warn('Switch active clinic API warning:', err);
    }

    localStorage.setItem('docpa_active_clinic_id', clinicId);
    const selected = clinics.find((c) => c._id === clinicId);
    if (selected) {
      setActiveClinic(selected);
      localStorage.setItem('docpa_active_clinic', JSON.stringify(selected));
    }
  };

  // Logout
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('docpa_refresh_token');
      if (refreshToken) {
        await api.post('/v1/users/logout', { refreshToken });
      }
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      localStorage.removeItem('docpa_access_token');
      localStorage.removeItem('docpa_refresh_token');
      localStorage.removeItem('docpa_user');
      localStorage.removeItem('docpa_active_clinic_id');
      localStorage.removeItem('docpa_active_clinic');
      setUser(null);
      setActiveClinic(null);
      setClinics([]);
    }
  };

  const isDoctor = user?.role === 'doctor' || user?.role === 'admin';
  const isReceptionist = user?.role === 'receptionist' || user?.role === 'admin';
  const isNurse = user?.role === 'nurse';
  const isClinicAdmin = user?.role === 'clinic_admin' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        clinics,
        activeClinic,
        loading,
        loginWithPassword,
        registerWithPassword,
        sendOtp,
        loginWithOtp,
        registerWithOtp,
        loginWithGoogle,
        switchClinic,
        logout,
        fetchUserData,
        isDoctor,
        isReceptionist,
        isNurse,
        isClinicAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
