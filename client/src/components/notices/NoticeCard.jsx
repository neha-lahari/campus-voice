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

export default function NoticeCard({ notice, isCR, onEdit, onDelete, onArchive, onUnarchive }) {
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
    const isHighPriority = notice.priority === "high";

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
        <div
            className="relative p-4 mb-3 rounded-lg"
            style={{
                background: isHighPriority ? 'rgba(255,68,68,0.04)' : '#121824',
                border: `1px solid ${isHighPriority ? 'rgba(255,68,68,0.25)' : 'rgba(78,93,120,0.15)'}`,
                fontFamily: "'Share Tech Mono', monospace",
            }}
        >
            <div className="flex items-start justify-between gap-2.5 mb-2.5">

                <div className="flex-1">
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                        <span
                            className="px-2 py-0.5 text-[9px] tracking-[2px] uppercase rounded"
                            style={{ background: typeStyle.bg, border: `1px solid ${typeStyle.border}`, color: typeStyle.text }}
                        >
                            {notice.type}
                        </span>
                        {notice.priority !== "normal" && (
                            <span
                                className="px-2 py-0.5 text-[9px] tracking-[2px] uppercase rounded"
                                style={{ border: `1px solid ${PRIORITY_COLORS[notice.priority]}`, color: PRIORITY_COLORS[notice.priority] }}
                            >
                                {notice.priority === "high" ? "🔴 HIGH" : "🟡 MEDIUM"}
                            </span>
                        )}
                        {notice.isArchived && (
                            <span className="px-2 py-0.5 text-[9px] tracking-[2px] uppercase rounded" style={{ border: '1px solid rgba(78,93,120,0.3)', color: '#4E5D78' }}>
                                ARCHIVED
                            </span>
                        )}
                    </div>

                    <h3
                        className="m-0 text-[14px] font-semibold leading-snug"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#E5E9F0' }}
                    >
                        {notice.title}
                    </h3>
                </div>

                {isCR && (
                    <div className="flex gap-1.5 flex-shrink-0">
                        <button
                            onClick={onEdit}
                            className="px-2.5 py-1 text-[10px] tracking-[1px] rounded cursor-pointer transition-all duration-150 hover:opacity-80"
                            style={{ background: 'transparent', border: '1px solid rgba(0,240,255,0.2)', color: '#00F0FF' }}
                        >
                            EDIT
                        </button>

                        {notice.isArchived ? (
                            <button
                                onClick={onUnarchive}
                                className="px-2.5 py-1 text-[10px] tracking-[1px] rounded cursor-pointer transition-all duration-150 hover:opacity-80"
                                style={{ background: 'transparent', border: '1px solid rgba(163,255,18,0.3)', color: '#A3FF12' }}
                            >
                                RESTORE
                            </button>
                        ) : (
                            <button
                                onClick={onArchive}
                                className="px-2.5 py-1 text-[10px] tracking-[1px] rounded cursor-pointer transition-all duration-150 hover:opacity-80"
                                style={{ background: 'transparent', border: '1px solid rgba(78,93,120,0.3)', color: '#4E5D78' }}
                            >
                                ARCHIVE
                            </button>
                        )}

                        <button
                            onClick={onDelete}
                            className="px-2.5 py-1 text-[10px] tracking-[1px] rounded cursor-pointer transition-all duration-150 hover:opacity-80"
                            style={{ background: 'transparent', border: '1px solid rgba(255,68,68,0.3)', color: '#FF4444' }}
                        >
                            DEL
                        </button>
                    </div>
                )}
            </div>

            <p
                className="m-0 mb-3 text-[13px] leading-relaxed"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(229,233,240,0.8)' }}
            >
                {notice.content}
            </p>

            <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] tracking-[1px]" style={{ color: '#4E5D78' }}>
                    {notice.createdBy?.name || "Unknown"} · {notice.createdBy?.role || ""}
                </span>

                {notice.deadline && timeLeft && (
                    <span
                        className="text-[11px] tracking-[1px] transition-all duration-300"
                        style={{
                            fontSize: isUrgent ? 14 : 11,
                            fontWeight: isUrgent ? 700 : 400,
                            color: timeLeft.expired || isUrgent ? '#FF4444' : '#FFA500',
                        }}
                    >
                        ⏳ {countdownText()}
                    </span>
                )}
            </div>

            {/* Attachments */}
            {notice.attachments?.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2.5">
                    {notice.attachments.map((a, i) => (
                        <a
                            key={i}
                            href={a.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 text-[10px] tracking-[1px] rounded no-underline transition-all duration-150 hover:opacity-80"
                            style={{ color: '#00F0FF', border: '1px solid rgba(0,240,255,0.2)' }}
                        >
                            📎 {a.name}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}