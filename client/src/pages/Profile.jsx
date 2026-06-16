import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";
import UserCard from "../components/profile/UserCard";
import UserPosts from "../components/profile/UserPosts";
import UserComments from "../components/profile/UserComments";
import SavedPosts from "../components/profile/SavedPosts";

const THEME = {
    bgMainStart: '#060A13',
    bgMainEnd: '#0B111E',
    bgCard: '#121824',
    accentPrimary: '#A3FF12',
    accentSecondary: '#00F0FF',
    textMain: '#E5E9F0',
    textMuted: '#4E5D78',
};

const ROLE_CONFIG = {
    admin: { label: 'ADMIN', color: '#FF4444', border: 'rgba(255,68,68,0.4)', bg: 'rgba(255,68,68,0.08)' },
    cr: { label: 'CR', color: '#A3FF12', border: 'rgba(163,255,18,0.4)', bg: 'rgba(163,255,18,0.08)' },
    student: { label: 'STUDENT', color: '#4E5D78', border: 'rgba(78,93,120,0.3)', bg: 'transparent' },
};

export default function Profile() {
    const { id } = useParams();
    const { user: currentUser } = useAuth();

    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("posts");
    const [crRequest, setCRRequest] = useState(null);   // current user's CR request
    const [crLoading, setCRLoading] = useState(false);
    const [showCRModal, setShowCRModal] = useState(false);
    const [crForm, setCRForm] = useState({ reason: "", community: "" });

    const isOwnProfile = currentUser?._id === id || currentUser?.id === id;

    useEffect(() => {
        fetchProfile();
        if (isOwnProfile && currentUser?.role === "student") {
            fetchMyCRRequest();
        }
    }, [id]);

    const fetchProfile = async () => {
        try {
            const res = await API.get(`/profile/${id}`);
            setUser(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyCRRequest = async () => {
        try {
            const res = await API.get("/admin/cr-request/me");
            setCRRequest(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const submitCRRequest = async () => {
        if (!crForm.reason.trim()) return;
        setCRLoading(true);
        try {
            await API.post("/admin/cr-request", crForm);
            setShowCRModal(false);
            setCRForm({ reason: "", community: "" });
            fetchMyCRRequest();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to submit request");
        } finally {
            setCRLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ background: `linear-gradient(to bottom, ${THEME.bgMainStart}, ${THEME.bgMainEnd})` }}>
                <div style={{ color: THEME.accentSecondary, fontFamily: "'Share Tech Mono', monospace", fontSize: 12, letterSpacing: 4 }}>
                    [ LOADING DATA PROFILE... ]
                </div>
            </div>
        );
    }

    const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.student;

    const tabs = [
        { id: "posts", label: "POSTS" },
        { id: "comments", label: "COMMENTS" },
        { id: "saved", label: "SAVED" }
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
                .tab-btn { transition: all 0.2s; }
                .tab-btn:hover { border-color: rgba(0,240,255,0.4) !important; color: #00F0FF !important; }
                .cr-input:focus { outline: none; border-color: #00F0FF !important; }
                .cr-input::placeholder { color: rgba(78,93,120,0.4); }
            `}</style>

            <div className="min-h-screen w-full py-10 px-4"
                style={{ background: `linear-gradient(to bottom, ${THEME.bgMainStart}, ${THEME.bgMainEnd})` }}>
                <div className="max-w-3xl mx-auto space-y-6">

                    {/* USER CARD */}
                    <div style={{
                        background: THEME.bgCard,
                        border: '1px solid rgba(0,240,255,0.12)',
                        clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
                    }} className="p-1">
                        <UserCard user={user} />
                    </div>

                    {/* ROLE + CR REQUEST SECTION */}
                    <div style={{
                        background: THEME.bgCard,
                        border: '1px solid rgba(0,240,255,0.08)',
                        padding: '16px 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 12,
                        fontFamily: "'Share Tech Mono', monospace"
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 10, color: THEME.textMuted, letterSpacing: 2 }}>ROLE</span>

                            {/* ROLE BADGE */}
                            <span style={{
                                padding: '4px 14px', fontSize: 11, letterSpacing: 3,
                                fontWeight: 700, border: `1px solid ${roleConfig.border}`,
                                color: roleConfig.color, background: roleConfig.bg,
                                fontFamily: "'Orbitron', monospace"
                            }}>
                                {roleConfig.label}
                            </span>

                            {/* DEPT + BATCH */}
                            {user.department && (
                                <span style={{ fontSize: 10, color: THEME.textMuted }}>
                                    {user.department} · {user.batch}
                                </span>
                            )}
                        </div>

                        {/* CR REQUEST BUTTON — only on own profile, only for students */}
                        {isOwnProfile && currentUser?.role === "student" && (
                            <div>
                                {!crRequest && (
                                    <button
                                        onClick={() => setShowCRModal(true)}
                                        style={{
                                            padding: '7px 16px', fontSize: 10,
                                            background: 'transparent',
                                            border: `1px solid ${THEME.accentPrimary}`,
                                            color: THEME.accentPrimary,
                                            cursor: 'pointer', letterSpacing: 2,
                                            fontFamily: "'Orbitron', monospace"
                                        }}
                                    >
                                        REQUEST CR ROLE
                                    </button>
                                )}

                                {crRequest?.status === "pending" && (
                                    <span style={{
                                        padding: '6px 14px', fontSize: 10, letterSpacing: 2,
                                        border: '1px solid rgba(255,165,0,0.4)',
                                        color: '#FFA500'
                                    }}>
                                        ⏳ CR REQUEST PENDING
                                    </span>
                                )}

                                {crRequest?.status === "approved" && (
                                    <span style={{
                                        padding: '6px 14px', fontSize: 10, letterSpacing: 2,
                                        border: '1px solid rgba(163,255,18,0.4)',
                                        color: THEME.accentPrimary
                                    }}>
                                        ✅ REQUEST APPROVED
                                    </span>
                                )}

                                {crRequest?.status === "rejected" && (
                                    <button
                                        onClick={() => setShowCRModal(true)}
                                        style={{
                                            padding: '7px 16px', fontSize: 10,
                                            background: 'transparent',
                                            border: '1px solid rgba(255,68,68,0.4)',
                                            color: '#FF4444',
                                            cursor: 'pointer', letterSpacing: 2,
                                            fontFamily: "'Share Tech Mono', monospace"
                                        }}
                                    >
                                        ❌ REJECTED — REQUEST AGAIN
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* TABS */}
                    <div className="flex gap-2">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="tab-btn px-3 py-1.5 text-[10px] font-bold tracking-[2px] uppercase"
                                    style={{
                                        fontFamily: "'Orbitron', monospace",
                                        background: 'transparent',
                                        color: isActive ? THEME.accentPrimary : THEME.textMuted,
                                        border: `1px solid ${isActive ? THEME.accentPrimary : 'rgba(78,93,120,0.2)'}`,
                                        clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {isActive ? `[ ${tab.label} ]` : tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* CONTENT */}
                    <div style={{
                        background: THEME.bgCard, padding: 24,
                        border: '1px solid rgba(0,240,255,0.08)',
                        clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
                        minHeight: 300, color: THEME.textMain
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            marginBottom: 20, fontSize: 11, color: 'rgba(0,240,255,0.5)',
                            fontFamily: "'Share Tech Mono', monospace", letterSpacing: 2
                        }}>
                            FEED_STREAM // {activeTab.toUpperCase()}
                            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, rgba(0,240,255,0.15), transparent)' }} />
                        </div>

                        {activeTab === "posts" && <UserPosts posts={user.posts} />}
                        {activeTab === "comments" && <UserComments comments={user.comments} />}
                        {activeTab === "saved" && <SavedPosts />}
                    </div>
                </div>
            </div>

            {/* CR REQUEST MODAL */}
            {showCRModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: THEME.bgCard, width: 460, padding: 28,
                        border: '1px solid rgba(0,240,255,0.15)',
                        clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
                        fontFamily: "'Share Tech Mono', monospace"
                    }}>
                        <p style={{ fontSize: 12, color: THEME.accentSecondary, letterSpacing: 3, marginBottom: 6 }}>
                            REQUEST CR ROLE
                        </p>
                        <p style={{ fontSize: 10, color: THEME.textMuted, letterSpacing: 1, marginBottom: 20 }}>
                            Admin will review your request and assign the CR role if approved.
                        </p>

                        {/* COMMUNITY */}
                        <input
                            className="cr-input"
                            placeholder="Your class / community (e.g. CSE-A 2nd Year)"
                            value={crForm.community}
                            onChange={e => setCRForm({ ...crForm, community: e.target.value })}
                            style={{
                                width: '100%', padding: '10px 14px', marginBottom: 12,
                                background: 'rgba(6,10,19,0.6)', border: '1px solid rgba(78,93,120,0.2)',
                                color: THEME.textMain, fontSize: 12, boxSizing: 'border-box',
                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                        />

                        {/* REASON */}
                        <textarea
                            className="cr-input"
                            placeholder="Why do you want CR role? *"
                            value={crForm.reason}
                            onChange={e => setCRForm({ ...crForm, reason: e.target.value })}
                            rows={4}
                            style={{
                                width: '100%', padding: '10px 14px', marginBottom: 20,
                                background: 'rgba(6,10,19,0.6)', border: '1px solid rgba(78,93,120,0.2)',
                                color: THEME.textMain, fontSize: 13, resize: 'vertical',
                                boxSizing: 'border-box',
                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                        />

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={submitCRRequest}
                                disabled={crLoading || !crForm.reason.trim()}
                                style={{
                                    flex: 1, padding: '10px 0',
                                    background: THEME.accentPrimary, color: '#060A13',
                                    border: 'none', cursor: 'pointer', fontSize: 11,
                                    fontWeight: 700, letterSpacing: 2,
                                    fontFamily: "'Orbitron', monospace",
                                    opacity: crLoading || !crForm.reason.trim() ? 0.5 : 1
                                }}
                            >
                                {crLoading ? "SUBMITTING..." : "SUBMIT REQUEST"}
                            </button>
                            <button
                                onClick={() => setShowCRModal(false)}
                                style={{
                                    padding: '10px 20px', background: 'transparent',
                                    border: '1px solid rgba(78,93,120,0.3)',
                                    color: THEME.textMuted, cursor: 'pointer', fontSize: 11
                                }}
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}