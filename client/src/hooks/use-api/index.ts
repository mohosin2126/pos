import axios from "axios";
import Cookies from "js-cookie";

const useApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
});

// Attach token from cookies
useApi.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized globally
useApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname !== "/auth"
    ) {
      Cookies.remove("token");
      Cookies.remove("user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default useApi;
