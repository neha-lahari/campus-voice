// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
    { label: 'HOME', icon: '⌂', to: '/home' },
    { label: 'COMMUNITIES', icon: '◈', to: '/communities' },
    { label: 'MESSAGES', icon: '◻', to: '/messages' },
    { label: 'PROFILE', icon: '◉', to: null },
    { label: 'SAVED', icon: '◆', to: '/saved' },
    { label: 'NOTIFICATIONS', icon: '◎', to: '/notifications' },
];

export default function Sidebar() {
    const { user } = useAuth();

    const navItems = links.map(l =>
        l.label === 'PROFILE' ? { ...l, to: `/profile/${user?._id}` } : l
    );

    return (
        <aside className="w-[215px] min-h-screen bg-[#060A13] border-r border-[#4E5D78]/15 py-6 sticky top-14 h-[calc(100vh-56px)] flex flex-col gap-[2px]">
            {navItems.map(({ label, icon, to }) => (
                <NavLink
                    key={label}
                    to={to}
                    className={({ isActive }) => `
                        group relative block overflow-hidden text-none
                        before:content-[''] before:absolute before:inset-y-0.5 before:inset-x-2 
                        before:bg-gradient-to-r before:from-[#00F0FF]/[0.03] before:to-transparent 
                        before:border-l before:border-[#00F0FF]/15 before:-translate-x-[101%] 
                        before:transition-transform before:duration-250 before:ease-[cubic-bezier(0.4,0,0.2,1)] before:z-1
                        hover:before:translate-x-0
                        ${isActive ? 'active before:translate-x-0 before:from-[#A3FF12]/[0.04] before:to-transparent before:border-l before:border-[#A3FF12]' : ''}
                    `}
                >
                    <div className="flex items-center gap-3.5 px-5 py-2.5 relative z-10">

                        {/* Angular structural active node (Top-Right Bracket Indicator) */}
                        <div
                            className="absolute right-3 w-1 h-1 border-r-2 border-t-2 border-[#A3FF12] opacity-0 scale-y-50 transition-all duration-200 
                                group-[.active]:opacity-1 group-[.active]:scale-y-100"
                        />

                        {/* Icon Framing with mechanical clip-path */}
                        <div
                            className="w-6 h-6 flex items-center justify-center text-xs text-[#4E5D78] border border-[#4E5D78]/25 bg-[#121824]/60 font-['Inter'] transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
                                group-hover:text-[#00F0FF] group-hover:border-[#00F0FF]/40 group-hover:bg-[#00F0FF]/5 group-hover:shadow-[0_0_10px_rgba(0,240,255,0.15)]
                                group-[.active]:text-[#060A13] group-[.active]:bg-[#A3FF12] group-[.active]:border-[#A3FF12] group-[.active]:shadow-[0_0_14px_rgba(163,255,18,0.3)]"
                            style={{ clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))' }}
                        >
                            {icon}
                        </div>

                        {/* Clean Typographic Interface Label */}
                        <span
                            className="font-['Plus_Jakarta_Sans'] text-[10.5px] font-semibold tracking-[1.25px] text-[#E5E9F0]/65 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
                                group-hover:text-[#E5E9F0] group-hover:translate-x-[3px]
                                group-[.active]:text-[#A3FF12] group-[.active]:font-bold group-[.active]:drop-shadow-[0_0_8px_rgba(163,255,18,0.2)]"
                        >
                            {label}
                        </span>

                    </div>
                </NavLink>
            ))}
        </aside>
    );
}