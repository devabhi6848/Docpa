import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: Attach JWT token and active clinic ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('docpa_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const activeClinicId = localStorage.getItem('docpa_active_clinic_id');
    if (activeClinicId) {
      config.headers['x-clinic-id'] = activeClinicId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle token expiration and refresh automatically
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (attempt refresh)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/v1/users/refresh') || originalRequest.url?.includes('/v1/users/login')) {
        return Promise.reject(error.response?.data || error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('docpa_refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('docpa_access_token');
        localStorage.removeItem('docpa_user');
        window.dispatchEvent(new Event('docpa_auth_expired'));
        return Promise.reject(error.response?.data || error);
      }

      try {
        const response = await axios.post('/api/v1/users/refresh', {
          refreshToken,
        });

        const newAccessToken = response.data.data.accessToken;
        localStorage.setItem('docpa_access_token', newAccessToken);
        if (response.data.data.refreshToken) {
          localStorage.setItem('docpa_refresh_token', response.data.data.refreshToken);
        }

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('docpa_access_token');
        localStorage.removeItem('docpa_refresh_token');
        localStorage.removeItem('docpa_user');
        window.dispatchEvent(new Event('docpa_auth_expired'));
        return Promise.reject(refreshErr.response?.data || refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const customError = error.response?.data || {
      message: error.message || 'An unexpected error occurred',
      statusCode: error.response?.status || 500,
    };

    return Promise.reject(customError);
  }
);

export default api;
