import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// Unitized Quantum Network Theme Configs
const THEME = {
    bgMainStart: '#060A13',      // Deep Void Navy Start
    bgMainEnd: '#0B111E',        // Deep Void Navy End
    bgCard: '#121824',           // Translucent Steel Panel
    accentPrimary: '#A3FF12',    // Neon Lime
    accentSecondary: '#00F0FF',  // Cyber Cyan
    textMain: '#E5E9F0',         // High-Readability Ice Text
    textMuted: '#4E5D78',        // Technical Gridline Gray
};

export default function Home() {
    const { user } = useAuth();

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [sort, setSort] = useState('new');

    useEffect(() => {
        setPosts([]);
        setPage(1);
        setHasMore(true);
        fetchPosts(1, true);
    }, [sort]);

    const fetchPosts = async (pageNum = page, reset = false) => {
        try {
            setLoading(true);
            const res = await api.get(`/posts?page=${pageNum}&sort=${sort}&limit=10`);
            const newPosts = res.data.posts;
            reset ? setPosts(newPosts) : setPosts(prev => [...prev, ...newPosts]);
            setHasMore(newPosts.length === 10);
        } catch (err) {
            console.error('Failed to fetch posts', err);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        const next = page + 1;
        setPage(next);
        fetchPosts(next);
    };

    const sortOptions = [
        { key: 'new', label: 'New' },
        { key: 'hot', label: 'Hot' },
        { key: 'top', label: 'Top' },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@300;500;600&display=swap');
                
                .sort-btn { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                .sort-btn:hover:not(.active-sort) {
                    border-color: rgba(0, 240, 255, 0.4) !important;
                    color: ${THEME.accentSecondary} !important;
                    background: rgba(0, 240, 255, 0.02);
                }
                .active-sort {
                    box-shadow: 0 0 15px rgba(163, 255, 18, 0.15);
                }
                .load-btn:hover:not(:disabled) {
                    background: rgba(0, 240, 255, 0.03) !important;
                    border-color: ${THEME.accentSecondary} !important;
                    color: ${THEME.accentSecondary} !important;
                    box-shadow: 0 0 25px rgba(0, 240, 255, 0.15);
                }
                .cyber-skeleton {
                    background: linear-gradient(90deg, #121824 25%, #1b2335 50%, #121824 75%);
                    background-size: 200% 100%;
                    animation: cyberScan 1.6s infinite linear;
                }
                @keyframes cyberScan {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>

            <div
                className="min-h-screen py-8 px-4 relative"
                style={{ background: `linear-gradient(to bottom, ${THEME.bgMainStart}, ${THEME.bgMainEnd})` }}
            >
                <div className="max-w-2xl mx-auto relative z-10">

                    {/* Clean Sort Bar */}
                    <div className="flex items-center justify-between gap-4 mb-6 p-2.5 border"
                        style={{
                            background: 'rgba(18, 24, 36, 0.8)',
                            borderColor: 'rgba(0, 240, 255, 0.15)',
                            clipPath: 'polygon(0 0, 100% 0, calc(100% - 8px) 100%, 8px 100%)'
                        }}>
                        <div className="flex gap-2">
                            {sortOptions.map(({ key, label }) => {
                                const isActive = sort === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setSort(key)}
                                        className={`sort-btn px-4 py-1 text-xs font-bold tracking-[1px] border transition-all duration-200 ${isActive ? 'active-sort' : ''
                                            }`}
                                        style={{
                                            fontFamily: "'Orbitron', monospace",
                                            background: isActive ? 'rgba(163, 255, 18, 0.05)' : 'transparent',
                                            color: isActive ? THEME.accentPrimary : THEME.textMuted,
                                            borderColor: isActive ? THEME.accentPrimary : 'transparent',
                                            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
                                        }}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 text-[11px] tracking-[1px]"
                            style={{ fontFamily: "'Share Tech Mono', monospace", color: THEME.accentSecondary }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            Live Feed
                        </div>
                    </div>

                    {/* Posts Container */}
                    <div className="flex flex-col gap-4">
                        {posts.map(post => (
                            <PostCard key={post._id} post={post} currentUserId={user?._id} />
                        ))}
                    </div>

                    {/* Standard Empty State */}
                    {!loading && posts.length === 0 && (
                        <div className="text-center py-16 border border-dashed"
                            style={{
                                background: THEME.bgCard,
                                borderColor: 'rgba(78, 93, 120, 0.25)',
                                clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))'
                            }}>
                            <div className="text-3xl mb-3 opacity-60">✉</div>
                            <h3 className="text-sm font-bold tracking-[2px] uppercase mb-1" style={{ fontFamily: "'Orbitron', monospace", color: THEME.textMain }}>
                                No posts found
                            </h3>
                            <p className="text-xs" style={{ fontFamily: "'Share Tech Mono', monospace", color: THEME.textMuted }}>
                                Be the first to share something with your community.
                            </p>
                        </div>
                    )}

                    {/* Skeleton Loader */}
                    {loading && (
                        <div className="flex flex-col gap-4 mt-2">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className="cyber-skeleton h-28 w-full border border-cyan-950/20"
                                    style={{
                                        clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))'
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Load More Trigger */}
                    {!loading && hasMore && (
                        <button
                            onClick={loadMore}
                            className="load-btn w-full mt-4 py-3.5 text-[11px] font-bold tracking-[2px] uppercase transition-all duration-300"
                            style={{
                                fontFamily: "'Orbitron', monospace",
                                background: 'rgba(18, 24, 36, 0.5)',
                                border: '1px solid rgba(0, 240, 255, 0.15)',
                                color: THEME.textMain,
                                cursor: 'pointer',
                                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                            }}
                        >
                            Load More Posts
                        </button>
                    )}

                    {/* End of Feed */}
                    {!loading && !hasMore && posts.length > 0 && (
                        <div className="flex items-center gap-4 mt-8 opacity-50">
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(78, 93, 120, 0.15))' }} />
                            <p className="text-center text-[11px] tracking-[1px]" style={{ fontFamily: "'Share Tech Mono', monospace", color: THEME.textMuted }}>
                                You've seen all posts
                            </p>
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(78, 93, 120, 0.15))' }} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}