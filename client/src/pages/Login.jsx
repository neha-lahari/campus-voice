import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { connectSocket } from "../socket";
import { useAuth } from '../context/AuthContext';

const bgMainStart = '#060A13';
const bgMainEnd = '#0B111E';
const bgCard = '#121824';
const accentPrimary = '#A3FF12';
const accentSecondary = '#00F0FF';
const textMain = '#E5E9F0';
const textMuted = '#4E5D78';

const normalToastStyle = {
    background: bgCard,
    color: accentSecondary,
    border: `1px solid rgba(0, 240, 255, 0.3)`,
    fontFamily: "'Share Tech Mono', monospace",
    letterSpacing: '2px',
    fontSize: '12px',
    boxShadow: '0 0 15px rgba(0, 240, 255, 0.15)',
};

const errorToastStyle = {
    ...normalToastStyle,
    color: "#ff4444",
    border: "1px solid rgba(255,68,68,0.3)",
};

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    function handleEmailChange(e) {
        setEmail(e.target.value);
    }

    function handlePasswordChange(e) {
        setPassword(e.target.value);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await API.post("/auth/login", {
                identifier: email,
                password: password,
            });

            const data = response.data;

            login(data.token, data.user);

            connectSocket();

            toast.success("ACCESS GRANTED", { style: normalToastStyle });

            navigate("/home");
        } catch (err) {
            const errorMessage = err.response?.data?.message || "ACCESS DENIED";
            toast.error(errorMessage, { style: errorToastStyle });
        } finally {
            setLoading(false);
        }
    }

    const gridBackground = {
        backgroundImage: `linear-gradient(rgba(0,240,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.05) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 90%)',
    };

    const cardStyle = {
        background: bgCard,
        border: `1px solid rgba(0, 240, 255, 0.15)`,
        clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))',
        boxShadow: '0 30px 80px rgba(0,0,0,0.85), 0 0 40px rgba(0,240,255,0.02)',
    };

    const inputStyle = {
        fontFamily: "'Share Tech Mono', monospace",
        letterSpacing: 1,
        background: 'rgba(0, 240, 255, 0.01)',
        border: `1px solid rgba(0, 240, 255, 0.12)`,
    };

    const buttonStyle = {
        fontFamily: "'Orbitron', monospace",
        border: `1px solid ${accentPrimary}`,
        color: accentPrimary,
        background: 'transparent',
        cursor: 'pointer',
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
    };

    const labelLineStyle = {
        background: `linear-gradient(to right, rgba(0, 240, 255, 0.2), transparent)`,
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@300;500;600&display=swap');
                .auth-input { transition: all 0.2s ease; }
                .auth-input:focus { 
                    outline: none; 
                    border-color: ${accentSecondary} !important; 
                    background: rgba(0, 240, 255, 0.04) !important;
                    box-shadow: inset 0 0 8px rgba(0, 240, 255, 0.1);
                }
                .auth-input::placeholder { color: rgba(78, 93, 120, 0.4); }
                .submit-btn:hover:not(:disabled) { 
                    background: rgba(163, 255, 18, 0.08) !important; 
                    box-shadow: 0 0 20px rgba(163, 255, 18, 0.25); 
                }
                .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>

            <div
                className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden"
                style={{ background: `linear-gradient(to bottom, ${bgMainStart}, ${bgMainEnd})` }}
            >
                <div className="fixed inset-0 pointer-events-none" style={gridBackground} />

                <div className="relative z-10 w-full max-w-[440px]" style={cardStyle}>

                    <div className="px-9 pt-7 pb-6" style={{ borderBottom: `1px solid rgba(78, 93, 120, 0.2)` }}>
                        <div className="flex items-center gap-3 mb-5">
                            <div
                                className="w-10 h-10 flex items-center justify-center text-sm font-black rounded"
                                style={{
                                    background: accentPrimary,
                                    fontFamily: "'Orbitron', monospace",
                                    color: '#060A13',
                                    boxShadow: `0 0 15px rgba(163, 255, 18, 0.4)`
                                }}
                            >
                                CV
                            </div>

                            <span
                                className="text-lg font-bold tracking-[4px]"
                                style={{
                                    fontFamily: "'Orbitron', monospace",
                                    color: accentPrimary,
                                    textShadow: `0 0 20px rgba(163, 255, 18, 0.5)`
                                }}
                            >
                                CAMPUSVOICE
                            </span>
                        </div>

                        <h2 className="text-xl font-black tracking-wide" style={{ fontFamily: "'Orbitron', monospace", color: textMain }}>
                            SYSTEM LOGIN
                        </h2>
                        <p className="text-xs tracking-[3px] uppercase mt-1" style={{ fontFamily: "'Rajdhani', sans-serif", color: textMuted }}>
                            authenticate to continue
                        </p>
                    </div>

                    <div className="px-9 pt-7 pb-8">
                        <form onSubmit={handleSubmit}>

                            {/* Email Field */}
                            <div className="mb-[18px]">
                                <div className="flex items-center gap-2 mb-2 text-[11px] tracking-[2px]"
                                    style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(0, 240, 255, 0.6)' }}>
                                    COLLEGE EMAIL
                                    <div className="flex-1 h-px" style={labelLineStyle} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    placeholder="ENTER YOUR EMAIL"
                                    onChange={handleEmailChange}
                                    required
                                    className="auth-input w-full py-3 px-5 text-sm text-[#c8d4e6]"
                                    style={inputStyle}
                                />
                            </div>

                            {/* Password Field */}
                            <div className="mb-[18px]">
                                <div className="flex items-center gap-2 mb-2 text-[11px] tracking-[2px]"
                                    style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(0, 240, 255, 0.6)' }}>
                                    SECURITY PASSWORD
                                    <div className="flex-1 h-px" style={labelLineStyle} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    placeholder="••••••••••••"
                                    onChange={handlePasswordChange}
                                    required
                                    className="auth-input w-full py-3 px-5 text-sm text-[#c8d4e6]"
                                    style={inputStyle}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="submit-btn relative w-full py-4 text-[12px] font-bold tracking-[5px] transition-all duration-300 mt-2"
                                style={buttonStyle}
                            >
                                {loading ? '[ AUTHENTICATING... ]' : '[ ENTER SYSTEM ]'}
                            </button>
                        </form>

                        <p className="text-center mt-5 text-[12px] tracking-wider"
                            style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(78, 93, 120, 0.7)' }}>
                            NO ACCOUNT?{' '}
                            <Link to="/register" style={{ color: accentSecondary, textDecoration: 'none' }}>
                                REGISTER HERE
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;