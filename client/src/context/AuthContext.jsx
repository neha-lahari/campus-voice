import { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function restoreUser() {

            const savedToken = localStorage.getItem("token");

            if (!savedToken) {
                setLoading(false);
                return;
            }

            try {
                const response = await API.get("/auth/me");

                const userData = response.data.user;

                setUser(userData);
                setToken(savedToken);

                if (userData) {
                    localStorage.setItem("userId", userData._id);
                    localStorage.setItem(
                        "user",
                        JSON.stringify(userData)
                    );
                }

            } catch (error) {
                
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("user");

                setToken(null);

            } finally {

                setLoading(false);

            }
        }

        restoreUser();

    }, []);

    function login(token, userData) {

        localStorage.setItem("token", token);

        localStorage.setItem(
            "userId",
            userData._id
        );

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        setToken(token);
        setUser(userData);
    }

    function logout() {

        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext);
}