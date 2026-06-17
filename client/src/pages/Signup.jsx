import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from "../socket";

const bgCard = '#121824';
const accentPrimary = '#A3FF12';
const accentSecondary = '#00F0FF';
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

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@300;500;600&display=swap');
                .cv-input:focus {
                    outline: none;
                    border-color: #00F0FF !important;
                    background: rgba(0,240,255,0.04) !important;
                    box-shadow: inset 0 0 8px rgba(0,240,255,0.08);
                }
                .cv-input::placeholder { color: rgba(78,93,120,0.5); }
                .cv-btn:hover:not(:disabled) {
                    background: rgba(163,255,18,0.08);
                    box-shadow: 0 0 16px rgba(163,255,18,0.2);
                }
                .cv-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            `}</style>

            <div
                className="min-h-screen flex items-center justify-center p-8"
                style={{ background: 'linear-gradient(to bottom, #060A13, #0B111E)' }}
            >
                <div
                    className="w-full max-w-[440px] rounded-lg overflow-hidden"
                    style={{ background: bgCard, border: '1px solid rgba(0,240,255,0.15)' }}
                >
                    <div className="px-8 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(78,93,120,0.2)' }}>

                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-9 h-9 flex items-center justify-center rounded text-[11px] font-black"
                                style={{ fontFamily: "'Orbitron', monospace", background: accentPrimary, color: '#060A13' }}
                            >
                                CV
                            </div>
                            <span
                                className="text-[15px] font-bold tracking-[4px]"
                                style={{ fontFamily: "'Orbitron', monospace", color: accentPrimary }}
                            >
                                CAMPUSVOICE
                            </span>
                        </div>

                        <h2
                            className="text-lg font-black tracking-wide"
                            style={{ fontFamily: "'Orbitron', monospace", color: '#E5E9F0' }}
                        >
                            CREATE ACCOUNT
                        </h2>
                        <p
                            className="text-[11px] tracking-[3px] uppercase mt-1"
                            style={{ fontFamily: "'Rajdhani', sans-serif", color: textMuted }}
                        >
                            campus discussion network
                        </p>
                    </div>

                    <div className="px-8 pt-6 pb-8">
                        <form onSubmit={handleSubmit}>

                            {/* Name field */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[11px] tracking-[2px] whitespace-nowrap" style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(0,240,255,0.6)' }}>
                                        STUDENT NAME
                                    </span>
                                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(0,240,255,0.2), transparent)' }} />
                                </div>
                                <input
                                    className="cv-input w-full py-2.5 px-4 rounded text-sm text-[#c8d4e6] transition-all duration-200"
                                    style={{ fontFamily: "'Share Tech Mono', monospace", background: 'rgba(6,10,19,0.4)', border: '1px solid rgba(0,240,255,0.12)' }}
                                    type="text"
                                    placeholder="ENTER YOUR NAME"
                                    value={name}
                                    onChange={handleNameChange}
                                    required
                                />
                            </div>

                            {/* Email field */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[11px] tracking-[2px] whitespace-nowrap" style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(0,240,255,0.6)' }}>
                                        COLLEGE EMAIL
                                    </span>
                                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(0,240,255,0.2), transparent)' }} />
                                </div>
                                <input
                                    className="cv-input w-full py-2.5 px-4 rounded text-sm text-[#c8d4e6] transition-all duration-200"
                                    style={{ fontFamily: "'Share Tech Mono', monospace", background: 'rgba(6,10,19,0.4)', border: '1px solid rgba(0,240,255,0.12)' }}
                                    type="email"
                                    placeholder="ENTER YOUR EMAIL"
                                    value={email}
                                    onChange={handleEmailChange}
                                    required
                                />
                            </div>

                            {/* Roll number field */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[11px] tracking-[2px] whitespace-nowrap" style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(0,240,255,0.6)' }}>
                                        ROLL NUMBER
                                    </span>
                                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(0,240,255,0.2), transparent)' }} />
                                </div>
                                <input
                                    className="cv-input w-full py-2.5 px-4 rounded text-sm text-[#c8d4e6] transition-all duration-200"
                                    style={{ fontFamily: "'Share Tech Mono', monospace", background: 'rgba(6,10,19,0.4)', border: '1px solid rgba(0,240,255,0.12)' }}
                                    type="text"
                                    placeholder="9 DIGITS"
                                    value={rollNumber}
                                    onChange={handleRollNumberChange}
                                    required
                                />
                                {/* Live hint */}
                                <div className="mt-1.5 h-4 text-[11px] tracking-[2px]" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                                    {detectedRollInfo ? (
                                        <span style={{ color: 'rgba(0,240,255,0.7)' }}>
                                            ✓ DEPT: <span style={{ color: accentSecondary }}>{detectedRollInfo.department}</span>
                                            {'  '}BATCH: <span style={{ color: accentSecondary }}>{detectedRollInfo.batch}</span>
                                        </span>
                                    ) : rollNumber.length > 3 ? (
                                        <span style={{ color: 'rgba(255,68,68,0.8)' }}>✗ INVALID DATA STREAM</span>
                                    ) : null}
                                </div>
                            </div>

                            {/* Password field */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[11px] tracking-[2px] whitespace-nowrap" style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(0,240,255,0.6)' }}>
                                        SECURITY PASSWORD
                                    </span>
                                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(0,240,255,0.2), transparent)' }} />
                                </div>
                                <input
                                    className="cv-input w-full py-2.5 px-4 rounded text-sm text-[#c8d4e6] transition-all duration-200"
                                    style={{ fontFamily: "'Share Tech Mono', monospace", background: 'rgba(6,10,19,0.4)', border: '1px solid rgba(0,240,255,0.12)' }}
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>

                            {/* Submit button */}
                            <button
                                className="cv-btn w-full py-3.5 mt-2 rounded text-[11px] font-bold tracking-[5px] transition-all duration-200"
                                style={{ fontFamily: "'Orbitron', monospace", color: accentPrimary, background: 'transparent', border: `1px solid ${accentPrimary}` }}
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? '[ INITIALIZING STREAM... ]' : '[ JOIN CAMPUS ]'}
                            </button>

                        </form>

                        {/* Login link */}
                        <p
                            className="text-center mt-5 text-[12px] tracking-wider"
                            style={{ fontFamily: "'Share Tech Mono', monospace", color: textMuted }}
                        >
                            ALREADY REGISTERED?{' '}
                            <Link to="/login" className="font-bold" style={{ color: accentSecondary, textDecoration: 'none' }}>
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