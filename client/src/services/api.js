import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // The proxy will handle this
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add an interceptor here to automatically add the JWT token to requests later
// api.interceptors.request.use(config => { ... });

export default api;