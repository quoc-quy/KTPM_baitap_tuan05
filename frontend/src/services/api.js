import axios from 'axios';

// Đổi thành IP máy chủ thực tế trong mạng LAN
const IP = 'http://192.168.1.X';
const FOOD_IP = 'http://172.16.52.163'
const USER_IP = 'http://172.16.52.128'

// 1. User Service (Port 8081) [cite: 80, 81]
export const userApi = axios.create({ baseURL: `${USER_IP}:8081` });
export const userService = {
  login: (data) => userApi.post('/login', data), // [cite: 46]
  register: (data) => userApi.post('/register', data), // [cite: 45]
  getUsers: () => userApi.get('api/users'), // [cite: 47]
};

// 2. Food Service (Port 8082) [cite: 82, 83]
export const foodApi = axios.create({ baseURL: `${FOOD_IP}:8082` });
export const foodService = {
  getFoods: () => foodApi.get('/foods'), // [cite: 54]
  createFood: (data) => foodApi.post('/foods', data), // [cite: 55]
  updateFood: (id, data) => foodApi.put(`/foods/${id}`, data), // [cite: 56]
  deleteFood: (id) => foodApi.delete(`/foods/${id}`), // [cite: 57]
};

// 3. Order Service (Port 8083) [cite: 87, 88]
export const orderApi = axios.create({ baseURL: `${IP}:8083` });
export const orderService = {
  createOrder: (data) => orderApi.post('/orders', data), // [cite: 64]
  getOrders: () => orderApi.get('/orders'), // [cite: 65]
};

// 4. Payment Service (Port 8084) [cite: 90]
export const paymentApi = axios.create({ baseURL: `${IP}:8084` });
export const paymentService = {
  processPayment: (data) => paymentApi.post('/payments', data), // [cite: 71]
};

// Thêm token vào header nếu có
const attachToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

userApi.interceptors.request.use(attachToken);
foodApi.interceptors.request.use(attachToken);
orderApi.interceptors.request.use(attachToken);