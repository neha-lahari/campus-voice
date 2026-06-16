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

export default function AdminPanel() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState("requests");
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [statusFilter, setStatusFilter] = useState("pending");
    const [userSearch, setUserSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // redirect non-admins
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
                ::-webkit-scrollbar { width: 3px; }
                ::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.15); }
            `}</style>

            <div style={{
                minHeight: '100vh', background: THEME.bg, padding: '32px 24px',
                fontFamily: "'Share Tech Mono', monospace"
            }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>

                    {/* HEADER */}
                    <div style={{ marginBottom: 28 }}>
                        <p style={{ fontSize: 11, color: THEME.muted, letterSpacing: 3, margin: '0 0 4px 0' }}>
                            SYSTEM ACCESS
                        </p>
                        <h1 style={{
                            fontSize: 22, color: THEME.text, margin: 0,
                            fontFamily: "'Orbitron', monospace", letterSpacing: 2
                        }}>
                            ADMIN PANEL
                        </h1>
                    </div>

                    {/* TABS */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                        {["requests", "users"].map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                style={{
                                    padding: '8px 20px', fontSize: 10, letterSpacing: 3,
                                    textTransform: 'uppercase', cursor: 'pointer',
                                    background: tab === t ? 'rgba(0,240,255,0.08)' : 'transparent',
                                    border: `1px solid ${tab === t ? THEME.cyan : THEME.borderMuted}`,
                                    color: tab === t ? THEME.cyan : THEME.muted,
                                    fontFamily: "'Share Tech Mono', monospace",
                                    transition: 'all 0.15s'
                                }}
                            >
                                {t === "requests" ? "CR REQUESTS" : "ALL USERS"}
                            </button>
                        ))}
                    </div>

                    {/* ===== CR REQUESTS TAB ===== */}
                    {tab === "requests" && (
                        <>
                            {/* STATUS FILTER */}
                            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                                {["pending", "approved", "rejected"].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        style={{
                                            padding: '5px 14px', fontSize: 10, letterSpacing: 2,
                                            textTransform: 'uppercase', cursor: 'pointer',
                                            background: statusFilter === s ? `rgba(${s === 'pending' ? '255,165,0' : s === 'approved' ? '163,255,18' : '255,68,68'},0.08)` : 'transparent',
                                            border: `1px solid ${statusFilter === s ? STATUS_CONFIG[s].border : THEME.borderMuted}`,
                                            color: statusFilter === s ? STATUS_CONFIG[s].color : THEME.muted,
                                            fontFamily: "'Share Tech Mono', monospace"
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <p style={{ fontSize: 10, color: THEME.muted, letterSpacing: 3 }}>LOADING...</p>
                            ) : requests.length === 0 ? (
                                <p style={{ fontSize: 10, color: THEME.muted, letterSpacing: 3, textAlign: 'center', padding: 40 }}>
                                    [ NO {statusFilter.toUpperCase()} REQUESTS ]
                                </p>
                            ) : (
                                requests.map(req => (
                                    <div key={req._id} style={{
                                        background: THEME.card, marginBottom: 12,
                                        border: `1px solid ${THEME.borderMuted}`,
                                        padding: '16px 20px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                            <div style={{ flex: 1 }}>
                                                {/* USER INFO */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                    <div style={{
                                                        width: 36, height: 36, background: 'rgba(6,10,19,0.8)',
                                                        border: `1px solid rgba(78,93,120,0.3)`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 11, color: THEME.cyan, flexShrink: 0,
                                                        clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))'
                                                    }}>
                                                        {req.user?.name?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: 13, color: THEME.text, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                                                            {req.user?.name}
                                                        </p>
                                                        <p style={{ margin: 0, fontSize: 10, color: THEME.muted }}>
                                                            {req.user?.email} · {req.user?.department} {req.user?.batch}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* COMMUNITY */}
                                                {req.community && (
                                                    <p style={{ margin: '0 0 6px 0', fontSize: 11, color: THEME.cyan }}>
                                                        CLASS: {req.community}
                                                    </p>
                                                )}

                                                {/* REASON */}
                                                <p style={{ margin: 0, fontSize: 12, color: 'rgba(229,233,240,0.7)', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.5 }}>
                                                    {req.reason}
                                                </p>

                                                <p style={{ margin: '8px 0 0 0', fontSize: 10, color: THEME.muted }}>
                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            {/* ACTIONS */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                                                {/* STATUS BADGE */}
                                                <span style={{
                                                    padding: '3px 12px', fontSize: 9, letterSpacing: 2,
                                                    border: `1px solid ${STATUS_CONFIG[req.status].border}`,
                                                    color: STATUS_CONFIG[req.status].color,
                                                    textAlign: 'center'
                                                }}>
                                                    {STATUS_CONFIG[req.status].label}
                                                </span>

                                                {req.status === "pending" && (
                                                    <>
                                                        <button onClick={() => approve(req._id)} style={{
                                                            padding: '7px 16px', fontSize: 10, letterSpacing: 2,
                                                            background: 'rgba(163,255,18,0.08)',
                                                            border: '1px solid rgba(163,255,18,0.4)',
                                                            color: '#A3FF12', cursor: 'pointer',
                                                            fontFamily: "'Share Tech Mono', monospace"
                                                        }}>
                                                            ✓ APPROVE
                                                        </button>
                                                        <button onClick={() => reject(req._id)} style={{
                                                            padding: '7px 16px', fontSize: 10, letterSpacing: 2,
                                                            background: 'transparent',
                                                            border: '1px solid rgba(255,68,68,0.3)',
                                                            color: '#FF4444', cursor: 'pointer',
                                                            fontFamily: "'Share Tech Mono', monospace"
                                                        }}>
                                                            ✕ REJECT
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    )}

                    {/* ===== USERS TAB ===== */}
                    {tab === "users" && (
                        <>
                            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                                <input
                                    className="admin-input"
                                    placeholder="Search users by name..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && fetchUsers()}
                                    style={{
                                        flex: 1, padding: '9px 14px', fontSize: 12,
                                        background: THEME.card, border: `1px solid ${THEME.borderMuted}`,
                                        color: THEME.text, fontFamily: "'Share Tech Mono', monospace"
                                    }}
                                />
                                <button onClick={fetchUsers} style={{
                                    padding: '9px 20px', fontSize: 10, letterSpacing: 2,
                                    background: 'transparent', border: `1px solid ${THEME.borderMuted}`,
                                    color: THEME.muted, cursor: 'pointer',
                                    fontFamily: "'Share Tech Mono', monospace"
                                }}>
                                    SEARCH
                                </button>
                            </div>

                            {loading ? (
                                <p style={{ fontSize: 10, color: THEME.muted, letterSpacing: 3 }}>LOADING...</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {users.map(u => {
                                        const rc = { admin: '#FF4444', cr: '#A3FF12', student: '#4E5D78' };
                                        return (
                                            <div key={u._id} style={{
                                                background: THEME.card, padding: '14px 18px',
                                                border: `1px solid ${THEME.borderMuted}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{
                                                        width: 32, height: 32, background: 'rgba(6,10,19,0.8)',
                                                        border: `1px solid rgba(78,93,120,0.3)`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: 10, color: THEME.cyan,
                                                        clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))'
                                                    }}>
                                                        {u.name?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: 13, color: THEME.text, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                                                            {u.name}
                                                        </p>
                                                        <p style={{ margin: 0, fontSize: 10, color: THEME.muted }}>
                                                            {u.department} · {u.batch} · karma {u.karma}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{
                                                        padding: '3px 12px', fontSize: 9, letterSpacing: 2,
                                                        border: `1px solid ${rc[u.role]}40`,
                                                        color: rc[u.role], fontFamily: "'Orbitron', monospace"
                                                    }}>
                                                        {u.role.toUpperCase()}
                                                    </span>

                                                    {u.role === "cr" && (
                                                        <button onClick={() => revokeRole(u._id)} style={{
                                                            padding: '5px 12px', fontSize: 9, letterSpacing: 1,
                                                            background: 'transparent',
                                                            border: '1px solid rgba(255,68,68,0.3)',
                                                            color: '#FF4444', cursor: 'pointer',
                                                            fontFamily: "'Share Tech Mono', monospace"
                                                        }}>
                                                            REVOKE
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}