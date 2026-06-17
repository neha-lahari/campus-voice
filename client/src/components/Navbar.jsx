import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

import SearchOverlay from './SearchOverlay';
import useNotifications from "../utils/useNotifications";
import { disconnectSocket } from "../socket";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const { notifications, unreadCount, markAllRead } = useNotifications();

    const [dropdown, setDropdown] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [showNotif, setShowNotif] = useState(false);

    const toastStyle = {
        background: '#121824',
        color: '#A3FF12',
        border: '1px solid rgba(163, 255, 18, 0.25)',
        fontFamily: "'Share Tech Mono', monospace",
        letterSpacing: '1px',
        fontSize: '12px',
    };

    const handleLogout = () => {
        disconnectSocket();
        logout();
        toast.success('Logged Out Successfully', { style: toastStyle });
        navigate('/login');
    };

    const handleNotifClick = (notif) => {
        setShowNotif(false);
        markAllRead();
        if (notif.link) navigate(notif.link);
    };

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") {
                setShowSearch(false);
                setDropdown(false);
                setShowNotif(false);
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    return (
        <>
            <nav className="sticky top-0 z-50 h-14 flex items-center justify-between gap-4 px-6 bg-[#060A13]/95 border-b border-cyan-500/10 backdrop-blur-md">

                <div className="flex items-center gap-5 flex-1 max-w-2xl">
                    <Link to="/" className="flex items-center gap-3 shrink-0 group transition-transform active:scale-95">
                        <div className="w-8 h-8 flex items-center justify-center text-xs font-black rounded bg-[#A3FF12] text-[#060A13] font-['Orbitron'] shadow-[0_0_14px_rgba(163,255,18,0.35)]">
                            CV
                        </div>
                        <span className="text-xs sm:text-sm font-bold tracking-[2px] uppercase text-zinc-100 group-hover:text-[#00F0FF] transition-colors font-['Orbitron']">
                            Campus Voice
                        </span>
                    </Link>

                    <div className="hidden sm:block flex-1 max-w-md">
                        <button
                            onClick={() => setShowSearch(true)}
                            className="w-full px-4 py-2 text-left text-xs tracking-wider border bg-zinc-950/40 border-cyan-500/15 text-zinc-500/80 hover:border-cyan-400/40 hover:text-cyan-400/60 transition-all duration-200 font-['Share_Tech_Mono'] cursor-pointer"
                        >
                            Search posts, users, or communities...
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">

                    {/* Search  */}
                    <button
                        onClick={() => setShowSearch(true)}
                        className="sm:hidden w-9 h-9 flex items-center justify-center border border-transparent rounded text-zinc-400 hover:text-[#00F0FF] hover:bg-[#00F0FF]/5 hover:border-[#00F0FF]/30"
                    >
                        SEARCH
                    </button>


                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowNotif(!showNotif);
                                setDropdown(false);
                            }}
                            className="w-9 h-9 flex items-center justify-center border border-cyan-500/10 text-zinc-400 bg-zinc-950/20 rounded hover:text-[#00F0FF] relative"
                        >
                            🔔
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#A3FF12] text-[#060A13] text-[9px] font-black flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotif && (
                            <div className="absolute right-0 mt-3 w-72 bg-[#121824] border border-cyan-500/20 max-h-80 overflow-y-auto z-50">

                                <div className="p-3 border-b border-zinc-800/60 flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                                        Notifications
                                    </span>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            className="text-[9px] text-cyan-400 hover:text-cyan-300 tracking-wider uppercase"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>

                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-zinc-500">
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.slice(0, 20).map((n) => (
                                        <div
                                            key={n._id}
                                            onClick={() => handleNotifClick(n)}
                                            className="p-3 border-b border-zinc-800/40 text-xs cursor-pointer hover:bg-zinc-800/40 transition-colors"
                                            style={{
                                                color: n.isRead ? '#4E5D78' : '#E5E9F0',
                                                borderLeft: n.isRead ? 'none' : '2px solid #A3FF12'
                                            }}
                                        >
                                            {n.message}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => { setDropdown(!dropdown); setShowNotif(false); }}
                                className="flex items-center gap-3 px-2.5 py-1 border border-cyan-500/10 bg-zinc-950/20 rounded"
                            >
                                <div className="w-6 h-6 rounded-full bg-[#A3FF12]/10 border border-[#A3FF12]/40 flex items-center justify-center text-[#A3FF12] text-[11px] font-bold">
                                    {user.name?.[0]?.toUpperCase()}
                                </div>
                                <span className="hidden md:inline text-xs font-bold text-zinc-300">
                                    {user.name?.split(' ')[0].toUpperCase()}
                                </span>
                            </button>

                            {dropdown && (
                                <div className="absolute right-0 mt-3 w-44 bg-[#121824] border border-cyan-500/20 z-50">
                                    <Link
                                        to={`/profile/${user._id}`}
                                        onClick={() => setDropdown(false)}
                                        className="block px-4 py-3 text-xs text-zinc-300 border-b border-zinc-800/40"
                                    >
                                        Account Profile
                                    </Link>
                                    <Link
                                        to="/messages"
                                        onClick={() => setDropdown(false)}
                                        className="block px-4 py-3 text-xs text-zinc-300 border-b border-zinc-800/40"
                                    >
                                        Direct Messages
                                    </Link>
                                    <button
                                        onClick={() => { setDropdown(false); handleLogout(); }}
                                        className="w-full text-left px-4 py-3 text-xs text-rose-400 font-bold"
                                    >
                                        Log Out System
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="px-4 py-1.5 text-xs font-bold border border-[#A3FF12] text-[#A3FF12]">
                            Login
                        </Link>
                    )}
                </div>
            </nav>

            {showSearch && (
                <SearchOverlay onClose={() => setShowSearch(false)} />
            )}
        </>
    );
}