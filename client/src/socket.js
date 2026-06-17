import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_BACKEND_URL, {
    autoConnect: false,
});

export const connectSocket = (token) => {
    if (socket.connected) return;
    socket.auth = { token };
    socket.connect();
};

export const disconnectSocket = () => {
    socket.disconnect();
};