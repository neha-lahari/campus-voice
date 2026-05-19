import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;

// Login → token received
//       ↓
// Store in localStorage
//       ↓
// Axios interceptor reads token
//       ↓
// Sends it automatically in every request
//       ↓
// Backend verifies via protect middleware