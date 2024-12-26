import axios from "axios";

const api = axios.create({
  baseURL: "https://reqres.in/api/",
  timeout: 50000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized! Redirecting to login...");
      window.location.href = "/login";
    } else if (error.response?.status === 500) {
      console.error("Server error. Please try again later.");
    }
    return Promise.reject(error);
  }
);

export default api;
