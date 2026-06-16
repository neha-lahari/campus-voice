import { useState } from 'react';
import api from '../utils/api';

export default function CommentBox({ postId, parentCommentId = null, onCommentAdded, onCancel }) {
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!body.trim() || loading) return;
        try {
            setLoading(true);
            const { data } = await api.post('/comments', { postId, body, parentCommentId });
            setBody('');
            onCommentAdded?.(data.comment);
        } catch (err) {
            console.error("Comment failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-3 w-full">
            {/* TEXTAREA MATRIX PANEL */}
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter terminal response..."
                rows={3}
                className="w-full p-3.5 bg-[#060A13]/40 border border-[#4E5D78]/20 text-[#E5E9F0] text-sm focus:outline-none focus:border-[#00F0FF] focus:bg-[#00F0FF]/5 transition-all placeholder-zinc-600 resize-none"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
            />

            {/* ACTION TRIGGERS */}
            <div className="flex justify-end gap-2.5 mt-2">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="px-4 py-1.5 font-['Share_Tech_Mono'] text-[11px] tracking-wider uppercase bg-transparent border border-[#4E5D78]/20 text-[#4E5D78] hover:text-[#E5E9F0] hover:border-[#4E5D78]/50 transition-all cursor-pointer"
                        style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}
                    >
                        Cancel
                    </button>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={!body.trim() || loading}
                    className="px-5 py-1.5 font-['Share_Tech_Mono'] text-[11px] font-bold tracking-wider uppercase bg-transparent border border-[#A3FF12] text-[#A3FF12] hover:bg-[#A3FF12]/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all shadow-[0_0_12px_rgba(163,255,12,0)] hover:shadow-[0_0_12px_rgba(163,255,12,0.15)] disabled:hover:shadow-none cursor-pointer"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}
                >
                    {loading ? "Posting..." : "Comment"}
                </button>
            </div>
        </div>
    );
}