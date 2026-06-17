import { createContext, useContext, useEffect } from "react";
import { socket, connectSocket, disconnectSocket } from "../socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user, token } = useAuth();

    useEffect(() => {
        if (user && token) {
            connectSocket(token); 
        } else {
            disconnectSocket();
        }

        return () => { socket.off(); };
    }, [user, token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);