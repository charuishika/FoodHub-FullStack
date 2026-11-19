import axios from "axios";

// One Axios instance for the whole app. All requests go to the gateway, never to Spring Boot.
const api = axios.create({
  baseURL: import.meta.env.VITE_GATEWAY_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const url = error.config ? error.config.url : "";
    const isLoginOrRegister =
      url === "/api/auth/login" || url === "/api/auth/register";

    if (status === 401 && !isLoginOrRegister) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/login?expired=1";
    }
    return Promise.reject(error);
  },
);

export default api;
