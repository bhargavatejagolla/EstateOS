import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = error.response?.data?.error || {
      code: "NETWORK_ERROR",
      message: error.message || "Failed to connect to EstateOS API",
    };
    return Promise.reject(customError);
  }
);
