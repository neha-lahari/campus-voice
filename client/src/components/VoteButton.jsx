import { useState } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';

// Sync with locked system theme
const THEME = {
    bgMainStart: '#060A13',      // Deep Void Navy Start
    bgCard: '#121824',           // Translucent Steel Panel
    accentPrimary: '#A3FF12',    // Neon Lime (Upvote Active)
    accentSecondary: '#00F0FF',  // Cyber Cyan (Score Neutral)
    textMain: '#E5E9F0',         // High-Readability Ice Text
    textMuted: '#4E5D78',        // Technical Gridline Gray
    alertRed: '#FF4444',         // Downvote Active
};

const toastStyle = {
    background: THEME.bgCard,
    color: THEME.accentSecondary,
    border: `1px solid rgba(0, 240, 255, 0.2)`,
    fontFamily: "'Share Tech Mono', monospace",
    letterSpacing: '2px',
    fontSize: '11px',
};

export default function VoteButton({
    postId,
    initialUpvotes = 0,
    initialDownvotes = 0,
    initialUserVote = null
}) {
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [downvotes, setDownvotes] = useState(initialDownvotes);
    const [userVote, setUserVote] = useState(initialUserVote);
    const [loading, setLoading] = useState(false);

    const vote = async (type) => {
        if (loading) return;

        setLoading(true);
        try {
            const { data } = await API.post(`/posts/${postId}/vote`, { type });

            setUpvotes(data.upvotes);
            setDownvotes(data.downvotes);
            setUserVote(data.userVote);

        } catch (err) {
            toast.error(
                err.response?.data?.message || 'VOTE TRANSACTION FAILED',
                { style: { ...toastStyle, color: THEME.alertRed, border: `1px solid rgba(255,68,68,0.3)` } }
            );
        } finally {
            setLoading(false);
        }
    };

    const score = upvotes - downvotes;

    // removeee this score thind otallyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
    const getScoreColor = () => {
        if (score > 0) return THEME.accentPrimary;
        if (score < 0) return THEME.alertRed;
        return THEME.textMuted;
    };

    return (
        <>
            <style>{`
                .vote-arrow {
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }
                .vote-arrow:hover:not(:disabled) {
                    opacity: 0.85;
                    transform: scale(1.08);
                }
                .vote-arrow:disabled {
                    cursor: not-allowed;
                    opacity: 0.5;
                }
            `}</style>

            <div className="flex flex-col items-center gap-1.5 py-2 px-1 rounded" style={{ background: 'rgba(18, 24, 36, 0.3)' }}>

                {/* UPVOTE ELEMENT */}
                <button
                    onClick={() => vote("up")}
                    disabled={loading}
                    className="vote-arrow bg-transparent border-none p-0 flex items-center justify-center"
                >
                    <div
                        style={{
                            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                            width: 22,
                            height: 18,
                            background: userVote === "up" ? THEME.accentPrimary : 'rgba(78, 93, 120, 0.25)'
                        }}
                    />
                </button>

                {/* COUNTER GRID NODE */}
                <span
                    className="text-xs font-bold font-mono tracking-wide"
                    style={{
                        color: getScoreColor(),
                        fontFamily: "'Share Tech Mono', monospace"
                    }}
                >
                    {score > 0 ? `+${score}` : score}
                </span>

                {/* DOWNVOTE ELEMENT */}
                <button
                    onClick={() => vote("down")}
                    disabled={loading}
                    className="vote-arrow bg-transparent border-none p-0 flex items-center justify-center"
                >
                    <div
                        style={{
                            clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
                            width: 22,
                            height: 18,
                            background: userVote === "down" ? THEME.alertRed : 'rgba(78, 93, 120, 0.25)'
                        }}
                    />
                </button>
            </div>
        </>
    );
}