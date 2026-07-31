import axios from 'axios';

const api = axios.create({
  baseURL: '/api/connections',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const connectionService = {
  getFacultyList: async () => {
    const res = await api.get('/faculty');
    return res.data;
  },

  sendConnectionRequest: async (payload) => {
    const res = await api.post('/', payload);
    return res.data;
  },

  getMyConnections: async () => {
    const res = await api.get('/');
    return res.data;
  },
};

export default connectionService;