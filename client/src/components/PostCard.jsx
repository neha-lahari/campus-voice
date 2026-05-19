import { upvote, downvote } from "../api/postApi";
import { useState } from "react";

export default function PostCard({ post }) {
    const [karma, setKarma] = useState(post.karma);
    const [voted, setVoted] = useState(null); // 'up' | 'down' | null
    const [loading, setLoading] = useState(false);
    const [bump, setBump] = useState(false);

    const triggerBump = () => {
        setBump(false);
        setTimeout(() => setBump(true), 10);
    };

    const handleUpvote = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await upvote(post._id);
            setKarma(res.data.karma);
            setVoted((v) => (v === "up" ? null : "up"));
            triggerBump();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownvote = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await downvote(post._id);
            setKarma(res.data.karma);
            setVoted((v) => (v === "down" ? null : "down"));
            triggerBump();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isAnon = post.isAnonymous;
    const initials = isAnon
        ? "??"
        : post.author?.username?.slice(0, 2).toUpperCase() || "??";

    const timeAgo = (date) => {
        const diff = Math.floor((Date.now() - new Date(date)) / 60000);
        if (diff < 60) return `${diff}M AGO`;
        if (diff < 1440) return `${Math.floor(diff / 60)}H AGO`;
        return `${Math.floor(diff / 1440)}D AGO`;
    };

    return (
        <div
            className="relative mb-4 transition-all duration-300 group"
            style={{
                background: "linear-gradient(145deg, rgba(2,15,28,0.97), rgba(1,10,18,0.99))",
                border: `1px solid rgba(57,255,100,0.15)`,
                clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(57,255,100,0.3)";
                e.currentTarget.style.boxShadow = "0 0 30px rgba(57,255,100,0.06)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(57,255,100,0.15)";
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            {/* Loading sweep bar */}
            {loading && (
                <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
                    style={{
                        background: "linear-gradient(90deg, transparent, #39ff64, transparent)",
                        animation: "loadSweep 0.6s ease",
                    }}
                />
            )}

            {/* Left accent bar */}
            <div
                className="absolute top-0 left-0 w-[3px] h-full opacity-35 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(to bottom, #39ff64, transparent)" }}
            />

            <div className="px-6 py-5">

                {/* META ROW */}
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                    {/* Avatar */}
                    <div
                        className="w-[34px] h-[34px] flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{
                            fontFamily: "'Orbitron', monospace",
                            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                            background: isAnon ? "rgba(0,200,255,0.06)" : "rgba(57,255,100,0.08)",
                            border: `1px solid ${isAnon ? "rgba(0,200,255,0.3)" : "rgba(57,255,100,0.3)"}`,
                            color: isAnon ? "rgba(0,200,255,0.7)" : "#39ff64",
                        }}
                    >{initials}</div>

                    {/* Author */}
                    <span
                        className="text-[12px] tracking-wider"
                        style={{
                            fontFamily: "'Share Tech Mono', monospace",
                            color: isAnon ? "rgba(0,200,255,0.5)" : "rgba(57,255,100,0.7)",
                        }}
                    >{isAnon ? "ANONYMOUS" : post.author?.username?.toUpperCase()}</span>

                    {/* Flair */}
                    {post.flair && (
                        <span
                            className="text-[9px] px-2 py-[2px] tracking-wider"
                            style={{
                                fontFamily: "'Share Tech Mono', monospace",
                                color: "rgba(0,200,255,0.7)",
                                border: "1px solid rgba(0,200,255,0.25)",
                                background: "rgba(0,200,255,0.05)",
                            }}
                        >{post.flair.toUpperCase()}</span>
                    )}

                    {/* Timestamp */}
                    <span
                        className="ml-auto text-[10px] tracking-wider"
                        style={{ fontFamily: "'Share Tech Mono', monospace", color: "rgba(100,160,110,0.3)" }}
                    >{timeAgo(post.createdAt)}</span>
                </div>

                {/* TITLE */}
                <h2
                    className="text-sm font-bold mb-2 leading-snug tracking-wide"
                    style={{ fontFamily: "'Orbitron', monospace", color: "#d4f5dc" }}
                >{post.title}</h2>

                {/* BODY */}
                <p
                    className="text-sm leading-relaxed mb-4"
                    style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontWeight: 300,
                        color: "rgba(150,200,160,0.55)",
                        letterSpacing: "0.3px",
                    }}
                >{post.body}</p>

                {/* FOOTER */}
                <div
                    className="flex items-center gap-4 pt-3"
                    style={{ borderTop: "1px solid rgba(57,255,100,0.07)" }}
                >
                    {/* Karma cluster */}
                    <div className="flex items-center">
                        {/* Upvote */}
                        <button
                            onClick={handleUpvote}
                            disabled={loading}
                            className="w-8 h-8 flex items-center justify-center text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                fontFamily: "'Share Tech Mono', monospace",
                                background: voted === "up" ? "rgba(57,255,100,0.1)" : "transparent",
                                border: `1px solid ${voted === "up" ? "rgba(57,255,100,0.6)" : "rgba(57,255,100,0.15)"}`,
                                borderRight: "none",
                                color: voted === "up" ? "#39ff64" : "rgba(57,255,100,0.35)",
                                clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)",
                                boxShadow: voted === "up" ? "0 0 12px rgba(57,255,100,0.2)" : "none",
                            }}
                        >▲</button>

                        {/* Karma value */}
                        <span
                            className="min-w-[44px] h-8 flex items-center justify-center text-[13px] font-bold tracking-wider"
                            style={{
                                fontFamily: "'Orbitron', monospace",
                                color: karma < 0 ? "rgba(255,80,80,0.8)" : "#39ff64",
                                background: "rgba(57,255,100,0.05)",
                                borderTop: "1px solid rgba(57,255,100,0.15)",
                                borderBottom: "1px solid rgba(57,255,100,0.15)",
                                textShadow: karma < 0
                                    ? "0 0 12px rgba(255,80,80,0.4)"
                                    : "0 0 12px rgba(57,255,100,0.5)",
                                animation: bump ? "karmaBump 0.3s ease" : "none",
                            }}
                        >{karma}</span>

                        {/* Downvote */}
                        <button
                            onClick={handleDownvote}
                            disabled={loading}
                            className="w-8 h-8 flex items-center justify-center text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                fontFamily: "'Share Tech Mono', monospace",
                                background: voted === "down" ? "rgba(255,80,80,0.06)" : "transparent",
                                border: `1px solid ${voted === "down" ? "rgba(255,80,80,0.4)" : "rgba(57,255,100,0.15)"}`,
                                borderLeft: "none",
                                color: voted === "down" ? "rgba(255,80,80,0.8)" : "rgba(57,255,100,0.35)",
                                clipPath: "polygon(0 6px, 6px 0, 100% 0, 100% 100%, 0 100%)",
                                boxShadow: voted === "down" ? "0 0 12px rgba(255,80,80,0.15)" : "none",
                            }}
                        >▼</button>
                    </div>

                    {/* Replies */}
                    <button
                        className="flex items-center gap-1 text-[11px] tracking-wider transition-colors duration-200"
                        style={{
                            fontFamily: "'Share Tech Mono', monospace",
                            color: "rgba(57,255,100,0.25)",
                            background: "none", border: "none", cursor: "pointer", padding: 0,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "rgba(57,255,100,0.7)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "rgba(57,255,100,0.25)"}
                    >
                        ⊠ {post.commentCount ?? 0} REPLIES
                    </button>

                    {/* Post ID */}
                    <span
                        className="ml-auto text-[10px] tracking-wider"
                        style={{ fontFamily: "'Share Tech Mono', monospace", color: "rgba(57,255,100,0.1)" }}
                    >#{`POST_0x${post._id?.slice(-3).toUpperCase() || "???"}`}</span>
                </div>
            </div>

            <style>{`
        @keyframes karmaBump {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes loadSweep {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
      `}</style>
        </div>
    );
}