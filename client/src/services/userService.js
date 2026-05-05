import axios from 'axios';

const api = axios.create({
  baseURL: '/api/users',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const userService = {
  getUsers: async (queryParams = '') => {
    const res = await api.get(`/?${queryParams}`);
    return res.data;
  },
  
  getUserById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data;
  },

  createUser: async (userData) => {
    const res = await api.post('/', userData);
    return res.data;
  },

  updateUser: async (id, userData) => {
    const res = await api.put(`/${id}`, userData);
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
};

export default userService;
