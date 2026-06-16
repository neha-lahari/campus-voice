import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#020810' }}>
            <span style={{
                fontFamily: "'Orbitron', monospace",
                color: '#39ff64',
                letterSpacing: '4px',
                fontSize: '12px',
                textShadow: '0 0 20px rgba(57,255,100,0.8)',
            }}>
                LOADING...
            </span>
        </div>
    );

    return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;