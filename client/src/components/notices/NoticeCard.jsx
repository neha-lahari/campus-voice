import { useEffect, useState } from "react";

const TYPE_COLORS = {
    exam: { bg: 'rgba(255,68,68,0.12)', border: 'rgba(255,68,68,0.4)', text: '#FF4444' },
    assignment: { bg: 'rgba(255,165,0,0.12)', border: 'rgba(255,165,0,0.4)', text: '#FFA500' },
    event: { bg: 'rgba(0,120,255,0.12)', border: 'rgba(0,120,255,0.4)', text: '#4488FF' },
    deadline: { bg: 'rgba(255,100,80,0.12)', border: 'rgba(255,100,80,0.4)', text: '#FF6450' },
    general: { bg: 'rgba(78,93,120,0.12)', border: 'rgba(78,93,120,0.3)', text: '#4E5D78' },
};

const PRIORITY_COLORS = {
    high: '#FF4444',
    medium: '#FFA500',
    normal: '#4E5D78',
};

const getTimeRemaining = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return { expired: true };
    return {
        expired: false,
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        totalMs: diff
    };
};

// ✅ FIX: was "export default function NoticeBoard(" — wrong name caused double render
export default function NoticeCard({ notice, isCR, onEdit, onDelete, onArchive }) {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!notice.deadline) return;
        const tick = () => setTimeLeft(getTimeRemaining(notice.deadline));
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [notice.deadline]);

    const typeStyle = TYPE_COLORS[notice.type] || TYPE_COLORS.general;
    const isUrgent = timeLeft && !timeLeft.expired && timeLeft.totalMs < 3 * 60 * 60 * 1000;

    const countdownText = () => {
        if (!timeLeft) return null;
        if (timeLeft.expired) return "OVERDUE";
        const parts = [];
        if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
        parts.push(`${timeLeft.hours}h`);
        parts.push(`${timeLeft.minutes}m`);
        return parts.join(" ") + " left";
    };

    return (
        <div style={{
            background: notice.priority === "high" ? 'rgba(255,68,68,0.04)' : '#121824',
            border: `1px solid ${notice.priority === "high" ? 'rgba(255,68,68,0.25)' : 'rgba(78,93,120,0.15)'}`,
            padding: '16px 18px',
            marginBottom: 12,
            position: 'relative',
            fontFamily: "'Share Tech Mono', monospace"
        }}>
            {/* TOP ROW */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>

                <div style={{ flex: 1 }}>
                    {/* BADGES */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{
                            padding: '2px 8px', fontSize: 9, letterSpacing: 2,
                            textTransform: 'uppercase',
                            background: typeStyle.bg, border: `1px solid ${typeStyle.border}`,
                            color: typeStyle.text
                        }}>
                            {notice.type}
                        </span>

                        {notice.priority !== "normal" && (
                            <span style={{
                                padding: '2px 8px', fontSize: 9, letterSpacing: 2,
                                textTransform: 'uppercase',
                                background: 'transparent',
                                border: `1px solid ${PRIORITY_COLORS[notice.priority]}`,
                                color: PRIORITY_COLORS[notice.priority]
                            }}>
                                {notice.priority === "high" ? "🔴 HIGH" : "🟡 MEDIUM"}
                            </span>
                        )}
                    </div>

                    {/* TITLE */}
                    <h3 style={{
                        margin: 0, fontSize: 14, color: '#E5E9F0',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 600, lineHeight: 1.4
                    }}>
                        {notice.title}
                    </h3>
                </div>

                {/* CR CONTROLS */}
                {isCR && (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={onEdit} style={{
                            padding: '4px 10px', fontSize: 10,
                            background: 'transparent', border: '1px solid rgba(0,240,255,0.2)',
                            color: '#00F0FF', cursor: 'pointer', letterSpacing: 1
                        }}>EDIT</button>
                        <button onClick={onArchive} style={{
                            padding: '4px 10px', fontSize: 10,
                            background: 'transparent', border: '1px solid rgba(78,93,120,0.3)',
                            color: '#4E5D78', cursor: 'pointer', letterSpacing: 1
                        }}>ARCH</button>
                        <button onClick={onDelete} style={{
                            padding: '4px 10px', fontSize: 10,
                            background: 'transparent', border: '1px solid rgba(255,68,68,0.3)',
                            color: '#FF4444', cursor: 'pointer', letterSpacing: 1
                        }}>DEL</button>
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <p style={{
                margin: '0 0 12px 0', fontSize: 13, color: 'rgba(229,233,240,0.8)',
                lineHeight: 1.6, fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
                {notice.content}
            </p>

            {/* FOOTER */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 10, color: '#4E5D78', letterSpacing: 1 }}>
                    {notice.createdBy?.name || "Unknown"} · {notice.createdBy?.role || ""}
                </span>

                {notice.deadline && timeLeft && (
                    <span style={{
                        fontSize: isUrgent ? 14 : 11,
                        fontWeight: isUrgent ? 700 : 400,
                        color: timeLeft.expired ? '#FF4444' : isUrgent ? '#FF4444' : '#FFA500',
                        letterSpacing: 1,
                        transition: 'all 0.3s'
                    }}>
                        ⏳ {countdownText()}
                    </span>
                )}
            </div>

            {/* ATTACHMENTS */}
            {notice.attachments?.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {notice.attachments.map((a, i) => (
                        <a key={i} href={a.url} target="_blank" rel="noreferrer"
                            style={{
                                fontSize: 10, color: '#00F0FF',
                                border: '1px solid rgba(0,240,255,0.2)',
                                padding: '3px 10px', textDecoration: 'none', letterSpacing: 1
                            }}>
                            📎 {a.name}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}