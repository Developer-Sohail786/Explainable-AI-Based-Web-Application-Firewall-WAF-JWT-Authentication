// const API_BASE_URL = "https://waf-jwt.onrender.com/api";

const API_BASE_URL = "http://localhost:5000/api";

export const endpoints = {
  // Authentication endpoints
  register: `${API_BASE_URL}/auth/register`,
  login: `${API_BASE_URL}/auth/login`,
  logout: `${API_BASE_URL}/auth/logout`,
  refresh: `${API_BASE_URL}/auth/refresh`,

  // user endpoints
  userInfo: `${API_BASE_URL}/users/me`,
};
