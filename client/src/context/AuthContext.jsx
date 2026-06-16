// import { createContext, useContext, useState, useEffect } from 'react';
// import API from '../utils/api';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [token, setToken] = useState(localStorage.getItem('token'));
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const restore = async () => {
//             const savedToken = localStorage.getItem('token');
//             if (!savedToken) { setLoading(false); return; }
//             try {
//                 const { data } = await API.get('/auth/me');
//                 setUser(data.user);
//                 setToken(savedToken);
//                 // ✅ keep localStorage in sync on page refresh
//                 if (data.user) {
//                     localStorage.setItem('userId', data.user._id);
//                     localStorage.setItem('user', JSON.stringify(data.user));
//                 }
//             } catch {
//                 localStorage.removeItem('token');
//                 localStorage.removeItem('userId');
//                 localStorage.removeItem('user');
//                 setToken(null);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         restore();
//     }, []);

//     const login = (token, userData) => {
//         localStorage.setItem('token', token);
//         localStorage.setItem('userId', userData._id);          // ✅ for socket auth
//         localStorage.setItem('user', JSON.stringify(userData)); // ✅ for role checks
//         setToken(token);
//         setUser(userData);
//     };

//     const logout = () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('userId');
//         localStorage.removeItem('user');
//         setToken(null);
//         setUser(null);
//     };

//     return (
//         <AuthContext.Provider value={{ user, token, login, logout, loading }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);


import { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/api";

// Create Context
const AuthContext = createContext(null);

// Provider Component
export const AuthProvider = ({ children }) => {

    // Logged in user data
    const [user, setUser] = useState(null);

    // Token stored in localStorage
    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    // Loading state while checking login
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function restoreUser() {

            const savedToken = localStorage.getItem("token");

            // No token means user is not logged in
            if (!savedToken) {
                setLoading(false);
                return;
            }

            try {

                // Verify token and get user data
                const response = await API.get("/auth/me");

                const userData = response.data.user;

                setUser(userData);
                setToken(savedToken);

                // Keep localStorage updated
                if (userData) {
                    localStorage.setItem("userId", userData._id);
                    localStorage.setItem(
                        "user",
                        JSON.stringify(userData)
                    );
                }

            } catch (error) {
                
                // Token invalid
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

    // Login Function
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

    // Logout Function
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

// Custom Hook
export function useAuth() {
    return useContext(AuthContext);
}