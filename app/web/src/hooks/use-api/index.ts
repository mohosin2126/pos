import axios from "axios";
import Cookies from "js-cookie";
import { message } from "antd";

const useApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
});


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

useApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && window.location.pathname !== "/auth") {
      Cookies.remove("token");
      Cookies.remove("user");
      window.location.href = "/auth";
    }

    if (status === 403) {
      const msg =
        error.response?.data?.message ||
        "You do not have permission to perform this action.";
      message.error(msg);
    }

    return Promise.reject(error);
  }
);

export default useApi;
