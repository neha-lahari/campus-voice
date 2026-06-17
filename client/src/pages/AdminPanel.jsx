import { useEffect, useState } from "react";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const THEME = {
    bg: '#060A13', card: '#121824',
    border: 'rgba(0,240,255,0.12)', borderMuted: 'rgba(78,93,120,0.15)',
    cyan: '#00F0FF', lime: '#A3FF12', text: '#E5E9F0', muted: '#4E5D78',
};

const STATUS_CONFIG = {
    pending: { color: '#FFA500', border: 'rgba(255,165,0,0.3)', label: 'PENDING' },
    approved: { color: '#A3FF12', border: 'rgba(163,255,18,0.3)', label: 'APPROVED' },
    rejected: { color: '#FF4444', border: 'rgba(255,68,68,0.3)', label: 'REJECTED' },
};

const ROLE_COLOR = {
    admin: '#FF4444',
    cr: '#A3FF12',
    student: '#4E5D78',
};

export default function AdminPanel() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState("requests");
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [statusFilter, setStatusFilter] = useState("pending");
    const [userSearch, setUserSearch] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.role !== "admin") navigate("/home");
    }, [user]);

    useEffect(() => {
        if (tab === "requests") fetchRequests();
        if (tab === "users") fetchUsers();
    }, [tab, statusFilter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/admin/cr-requests?status=${statusFilter}`);
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/admin/users${userSearch ? `?q=${userSearch}` : ""}`);
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const approve = async (requestId) => {
        try {
            await API.patch(`/admin/cr-requests/${requestId}/approve`);
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || "Failed");
        }
    };

    const reject = async (requestId) => {
        try {
            await API.patch(`/admin/cr-requests/${requestId}/reject`);
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || "Failed");
        }
    };

    const revokeRole = async (userId) => {
        if (!window.confirm("Revoke this user's CR role?")) return;
        try {
            await API.patch(`/admin/users/${userId}/revoke`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || "Failed");
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Share+Tech+Mono&family=Plus+Jakarta+Sans:wght@400;600&display=swap');
                .admin-input:focus { outline: none; border-color: #00F0FF !important; }
                .admin-input::placeholder { color: rgba(78,93,120,0.4); }
            `}</style>

            <div className="min-h-screen py-8 px-6" style={{ background: THEME.bg, fontFamily: "'Share Tech Mono', monospace" }}>
                <div className="max-w-4xl mx-auto">

                    <div className="mb-7">
                        <p className="text-[11px] tracking-[3px] mb-1" style={{ color: THEME.muted }}>SYSTEM ACCESS</p>
                        <h1 className="text-2xl tracking-[2px]" style={{ fontFamily: "'Orbitron', monospace", color: THEME.text }}>
                            ADMIN PANEL
                        </h1>
                    </div>

                    <div className="flex gap-2 mb-6">
                        {["requests", "users"].map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className="px-5 py-2 text-[10px] tracking-[3px] uppercase cursor-pointer transition-all duration-150 rounded"
                                style={{
                                    background: tab === t ? 'rgba(0,240,255,0.08)' : 'transparent',
                                    border: `1px solid ${tab === t ? THEME.cyan : THEME.borderMuted}`,
                                    color: tab === t ? THEME.cyan : THEME.muted,
                                    fontFamily: "'Share Tech Mono', monospace",
                                }}
                            >
                                {t === "requests" ? "CR REQUESTS" : "ALL USERS"}
                            </button>
                        ))}
                    </div>

                    {/*  CR Requests tab  */}
                    {tab === "requests" && (
                        <>
                            <div className="flex gap-2 mb-5">
                                {["pending", "approved", "rejected"].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className="px-4 py-1.5 text-[10px] tracking-[2px] uppercase cursor-pointer rounded transition-all duration-150"
                                        style={{
                                            background: statusFilter === s ? `${STATUS_CONFIG[s].color}15` : 'transparent',
                                            border: `1px solid ${statusFilter === s ? STATUS_CONFIG[s].border : THEME.borderMuted}`,
                                            color: statusFilter === s ? STATUS_CONFIG[s].color : THEME.muted,
                                            fontFamily: "'Share Tech Mono', monospace",
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            {loading && (
                                <p className="text-[10px] tracking-[3px]" style={{ color: THEME.muted }}>LOADING...</p>
                            )}

                            {!loading && requests.length === 0 && (
                                <p className="text-center py-10 text-[10px] tracking-[3px]" style={{ color: THEME.muted }}>
                                    [ NO {statusFilter.toUpperCase()} REQUESTS ]
                                </p>
                            )}

                            {!loading && requests.map(req => (
                                <div
                                    key={req._id}
                                    className="flex items-start justify-between gap-4 p-5 mb-3 rounded-lg"
                                    style={{ background: THEME.card, border: `1px solid ${THEME.borderMuted}` }}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div
                                                className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-[11px] rounded"
                                                style={{ background: 'rgba(6,10,19,0.8)', border: '1px solid rgba(78,93,120,0.3)', color: THEME.cyan }}
                                            >
                                                {req.user?.name?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-semibold m-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: THEME.text }}>
                                                    {req.user?.name}
                                                </p>
                                                <p className="text-[10px] m-0" style={{ color: THEME.muted }}>
                                                    {req.user?.email} · {req.user?.department} {req.user?.batch}
                                                </p>
                                            </div>
                                        </div>

                                        {req.community && (
                                            <p className="text-[11px] mb-1.5" style={{ color: THEME.cyan }}>
                                                CLASS: {req.community}
                                            </p>
                                        )}

                                        <p className="text-[12px] leading-relaxed m-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(229,233,240,0.7)' }}>
                                            {req.reason}
                                        </p>

                                        <p className="text-[10px] mt-2 m-0" style={{ color: THEME.muted }}>
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <span
                                            className="px-3 py-1 text-[9px] tracking-[2px] rounded"
                                            style={{ border: `1px solid ${STATUS_CONFIG[req.status].border}`, color: STATUS_CONFIG[req.status].color }}
                                        >
                                            {STATUS_CONFIG[req.status].label}
                                        </span>

                                        {req.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => approve(req._id)}
                                                    className="px-4 py-1.5 text-[10px] tracking-[2px] rounded cursor-pointer transition-all duration-150 hover:opacity-80"
                                                    style={{ background: 'rgba(163,255,18,0.08)', border: '1px solid rgba(163,255,18,0.4)', color: '#A3FF12', fontFamily: "'Share Tech Mono', monospace" }}
                                                >
                                                    ✓ APPROVE
                                                </button>
                                                <button
                                                    onClick={() => reject(req._id)}
                                                    className="px-4 py-1.5 text-[10px] tracking-[2px] rounded cursor-pointer transition-all duration-150 hover:opacity-80"
                                                    style={{ background: 'transparent', border: '1px solid rgba(255,68,68,0.3)', color: '#FF4444', fontFamily: "'Share Tech Mono', monospace" }}
                                                >
                                                    ✕ REJECT
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* ── Users tab ── */}
                    {tab === "users" && (
                        <>
                            {/* Search bar */}
                            <div className="flex gap-2 mb-5">
                                <input
                                    className="admin-input flex-1 px-4 py-2.5 text-[12px] rounded transition-all duration-200"
                                    placeholder="Search users by name..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && fetchUsers()}
                                    style={{ background: THEME.card, border: `1px solid ${THEME.borderMuted}`, color: THEME.text, fontFamily: "'Share Tech Mono', monospace" }}
                                />
                                <button
                                    onClick={fetchUsers}
                                    className="px-5 text-[10px] tracking-[2px] uppercase rounded cursor-pointer transition-all duration-150 hover:opacity-80"
                                    style={{ background: 'transparent', border: `1px solid ${THEME.borderMuted}`, color: THEME.muted, fontFamily: "'Share Tech Mono', monospace" }}
                                >
                                    SEARCH
                                </button>
                            </div>

                            {loading && (
                                <p className="text-[10px] tracking-[3px]" style={{ color: THEME.muted }}>LOADING...</p>
                            )}

                            {!loading && (
                                <div className="flex flex-col gap-2">
                                    {users.map(u => (
                                        <div
                                            key={u._id}
                                            className="flex items-center justify-between gap-3 px-5 py-3.5 rounded-lg"
                                            style={{ background: THEME.card, border: `1px solid ${THEME.borderMuted}` }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-[10px] rounded"
                                                    style={{ background: 'rgba(6,10,19,0.8)', border: '1px solid rgba(78,93,120,0.3)', color: THEME.cyan }}
                                                >
                                                    {u.name?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-semibold m-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: THEME.text }}>
                                                        {u.name}
                                                    </p>
                                                    <p className="text-[10px] m-0" style={{ color: THEME.muted }}>
                                                        {u.department} · {u.batch} · karma {u.karma}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2.5">
                                                <span
                                                    className="px-3 py-1 text-[9px] tracking-[2px] rounded"
                                                    style={{ border: `1px solid ${ROLE_COLOR[u.role]}40`, color: ROLE_COLOR[u.role], fontFamily: "'Orbitron', monospace" }}
                                                >
                                                    {u.role.toUpperCase()}
                                                </span>

                                                {u.role === "cr" && (
                                                    <button
                                                        onClick={() => revokeRole(u._id)}
                                                        className="px-3 py-1 text-[9px] tracking-[1px] rounded cursor-pointer transition-all duration-150 hover:opacity-80"
                                                        style={{ background: 'transparent', border: '1px solid rgba(255,68,68,0.3)', color: '#FF4444', fontFamily: "'Share Tech Mono', monospace" }}
                                                    >
                                                        REVOKE
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                </div>
            </div>
        </>
    );
}