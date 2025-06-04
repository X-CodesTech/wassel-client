import axios from "axios";
import { BASE_BACKEND_URL } from "./apiUrlConstants";

// Create axios instance with base URL
const http = axios.create({
  baseURL: BASE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
http.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem("token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    console.error("HTTP Error:", error);
    // You can add error toast/notifications here
    return Promise.reject(error);
  }
);

export default http;
