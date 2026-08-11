import axios from 'axios';
import useAuthStore from '../store/authStore';
import useLoadingStore from '../store/loadingStore';

// Ensure the base URL always ends with /api if it's an external URL
let apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
if (apiBaseUrl !== '/api' && !apiBaseUrl.match(/\/api\/?$/)) {
  apiBaseUrl = apiBaseUrl.endsWith('/') ? `${apiBaseUrl}api` : `${apiBaseUrl}/api`;
}

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mutex & Queue for token refresh to avoid race conditions with multiple requests
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

// Helper to determine if global loader overlay should be displayed
const shouldTriggerGlobalLoader = (config) => {
  if (config.skipLoader) return false;
  if (config.showLoader === true) return true;
  // Automatically show global loader for mutations (creates, updates, deletes, purchases, transfers)
  const method = (config.method || 'get').toUpperCase();
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const isAuthRefresh = config.url?.includes('/auth/refresh');
  return isMutation && !isAuthRefresh;
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    if (shouldTriggerGlobalLoader(config)) {
      config._hasTriggeredLoader = true;
      useLoadingStore.getState().showLoader();
    }

    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (error.config?._hasTriggeredLoader) {
      useLoadingStore.getState().hideLoader();
    }
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.config?._hasTriggeredLoader) {
      useLoadingStore.getState().hideLoader();
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest?._hasTriggeredLoader) {
      useLoadingStore.getState().hideLoader();
      originalRequest._hasTriggeredLoader = false;
    }

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Check for 401 Unauthorized (exclude auth endpoints)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        isRefreshing = false;
        useLoadingStore.getState().resetLoader();
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const baseURL = axiosInstance.defaults.baseURL || '/api';
        const response = await axios.post(`${baseURL}/v1/society/auth/refresh`, {
          refreshToken,
        });

        if (response.data && response.data.success && response.data.data) {
          const newAccessToken = response.data.data.accessToken || response.data.data.tokens?.accessToken || response.data.data.token;
          const newRefreshToken = response.data.data.refreshToken || response.data.data.tokens?.refreshToken || null;

          useAuthStore.getState().setTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });

          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } else {
          throw new Error('Invalid refresh response payload');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        useLoadingStore.getState().resetLoader();
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
