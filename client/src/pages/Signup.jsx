import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from "../socket";

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

const CURRENT_YEAR = 26;
const OLDEST_VALID_YEAR = 0;

function isValidRollNumber(roll) {
    const cleaned = String(roll).trim();

    if (!/^\d{9}$/.test(cleaned)) {
        return false;
    }

    const batchYear = parseInt(cleaned.slice(4, 6));

    if (batchYear > CURRENT_YEAR || batchYear < OLDEST_VALID_YEAR) {
        return false;
    }

    return true;
}

function getRollNumberInfo(roll) {
    const cleaned = String(roll).trim();

    if (!/^\d{9}$/.test(cleaned)) {
        return null;
    }

    const department = cleaned.slice(0, 4);
    const batch = cleaned.slice(4, 6);
    const rollNo = cleaned.slice(6, 9);

    const batchYear = parseInt(batch);

    if (batchYear > CURRENT_YEAR || batchYear < OLDEST_VALID_YEAR) {
        return null;
    }

    return { department, batch, rollNo };
}

const Register = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [detectedRollInfo, setDetectedRollInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    function handleNameChange(e) {
        setName(e.target.value);
    }

    function handleEmailChange(e) {
        setEmail(e.target.value);
    }

    function handleRollNumberChange(e) {
        const newRoll = e.target.value;
        setRollNumber(newRoll);
        setDetectedRollInfo(getRollNumberInfo(newRoll));
    }

    function handlePasswordChange(e) {
        setPassword(e.target.value);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const cleanedRoll = rollNumber.trim();

        if (!/^\d{9}$/.test(cleanedRoll)) {
            toast.error("ROLL NUMBER MUST BE 9 DIGITS", { style: errorToastStyle });
            return;
        }

        const batchYear = parseInt(cleanedRoll.slice(4, 6));
        if (batchYear > CURRENT_YEAR || batchYear < OLDEST_VALID_YEAR) {
            toast.error(`INVALID BATCH YEAR: ${batchYear} — MAX IS ${CURRENT_YEAR}`, { style: errorToastStyle });
            return;
        }

        setLoading(true);

        try {
            const response = await API.post("/auth/signup", {
                name: name,
                email: email,
                rollNumber: cleanedRoll,
                password: password,
            });

            const data = response.data;

            login(data.token, data.user);

            connectSocket();

            toast.success("ACCOUNT CREATED", { style: normalToastStyle });

            navigate("/home");
        } catch (err) {
            const errorMessage = err.response?.data?.message || "REGISTRATION FAILED";
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
        background: 'rgba(6, 10, 19, 0.4)',
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
        background: `linear-gradient(to right, rgba(0, 240, 255, 0.2), transparent)`
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

                <div className="relative z-10 w-full max-w-[460px]" style={cardStyle}>

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
                            CREATE ACCOUNT
                        </h2>
                        <p className="text-xs tracking-[3px] uppercase mt-1" style={{ fontFamily: "'Rajdhani', sans-serif", color: textMuted }}>
                            campus discussion network
                        </p>
                    </div>

                    <div className="px-9 pt-7 pb-8">
                        <form onSubmit={handleSubmit}>

                            {/* Name Field */}
                            <div className="mb-[18px]">
                                <div className="flex items-center gap-2 mb-2 text-[11px] tracking-[2px]"
                                    style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(0, 240, 255, 0.6)' }}>
                                    STUDENT NAME
                                    <div className="flex-1 h-px" style={labelLineStyle} />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    placeholder="ENTER YOUR NAME"
                                    onChange={handleNameChange}
                                    required
                                    className="auth-input w-full py-3 px-5 text-sm text-[#c8d4e6]"
                                    style={inputStyle}
                                />
                            </div>

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

                            {/* Roll Number Field */}
                            <div className="mb-[18px]">
                                <div className="flex items-center gap-2 mb-2 text-[11px] tracking-[2px]"
                                    style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(0, 240, 255, 0.6)' }}>
                                    ROLL NUMBER
                                    <div className="flex-1 h-px" style={labelLineStyle} />
                                </div>
                                <input
                                    type="text"
                                    value={rollNumber}
                                    placeholder="9 DIGITS"
                                    onChange={handleRollNumberChange}
                                    required
                                    className="auth-input w-full py-3 px-5 text-sm text-[#c8d4e6]"
                                    style={inputStyle}
                                />
                                <div className="mt-2 h-5">
                                    {detectedRollInfo ? (
                                        <span className="text-[11px] tracking-[2px]" style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(0, 240, 255, 0.7)' }}>
                                            ✓ DEPT: <span style={{ color: accentSecondary }}>{detectedRollInfo.department}</span>
                                            {'  '}BATCH: <span style={{ color: accentSecondary }}>{detectedRollInfo.batch}</span>
                                        </span>
                                    ) : rollNumber.length > 3 ? (
                                        <span className="text-[11px] tracking-[2px]" style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(255,68,68,0.8)' }}>
                                            ✗ INVALID DATA STREAM
                                        </span>
                                    ) : null}
                                </div>
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
                                {loading ? '[ INITIALIZING STREAM... ]' : '[ JOIN CAMPUS ]'}
                            </button>
                        </form>

                        <p className="text-center mt-5 text-[12px] tracking-wider"
                            style={{ fontFamily: "'Share Tech Mono', monospace", color: textMuted }}>
                            ALREADY REGISTERED?{' '}
                            <Link to="/login" style={{ color: accentSecondary, textDecoration: 'none', fontWeight: 'bold' }}>
                                LOGIN TERMINAL
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;