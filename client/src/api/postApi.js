import axios from "axios";

const API = "http://localhost:5000/api"; // change if needed

export const fetchPosts = (page = 1) =>
    axios.get(`${API}/posts?page=${page}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });

export const createPost = (data) =>
    axios.post(`${API}/posts`, data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });

export const upvote = (postId) =>
    axios.post(`${API}/votes/upvote/${postId}`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });

export const downvote = (postId) =>
    axios.post(`${API}/votes/downvote/${postId}`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });
    