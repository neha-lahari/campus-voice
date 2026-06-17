import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const THEME = {
    bgMainStart: '#060A13',
    bgMainEnd: '#0B111E',
    bgCard: '#121824',
    accentPrimary: '#A3FF12',
    accentSecondary: '#00F0FF',
    textMain: '#E5E9F0',
    textMuted: '#4E5D78',
};

export default function Home() {
    const { user } = useAuth();

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [sort] = useState('new');

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

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@300;500;600&display=swap');
                .cyber-skeleton {
                    background: linear-gradient(90deg, #121824 25%, #1b2335 50%, #121824 75%);
                    background-size: 200% 100%;
                    animation: cyberScan 1.6s infinite linear;
                }
                @keyframes cyberScan {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .load-btn:hover:not(:disabled) {
                    background: rgba(0,240,255,0.03) !important;
                    border-color: #00F0FF !important;
                    color: #00F0FF !important;
                }
            `}</style>

            <div
                className="min-h-screen py-8 px-4"
                style={{ background: `linear-gradient(to bottom, ${THEME.bgMainStart}, ${THEME.bgMainEnd})` }}
            >
                <div className="max-w-2xl mx-auto">


                    {/* Posts list */}
                    <div className="flex flex-col gap-4">
                        {posts.map(post => (
                            <PostCard key={post._id} post={post} currentUserId={user?._id} />
                        ))}
                    </div>

                    {/* Empty state */}
                    {!loading && posts.length === 0 && (
                        <div
                            className="text-center py-16 rounded-lg border border-dashed"
                            style={{ background: THEME.bgCard, borderColor: 'rgba(78,93,120,0.25)' }}
                        >
                            <div className="text-3xl mb-3 opacity-60">✉</div>
                            <h3
                                className="text-sm font-bold tracking-[2px] uppercase mb-1"
                                style={{ fontFamily: "'Orbitron', monospace", color: THEME.textMain }}
                            >
                                No posts found
                            </h3>
                            <p
                                className="text-xs"
                                style={{ fontFamily: "'Share Tech Mono', monospace", color: THEME.textMuted }}
                            >
                                Be the first to share something with your community.
                            </p>
                        </div>
                    )}

                    {/* Skeleton loader */}
                    {loading && (
                        <div className="flex flex-col gap-4 mt-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="cyber-skeleton h-28 w-full rounded-lg" />
                            ))}
                        </div>
                    )}

                    {/* Load more button */}
                    {!loading && hasMore && (
                        <button
                            onClick={loadMore}
                            className="load-btn w-full mt-4 py-3.5 rounded-lg text-[11px] font-bold tracking-[2px] uppercase transition-all duration-300 cursor-pointer"
                            style={{
                                fontFamily: "'Orbitron', monospace",
                                background: 'rgba(18,24,36,0.5)',
                                border: '1px solid rgba(0,240,255,0.15)',
                                color: THEME.textMain,
                            }}
                        >
                            Load More Posts
                        </button>
                    )}

                    {/* End of feed */}
                    {!loading && !hasMore && posts.length > 0 && (
                        <div className="flex items-center gap-4 mt-8 opacity-50">
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(78,93,120,0.15))' }} />
                            <p
                                className="text-[11px] tracking-[1px] whitespace-nowrap"
                                style={{ fontFamily: "'Share Tech Mono', monospace", color: THEME.textMuted }}
                            >
                                You've seen all posts
                            </p>
                            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(78,93,120,0.15))' }} />
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}