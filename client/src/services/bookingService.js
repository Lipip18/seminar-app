import axios from 'axios';

const api = axios.create({
  baseURL: '/api/bookings',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const bookingService = {
  getBookings: async (queryParams = '') => {
    const res = await api.get(`/?${queryParams}`);
    return res.data;
  },
  
  getBookingById: async (id) => {
    const res = await api.get(`/${id}`);
    return res.data;
  },

  createBooking: async (bookingData) => {
    const res = await api.post('/', bookingData);
    return res.data;
  },

  updateBookingStatus: async (id, statusData) => {
    const res = await api.put(`/${id}`, statusData);
    return res.data;
  },

  deleteBooking: async (id) => {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
};

export default bookingService;
