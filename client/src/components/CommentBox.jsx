import { useState } from "react";
import api from "../utils/api";

export default function CommentBox({
    postId,
    parentCommentId = null,
    onCommentAdded,
    onCancel
}) {
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!body.trim() || loading) return;

        setLoading(true);

        try {
            const res = await api.post("/comments", {
                postId,
                body,
                parentCommentId
            });

            setBody("");

            onCommentAdded?.(res.data.comment);
        } catch (err) {
            console.log("Comment failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-3 w-full">

            {/* TEXTAREA */}
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="w-full p-3 text-sm bg-[#060A13] border border-[#4E5D78] text-[#E5E9F0] resize-none focus:outline-none focus:border-[#00F0FF]"
            />

            {/* BUTTONS */}
            <div className="flex justify-end gap-2 mt-2">

                {/* CANCEL */}
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="px-2.5 py-1 text-[11px] border border-[#4E5D78] text-[#4E5D78] hover:text-white hover:border-[#00F0FF] transition"
                    >
                        Cancel
                    </button>
                )}

                {/* SUBMIT */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || !body.trim()}
                    className="px-3 py-1 text-[11px] font-semibold bg-[#A3FF12] text-black disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
                >
                    {loading ? "Posting..." : "Comment"}
                </button>

            </div>
        </div>
    );
}