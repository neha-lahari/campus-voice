import { useState } from "react";
import API from "../../utils/api";

export default function PollCard({ poll: initialPoll }) {
    const [poll, setPoll] = useState(initialPoll);
    const [loading, setLoading] = useState(false);

    const userId = localStorage.getItem("userId");

    const hasVoted = poll.options.some(opt =>
        opt.votes?.some(v => String(v) === String(userId))
    );

    const isExpired = !poll.isActive ||
        (poll.expiresAt && new Date(poll.expiresAt) < new Date());

    const vote = async (optionIndex) => {
        if (hasVoted || isExpired || loading) return;
        try {
            setLoading(true);
            const res = await API.post(`/polls/${poll._id}/vote`, { optionIndex });
            setPoll(res.data);
        } catch (err) {
            alert(err.response?.data?.message || "Vote failed");
        } finally {
            setLoading(false);
        }
    };

    const getTimeRemaining = () => {
        if (!poll.expiresAt) return "No expiry";
        const diff = new Date(poll.expiresAt) - new Date();
        if (diff <= 0) return "Poll closed";
        const hours = Math.floor(diff / (1000 * 60 * 60));
        return hours < 24 ? `${hours}h left` : `${Math.floor(hours / 24)}d left`;
    };

    return (
        <div style={{
            background: '#121824',
            border: '1px solid rgba(0,240,255,0.12)',
            padding: '16px 18px',
            marginBottom: 14,
            fontFamily: "'Share Tech Mono', monospace"
        }}>
            {/* QUESTION */}
            <p style={{
                fontSize: 14, color: '#E5E9F0', marginBottom: 4,
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600
            }}>
                {poll.question}
            </p>

            {/* META */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 10, color: '#4E5D78' }}>
                    by {poll.createdBy?.name || "Unknown"}
                </span>
                <span style={{
                    fontSize: 10,
                    color: isExpired ? '#FF4444' : '#FFA500'
                }}>
                    {isExpired ? "POLL CLOSED" : getTimeRemaining()}
                </span>
            </div>

            {/* OPTIONS */}
            {poll.options.map((opt, index) => {
                const pct = opt.percentage ?? 0;
                return (
                    <div key={index} style={{ marginBottom: 10 }}>
                        <button
                            disabled={hasVoted || isExpired || loading}
                            onClick={() => vote(index)}
                            style={{
                                width: '100%', padding: '10px 14px',
                                background: hasVoted || isExpired ? 'rgba(6,10,19,0.6)' : 'rgba(0,240,255,0.03)',
                                border: `1px solid ${hasVoted || isExpired ? 'rgba(78,93,120,0.2)' : 'rgba(0,240,255,0.2)'}`,
                                color: '#E5E9F0', cursor: hasVoted || isExpired ? 'default' : 'pointer',
                                textAlign: 'left', fontSize: 12,
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                transition: 'all 0.15s'
                            }}
                        >
                            {opt.text}
                        </button>

                        {/* RESULT BAR — show after voting or expired */}
                        {(hasVoted || isExpired) && (
                            <div style={{ marginTop: 4 }}>
                                <div style={{
                                    height: 4, background: 'rgba(78,93,120,0.2)',
                                    borderRadius: 2, overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${pct}%`, height: '100%',
                                        background: '#A3FF12',
                                        transition: 'width 0.5s ease',
                                        borderRadius: 2
                                    }} />
                                </div>
                                <span style={{ fontSize: 10, color: '#4E5D78', marginTop: 2, display: 'block' }}>
                                    {pct}% · {opt.voteCount ?? opt.votes?.length ?? 0} votes
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* TOTAL */}
            {(hasVoted || isExpired) && (
                <p style={{ fontSize: 10, color: '#4E5D78', marginTop: 8 }}>
                    {poll.totalVotes ?? 0} total votes
                </p>
            )}
        </div>
    );
}