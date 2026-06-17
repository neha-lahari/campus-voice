import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
    { label: 'HOME', to: '/home' },
    { label: 'COMMUNITIES', to: '/communities' },
    { label: 'MESSAGES', to: '/messages' },
    { label: 'PROFILE', to: null },
];

export default function Sidebar() {
    const { user } = useAuth();

    const navItems = links.map(l =>
        l.label === 'PROFILE'
            ? { ...l, to: `/profile/${user?._id}` }
            : l
    );

    return (
        <aside className="w-[215px] min-h-screen sticky top-14 h-[calc(100vh-56px)] flex flex-col gap-0.5 py-6"
            style={{ background: '#060A13', borderRight: '1px solid rgba(78,93,120,0.15)' }}
        >
            {navItems.map(({ label, to }) => (
                <NavLink key={label} to={to}>
                    {({ isActive }) => (
                        <div
                            className="flex items-center gap-3 px-5 py-2.5 mx-2 rounded transition-all duration-200"
                            style={{
                                background: isActive ? 'rgba(163,255,18,0.06)' : 'transparent',
                                borderLeft: isActive ? '2px solid #A3FF12' : '2px solid transparent',
                            }}
                        >
                            <span
                                className="text-[10.5px] font-semibold tracking-[1.25px] transition-colors duration-200"
                                style={{ color: isActive ? '#A3FF12' : 'rgba(229,233,240,0.6)' }}
                            >
                                {label}
                            </span>
                        </div>
                    )}
                </NavLink>
            ))}
        </aside>
    );
}