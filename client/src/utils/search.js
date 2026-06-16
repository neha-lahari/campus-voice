import axios from "axios";

export const searchAPI = (query) => {
    return axios.get(`http://localhost:5000/api/search?q=${query}`, {
        withCredentials: true
    });
};