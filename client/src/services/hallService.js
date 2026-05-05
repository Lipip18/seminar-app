import axios from 'axios';

const api = axios.create({
  baseURL: '/api/halls',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const hallService = {
  getHalls: async (queryParams = '') => {
    const res = await api.get(`/?${queryParams}`);
    return res.data;
  },
  
  getHallById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data;
  },

  createHall: async (hallData) => {
    const res = await api.post('/', hallData);
    return res.data;
  },

  updateHall: async (id, hallData) => {
    const res = await api.put(`/${id}`, hallData);
    return res.data;
  },

  deleteHall: async (id) => {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
};

export default hallService;
