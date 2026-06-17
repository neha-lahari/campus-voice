import axios from "axios";

export const searchAPI = (query) => {
    return axios.get(`${import.meta.env.VITE_API_URL}/search?q=${query}`, {
        withCredentials: true
    });
};