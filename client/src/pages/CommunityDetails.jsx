import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";

import PostCard from "../components/PostCard";
import CommunityChat from "../components/chat/CommunityChat";
import CreatePostModal from "../components/CreatePostModal";
import NoticeBoard from "../components/notices/NoticeBoard";

const FLAIRS = ["All", "Doubt", "Resource", "Announcement", "Meme", "News"];
const TABS = ["Feed", "Chat", "Notice Board"];

const THEME = {
    bgMainStart: '#060A13',
    bgMainEnd: '#0B111E',
    bgCard: '#121824',
    accentPrimary: '#A3FF12',
    accentSecondary: '#00F0FF',
    textMain: '#E5E9F0',
    textMuted: '#4E5D78',
};

export default function CommunityDetails() {
    const { slug } = useParams();
    const { user } = useAuth();

    const [community, setCommunity] = useState(null);
    const [posts, setPosts] = useState([]);
    const [activeFlair, setActiveFlair] = useState("All");
    const [activeTab, setActiveTab] = useState("Feed");
    const [showModal, setShowModal] = useState(false);

    const fetchCommunity = async () => {
        try {
            const res = await API.get(`/communities/${slug}`);
            setCommunity(res.data.community);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPosts = async (communityId) => {
        try {
            if (!communityId) return;
            const res = await API.get(`/posts?community=${communityId}`);
            setPosts(res.data.posts);
        } catch (err) {
            console.error(err);
        }
    };

    const handleJoinLeave = async () => {
        try {
            await API.post(`/communities/${community._id}/join`);
            fetchCommunity();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCommunity();
    }, [slug]);

    useEffect(() => {
        if (community?._id) {
            fetchPosts(community._id);
        }
    }, [community]);

    const filteredPosts =
        activeFlair === "All"
            ? posts
            : posts.filter(p => p.flair === activeFlair);

    if (!community) {
        return (
            <>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');`}</style>
                <div
                    className="min-h-screen flex items-center justify-center"
                    style={{
                        background: `linear-gradient(to bottom, ${THEME.bgMainStart}, ${THEME.bgMainEnd})`,
                        fontFamily: "'Share Tech Mono', monospace"
                    }}
                >
                    <div className="text-sm tracking-[2px]" style={{ color: THEME.accentSecondary }}>
                        Loading...
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&family=Rajdhani:wght@500;600&display=swap');
                .tab-btn { transition: all 0.2s ease; }
                .flair-btn { transition: all 0.2s ease; }
                .action-trigger { transition: all 0.2s ease; }
                .action-trigger:hover {
                    border-color: ${THEME.accentSecondary} !important;
                    background: rgba(0, 240, 255, 0.02);
                }
            `}</style>

            <div
                className="min-h-screen w-full pb-12"
                style={{ background: `linear-gradient(to bottom, ${THEME.bgMainStart}, ${THEME.bgMainEnd})` }}
            >
                {/* HEADER */}
                <div
                    className="w-full border-b pt-8 pb-0"
                    style={{
                        background: `linear-gradient(to bottom, #0d1627, ${THEME.bgMainStart})`,
                        borderColor: 'rgba(0, 240, 255, 0.1)'
                    }}
                >
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1
                                    className="text-2xl font-bold tracking-wide"
                                    style={{ fontFamily: "'Orbitron', monospace", color: THEME.textMain }}
                                >
                                    {community.name}
                                </h1>
                                <p
                                    className="mt-2 text-sm leading-relaxed"
                                    style={{ fontFamily: "'Rajdhani', sans-serif", color: '#b2c0d4' }}
                                >
                                    {community.description}
                                </p>
                                <p
                                    className="text-xs mt-2 tracking-[1px]"
                                    style={{ fontFamily: "'Share Tech Mono', monospace", color: THEME.textMuted }}
                                >
                                    {community.memberCount ?? 0} members
                                </p>
                            </div>

                            <button
                                onClick={handleJoinLeave}
                                className="px-5 py-1.5 text-[11px] font-bold tracking-[1px] uppercase transition-all duration-200"
                                style={{
                                    fontFamily: "'Orbitron', monospace",
                                    background: community.isJoined ? 'transparent' : THEME.accentPrimary,
                                    color: community.isJoined ? '#ff4444' : '#060A13',
                                    border: community.isJoined ? '1px solid rgba(255, 68, 68, 0.4)' : `1px solid ${THEME.accentPrimary}`,
                                    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                                    cursor: 'pointer'
                                }}
                            >
                                {community.isJoined ? "Leave" : "Join"}
                            </button>
                        </div>

                        {/* TABS */}
                        <div className="flex gap-6 mt-8">
                            {TABS.map(tab => {
                                const isSelected = activeTab === tab;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className="tab-btn pb-3 text-xs tracking-[2px] uppercase relative bg-transparent border-none cursor-pointer"
                                        style={{ color: isSelected ? THEME.accentSecondary : THEME.textMuted }}
                                    >
                                        {tab}
                                        {isSelected && (
                                            <div
                                                className="absolute bottom-0 left-0 w-full h-[2px]"
                                                style={{ background: THEME.accentSecondary }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* TAB CONTENT */}
                <div className="max-w-4xl mx-auto px-4 py-6">

                    {/* FEED */}
                    {activeTab === "Feed" && (
                        <>
                            <div className="flex gap-2 flex-wrap mb-5">
                                {FLAIRS.map(flair => {
                                    const isSelected = activeFlair === flair;
                                    return (
                                        <button
                                            key={flair}
                                            onClick={() => setActiveFlair(flair)}
                                            className="flair-btn px-3 py-1 text-xs rounded-none transition-all cursor-pointer"
                                            style={{
                                                background: isSelected ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                                                color: isSelected ? THEME.accentSecondary : THEME.textMuted,
                                                border: isSelected ? `1px solid ${THEME.accentSecondary}` : '1px solid rgba(78, 93, 120, 0.2)'
                                            }}
                                        >
                                            {flair}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setShowModal(true)}
                                className="action-trigger w-full mb-5 py-3 text-left px-4 text-xs tracking-[1px] rounded-none border"
                                style={{
                                    background: THEME.bgCard,
                                    borderColor: 'rgba(0, 240, 255, 0.12)',
                                    color: THEME.textMuted
                                }}
                            >
                                + Create a post...
                            </button>

                            <div className="space-y-4">
                                {filteredPosts.length === 0 ? (
                                    <p
                                        className="text-center py-12 text-xs tracking-[1px]"
                                        style={{ fontFamily: "'Share Tech Mono', monospace", color: THEME.textMuted }}
                                    >
                                        No posts found in this section
                                    </p>
                                ) : (
                                    filteredPosts.map(p => (
                                        <PostCard key={p._id} post={p} />
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {/* CHAT
                        ✅ FIX: Removed clipPath — it breaks position:fixed modals inside children */}
                    {activeTab === "Chat" && (
                        <div
                            className="border"
                            style={{
                                borderColor: 'rgba(0, 240, 255, 0.12)',
                                background: THEME.bgCard
                            }}
                        >
                            <CommunityChat communityId={community._id} userRole={user?.role} />
                        </div>
                    )}

                    {/* NOTICE BOARD
                        ✅ FIX: Removed clipPath — it was trapping the modal inside the clipped
                        container, making it render as an inline block instead of a full overlay.
                        position:fixed children escape normal flow but NOT clip-path boundaries. */}
                    {activeTab === "Notice Board" && (
                        <div
                            className="border"
                            style={{
                                borderColor: 'rgba(0, 240, 255, 0.12)',
                                background: THEME.bgCard
                            }}
                        >
                            <NoticeBoard
                                communityId={community._id}
                                userRole={user?.role}
                            />
                        </div>
                    )}

                </div>

                {/* CREATE POST MODAL */}
                {showModal && (
                    <CreatePostModal
                        communityId={community._id}
                        onClose={() => setShowModal(false)}
                        onPostCreated={() => {
                            setShowModal(false);
                            fetchPosts(community._id);
                        }}
                    />
                )}
            </div>
        </>
    );
}