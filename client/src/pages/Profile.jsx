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
    const [crRequest, setCRRequest] = useState(null);
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

    const tabs = [
        { id: "posts", label: "POSTS" },
        { id: "comments", label: "COMMENTS" },
        { id: "saved", label: "SAVED" },
    ];

    // Loading state
    if (!user) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: `linear-gradient(to bottom, ${THEME.bgMainStart}, ${THEME.bgMainEnd})` }}
            >
                <span
                    className="text-[12px] tracking-[4px]"
                    style={{ color: THEME.accentSecondary, fontFamily: "'Share Tech Mono', monospace" }}
                >
                    [ LOADING PROFILE... ]
                </span>
            </div>
        );
    }

    const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.student;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
                .tab-btn:hover { border-color: rgba(0,240,255,0.4) !important; color: #00F0FF !important; }
                .cr-input:focus { outline: none; border-color: #00F0FF !important; }
                .cr-input::placeholder { color: rgba(78,93,120,0.4); }
            `}</style>

            <div
                className="min-h-screen w-full py-10 px-4"
                style={{ background: `linear-gradient(to bottom, ${THEME.bgMainStart}, ${THEME.bgMainEnd})` }}
            >
                <div className="max-w-3xl mx-auto space-y-4">

                    {/* User card */}
                    <div
                        className="rounded-lg overflow-hidden"
                        style={{ background: THEME.bgCard, border: '1px solid rgba(0,240,255,0.12)' }}
                    >
                        <UserCard user={user} />
                    </div>

                    {/* Role + CR request */}
                    <div
                        className="flex items-center justify-between flex-wrap gap-3 px-5 py-4 rounded-lg"
                        style={{ background: THEME.bgCard, border: '1px solid rgba(0,240,255,0.08)', fontFamily: "'Share Tech Mono', monospace" }}
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className="text-[10px] tracking-[2px] px-3 py-1 rounded"
                                style={{ color: roleConfig.color, border: `1px solid ${roleConfig.border}`, background: roleConfig.bg }}
                            >
                                {roleConfig.label}
                            </span>
                            {user.department && (
                                <span className="text-[10px]" style={{ color: THEME.textMuted }}>
                                    {user.department} · {user.batch}
                                </span>
                            )}
                        </div>

                        {isOwnProfile && currentUser?.role === "student" && (
                            <div>
                                {!crRequest && (
                                    <button
                                        onClick={() => setShowCRModal(true)}
                                        className="text-[10px] tracking-[2px] px-4 py-1.5 transition-all duration-200 hover:opacity-80"
                                        style={{ fontFamily: "'Orbitron', monospace", background: 'transparent', border: `1px solid ${THEME.accentPrimary}`, color: THEME.accentPrimary, cursor: 'pointer', borderRadius: 4 }}
                                    >
                                        REQUEST CR ROLE
                                    </button>
                                )}
                                {crRequest?.status === "pending" && (
                                    <span className="text-[10px] tracking-[2px] px-4 py-1.5 rounded" style={{ border: '1px solid rgba(255,165,0,0.4)', color: '#FFA500' }}>
                                        CR REQUEST PENDING
                                    </span>
                                )}
                                {crRequest?.status === "approved" && (
                                    <span className="text-[10px] tracking-[2px] px-4 py-1.5 rounded" style={{ border: '1px solid rgba(163,255,18,0.4)', color: THEME.accentPrimary }}>
                                        REQUEST APPROVED
                                    </span>
                                )}
                                {crRequest?.status === "rejected" && (
                                    <button
                                        onClick={() => setShowCRModal(true)}
                                        className="text-[10px] tracking-[2px] px-4 py-1.5 rounded transition-all duration-200 hover:opacity-80"
                                        style={{ fontFamily: "'Share Tech Mono', monospace", background: 'transparent', border: '1px solid rgba(255,68,68,0.4)', color: '#FF4444', cursor: 'pointer' }}
                                    >
                                        REJECTED — REQUEST AGAIN
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="tab-btn px-4 py-1.5 text-[10px] font-bold tracking-[2px] rounded transition-all duration-200"
                                    style={{
                                        fontFamily: "'Orbitron', monospace",
                                        background: 'transparent',
                                        color: isActive ? THEME.accentPrimary : THEME.textMuted,
                                        border: `1px solid ${isActive ? THEME.accentPrimary : 'rgba(78,93,120,0.2)'}`,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {isActive ? `[ ${tab.label} ]` : tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab content */}
                    <div
                        className="rounded-lg p-6"
                        style={{ background: THEME.bgCard, border: '1px solid rgba(0,240,255,0.08)', minHeight: 300, color: THEME.textMain }}
                    >
                        <div className="flex items-center gap-2 mb-5 text-[11px] tracking-[2px]" style={{ color: 'rgba(0,240,255,0.5)', fontFamily: "'Share Tech Mono', monospace" }}>
                            {activeTab.toUpperCase()}
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(0,240,255,0.15), transparent)' }} />
                        </div>

                        {activeTab === "posts" && <UserPosts posts={user.posts} />}
                        {activeTab === "comments" && <UserComments comments={user.comments} />}
                        {activeTab === "saved" && <SavedPosts />}
                    </div>

                </div>
            </div>

            {/* CR Request Modal */}
            {showCRModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.85)' }}
                >
                    <div
                        className="w-full max-w-[460px] rounded-lg p-7"
                        style={{ background: THEME.bgCard, border: '1px solid rgba(0,240,255,0.15)', fontFamily: "'Share Tech Mono', monospace" }}
                    >
                        {/* Modal header */}
                        <p className="text-[12px] tracking-[3px] mb-1" style={{ color: THEME.accentSecondary }}>
                            REQUEST CR ROLE
                        </p>
                        <p className="text-[10px] tracking-[1px] mb-5" style={{ color: THEME.textMuted }}>
                            Admin will review your request and assign the CR role if approved.
                        </p>

                        {/* Community input */}
                        <input
                            className="cr-input w-full px-4 py-2.5 mb-3 rounded text-sm transition-all duration-200"
                            placeholder="Your class / community (e.g. CSE-A 2nd Year)"
                            value={crForm.community}
                            onChange={e => setCRForm({ ...crForm, community: e.target.value })}
                            style={{
                                background: 'rgba(6,10,19,0.6)',
                                border: '1px solid rgba(78,93,120,0.2)',
                                color: THEME.textMain,
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                boxSizing: 'border-box',
                            }}
                        />

                        {/* Reason textarea */}
                        <textarea
                            className="cr-input w-full px-4 py-2.5 mb-5 rounded text-sm transition-all duration-200"
                            placeholder="Why do you want CR role? *"
                            value={crForm.reason}
                            onChange={e => setCRForm({ ...crForm, reason: e.target.value })}
                            rows={4}
                            style={{
                                background: 'rgba(6,10,19,0.6)',
                                border: '1px solid rgba(78,93,120,0.2)',
                                color: THEME.textMain,
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                resize: 'vertical',
                                boxSizing: 'border-box',
                            }}
                        />

                        {/* Modal buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={submitCRRequest}
                                disabled={crLoading || !crForm.reason.trim()}
                                className="flex-1 py-2.5 rounded text-[11px] font-bold tracking-[2px] transition-all duration-200"
                                style={{
                                    fontFamily: "'Orbitron', monospace",
                                    background: THEME.accentPrimary,
                                    color: '#060A13',
                                    border: 'none',
                                    cursor: crLoading || !crForm.reason.trim() ? 'not-allowed' : 'pointer',
                                    opacity: crLoading || !crForm.reason.trim() ? 0.5 : 1,
                                }}
                            >
                                {crLoading ? "SUBMITTING..." : "SUBMIT REQUEST"}
                            </button>
                            <button
                                onClick={() => setShowCRModal(false)}
                                className="px-5 py-2.5 rounded text-[11px] tracking-[1px] transition-all duration-200 hover:opacity-70"
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(78,93,120,0.3)',
                                    color: THEME.textMuted,
                                    cursor: 'pointer',
                                    fontFamily: "'Share Tech Mono', monospace",
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