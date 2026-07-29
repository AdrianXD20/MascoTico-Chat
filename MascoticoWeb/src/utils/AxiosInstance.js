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
    config.headers['token'] = token;
    config.headers['x-access-token'] = token;
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

export default axiosInstance;