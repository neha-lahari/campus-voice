import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
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