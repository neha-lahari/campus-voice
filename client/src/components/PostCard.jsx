import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import api from '../utils/api';

const THEME = {
    bgMain: '#060A13',
    bgCard: '#121824',
    accentPrimary: '#A3FF12',
    accentSecondary: '#00F0FF',
    textMain: '#E5E9F0',
    textMuted: '#4E5D78',
    alertRed: '#FF4444',
};

const flairStyles = {
    Doubt: 'border-[rgba(255,68,68,0.3)]  text-[#ff4444] bg-[rgba(255,68,68,0.05)]',
    Resource: 'border-[rgba(0,240,255,0.3)]  text-[#00F0FF] bg-[rgba(0,240,255,0.05)]',
    Announcement: 'border-[rgba(163,255,12,0.3)] text-[#A3FF12] bg-[rgba(163,255,12,0.05)]',
    Meme: 'border-purple-500/30 text-purple-400 bg-purple-500/5',
    News: 'border-amber-500/30  text-amber-400  bg-amber-500/5',
};

export default function PostCard({ post, currentUserId }) {
    const navigate = useNavigate();

    const [voteCount, setVoteCount] = useState(
        post.upvotes.length - post.downvotes.length
    );

    const [userVote, setUserVote] = useState(
        post.upvotes.includes(currentUserId) ? 'up'
            : post.downvotes.includes(currentUserId) ? 'down'
                : null
    );

    const [saved, setSaved] = useState(false);

    const handleVote = async (type, e) => {
        e.stopPropagation();
        try {
            const res = await api.post(`/posts/${post._id}/vote`, { type });
            setVoteCount(res.data.voteCount);
            setUserVote(res.data.userVote);
        } catch (err) {
            console.error('Vote failed', err);
        }
    };

    const handleSave = async (e) => {
        e.stopPropagation();
        try {
            const res = await api.post(`/posts/${post._id}/save`);
            setSaved(res.data.saved);
        } catch (err) {
            console.error('Save failed', err);
        }
    };

    const authorName = post.isAnonymous ? 'Anonymous' : post.author?.name;
    const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
    const flairClass = flairStyles[post.flair] || 'border-zinc-700 text-zinc-400 bg-zinc-800/20';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Share+Tech+Mono&display=swap');
                .post-card:hover {
                    border-color: rgba(0,240,255,0.35) !important;
                    box-shadow: 0 0 25px rgba(0,240,255,0.04);
                    transform: translateY(-1px);
                }
                .meta-link:hover { color: #00F0FF !important; }
                .action-trigger:hover { color: #E5E9F0 !important; }
            `}</style>

            <div
                onClick={() => navigate(`/post/${post._id}`)}
                className="post-card p-5 mb-4 cursor-pointer rounded-lg transition-all duration-200"
                style={{ background: THEME.bgCard, border: '1px solid rgba(0,240,255,0.12)' }}
            >
                <div
                    className="flex items-center gap-2 text-[11px] mb-2.5 flex-wrap tracking-wider"
                    style={{ fontFamily: "'Share Tech Mono', monospace", color: THEME.textMuted }}
                >
                    <Link
                        to={`/r/${post.community?.name}`}
                        onClick={e => e.stopPropagation()}
                        className="meta-link font-bold transition-colors"
                        style={{ color: THEME.accentSecondary }}
                    >
                        r/{post.community?.name}
                    </Link>
                    <span>//</span>
                    <span>POSTED BY: {authorName.toUpperCase()}</span>
                    <span>//</span>
                    <span>{timeAgo.toUpperCase()}</span>
                </div>

                {/* Title + flair badge */}
                <div className="flex items-start gap-3 mb-2.5">
                    <h3
                        className="flex-1 text-[14px] font-semibold leading-snug tracking-wide"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: THEME.textMain }}
                    >
                        {post.title}
                    </h3>
                    {post.flair && (
                        <span className={`text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 border whitespace-nowrap uppercase rounded ${flairClass}`}>
                            {post.flair}
                        </span>
                    )}
                </div>

                {post.body && (
                    <p
                        className="text-xs leading-relaxed mb-3.5 line-clamp-2"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(229,233,240,0.7)' }}
                    >
                        {post.body}
                    </p>
                )}

                {post.link && (
                    <a
                        href={post.link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-[11px] font-mono mb-3.5 break-all tracking-wide"
                        style={{ color: THEME.accentSecondary }}
                    >
                        <span className="text-[9px]">⧉</span> LINK: {post.link}
                    </a>
                )}

                {post.attachments?.length > 0 && post.attachments[0].fileType === "image" && (
                    <div className="mb-3.5 overflow-hidden rounded-lg border border-zinc-800">
                        <img
                            src={post.attachments[0].url}
                            alt="Attachment"
                            className="w-full max-h-64 object-cover opacity-85 hover:opacity-100 transition-opacity duration-200"
                        />
                    </div>
                )}

                {post.attachments?.length > 0 && post.attachments[0].fileType === "pdf" && (
                    <a
                        href={post.attachments[0].url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="mb-3.5 text-[11px] font-mono rounded px-3 py-1.5 inline-flex items-center gap-2 tracking-wider hover:opacity-80 transition-opacity cursor-pointer"
                        style={{ color: THEME.accentSecondary, border: '1px solid rgba(0,240,255,0.15)', background: 'rgba(0,240,255,0.02)' }}
                    >
                        📄 DOCUMENT_ATTACHED.PDF
                    </a>
                )}

                <div className="flex items-center gap-4 mt-2" style={{ fontFamily: "'Share Tech Mono', monospace" }}>

                    {/* Vote buttons */}
                    <div
                        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded"
                        style={{ background: 'rgba(18,24,36,0.6)', border: '1px solid rgba(78,93,120,0.2)' }}
                    >
                        <button
                            onClick={e => handleVote('up', e)}
                            className="action-trigger text-xs p-1 bg-transparent border-none cursor-pointer"
                            style={{ color: userVote === 'up' ? THEME.accentPrimary : THEME.textMuted }}
                        >
                            ▲
                        </button>
                        <span
                            className="text-xs font-bold min-w-[18px] text-center"
                            style={{ color: userVote === 'up' ? THEME.accentPrimary : userVote === 'down' ? THEME.alertRed : THEME.textMain }}
                        >
                            {voteCount > 0 ? `+${voteCount}` : voteCount}
                        </span>
                        <button
                            onClick={e => handleVote('down', e)}
                            className="action-trigger text-xs p-1 bg-transparent border-none cursor-pointer"
                            style={{ color: userVote === 'down' ? THEME.alertRed : THEME.textMuted }}
                        >
                            ▼
                        </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs" style={{ color: THEME.textMuted }}>
                        <span className="text-[10px]">⌸</span>
                        <span>{post.commentCount || 0} COMMENTS</span>
                    </div>

                    {/* Save button */}
                    <button
                        onClick={handleSave}
                        className="action-trigger ml-auto bg-transparent border-none text-xs font-bold tracking-widest cursor-pointer flex items-center gap-1 uppercase"
                        style={{ color: saved ? THEME.accentSecondary : THEME.textMuted }}
                    >
                        {saved ? 'SAVED' : 'SAVE'}
                    </button>

                </div>
            </div>
        </>
    );
}