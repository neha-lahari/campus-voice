import { useEffect, useState } from "react";
import { fetchPosts } from "../api/postApi";
import PostCard from "../components/PostCard";
import CreatePostModal from "../components/CreatePostModal";

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // ✅ FIXED MODAL STATE (same name you already used)
    const [showModal, setShowModal] = useState(false);

    const loadPosts = async (p = 1) => {
        setLoading(true);
        try {
            const res = await fetchPosts(p);
            setPosts(res.data.posts);
        } catch (err) {
            console.error("Failed to fetch posts", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts(page);
    }, [page]);

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@300;500;600&display=swap');`}</style>

            <div
                className="min-h-screen relative overflow-hidden p-8"
                style={{ background: "#020810", fontFamily: "'Rajdhani', sans-serif" }}
            >
                {/* BG grid */}
                <div
                    className="fixed inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(57,255,100,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(57,255,100,0.025) 1px, transparent 1px)
            `,
                        backgroundSize: "48px 48px",
                        animation: "bgScroll 25s linear infinite",
                    }}
                />

                {/* Scanlines */}
                <div
                    className="fixed inset-0 pointer-events-none"
                    style={{
                        background: "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)",
                    }}
                />

                {/* Glow orbs */}
                <div className="fixed top-[-150px] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(57,255,100,0.07) 0%, transparent 70%)" }} />
                <div className="fixed bottom-[-80px] right-[-60px] w-[350px] h-[350px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(0,200,255,0.05) 0%, transparent 70%)" }} />

                {/* Content */}
                <div className="relative z-10 max-w-2xl mx-auto">

                    {/* HEADER */}
                    <div
                        className="flex items-center justify-between mb-7 pb-5 relative"
                        style={{ borderBottom: "1px solid rgba(57,255,100,0.12)" }}
                    >
                        <div
                            className="absolute bottom-[-1px] left-0 w-20 h-[1px]"
                            style={{ background: "#39ff64", boxShadow: "0 0 10px rgba(57,255,100,0.8)" }}
                        />

                        <div className="flex flex-col gap-[2px]">
                            <span
                                className="text-[10px] tracking-[3px] uppercase"
                                style={{ fontFamily: "'Share Tech Mono', monospace", color: "rgba(57,255,100,0.4)" }}
                            >
                                SYS://CAMPUS/FEED.EXE
                            </span>

                            <h1
                                className="text-2xl font-black tracking-widest"
                                style={{
                                    fontFamily: "'Orbitron', monospace",
                                    color: "#e0ffe8",
                                    textShadow: "0 0 20px rgba(57,255,100,0.3)",
                                }}
                            >
                                DATA FEED
                            </h1>
                        </div>

                        {/* ✅ FIXED ONLY HERE */}
                        <button
                            className="relative px-5 py-[10px] text-[10px] font-bold tracking-[3px] overflow-hidden transition-all duration-300 group"
                            style={{
                                fontFamily: "'Orbitron', monospace",
                                color: "#39ff64",
                                background: "transparent",
                                border: "1px solid rgba(57,255,100,0.5)",
                                clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                                textShadow: "0 0 10px rgba(57,255,100,0.6)",
                            }}
                            onClick={() => setShowModal(true)}   // ✅ FIX
                        >
                            <span
                                className="btn-bg absolute inset-0 bg-[#39ff64] transition-transform duration-300 z-0"
                                style={{ transform: "translateX(-105%)" }}
                            />
                            <span className="relative z-10">+ BROADCAST</span>
                        </button>
                    </div>

                    {/* POSTS (UNCHANGED) */}
                    {loading ? (
                        <div className="text-center py-16">
                            <span style={{ color: "rgba(57,255,100,0.3)" }}>
                                LOADING FEED...
                            </span>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-16">
                            <span style={{ color: "rgba(57,255,100,0.2)" }}>
                                NO TRANSMISSIONS FOUND
                            </span>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <PostCard key={post._id} post={post} />
                        ))
                    )}

                    {/* PAGINATION (UNCHANGED) */}
                    <div
                        className="flex items-center justify-between mt-7 pt-5"
                        style={{ borderTop: "1px solid rgba(57,255,100,0.1)" }}
                    >
                        <button onClick={() => setPage((p) => Math.max(p - 1, 1))}>
                            PREV
                        </button>

                        <span style={{ color: "#39ff64" }}>
                            PAGE {page}
                        </span>

                        <button onClick={() => setPage((p) => p + 1)}>
                            NEXT
                        </button>
                    </div>

                </div>

                {/* ✅ FIXED MODAL CONNECTION */}
                {showModal && (
                    <CreatePostModal
                        onClose={() => setShowModal(false)}
                        onPostCreated={(newPost) => {
                            setPosts((prev) => [newPost, ...prev]); // instant insert
                            setShowModal(false); // close modal after post
                        }}
                    />
                )}

                <style>{`
                    @keyframes bgScroll { to { background-position: 0 48px; } }
                `}</style>

            </div>
        </>
    );
}