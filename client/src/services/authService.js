import axios from 'axios';

const api = axios.create({
  baseURL: '/api/auth',
  withCredentials: true,
});

// 🔐 Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authService = {

  // ✅ LOGIN
  login: async (email, password, role) => {
    const res = await api.post('/login', { email, password, role });

    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }

    return {
      token: res.data.token,
      user: res.data.user || res.data.data || null,
      data: res.data.data || res.data.user || null,
    };
  },

  // ✅ REGISTER
  register: async (userData) => {
    const res = await api.post('/register', userData);

    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }

    return {
      token: res.data.token,
      user: res.data.user || res.data.data || null,
      data: res.data.data || res.data.user || null,
    };
  },

  // 🚪 LOGOUT
  logout: async () => {
    try {
      await api.get('/logout');
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('token');
  },

  // 🔄 GET CURRENT USER
  getMe: async () => {
    const res = await api.get('/me');

    return {
      data: res.data.data || res.data.user || res.data,
      user: res.data.data || res.data.user || res.data,
    };
  },
};

export default authService;