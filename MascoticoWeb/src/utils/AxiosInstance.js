import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/',
  withCredentials: true,
});

let csrfTokenPromise = null;

async function getCsrfToken() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = axiosInstance.get('/csrf-token')
      .then(res => res.data.csrfToken)
      .catch(() => null);
  }
  return csrfTokenPromise;
}

axiosInstance.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('jwt');

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
    const csrfToken = await getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

let refreshPromise = null;

async function refreshJWT() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('Sin refresh token');

  const { data } = await axiosInstance.post('/refresh', { refreshToken });

  if (data.JWT) {
    localStorage.setItem('jwt', data.JWT);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
  }
  return data.JWT;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/refresh')
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshJWT().finally(() => { refreshPromise = null; });
        }
        const newToken = await refreshPromise;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('jwt');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('chat_conversation_id');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
