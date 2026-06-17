import { useState } from "react";
import toast from "react-hot-toast";
import API from "../utils/api";

const THEME = {
    accentPrimary: "#A3FF12",
    accentSecondary: "#00F0FF",
    danger: "#FF4444",
    muted: "rgba(78,93,120,0.25)",
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

    const score = upvotes - downvotes;

    const vote = async (type) => {
        if (loading) return;

        try {
            setLoading(true);

            const { data } = await API.post(`/posts/${postId}/vote`, { type });

            setUpvotes(data.upvotes);
            setDownvotes(data.downvotes);
            setUserVote(data.userVote);

        } catch (err) {
            toast.error(
                err.response?.data?.message || "Vote failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-1.5 py-2 px-1 rounded"
            style={{ background: "rgba(18, 24, 36, 0.3)" }}>

            {/* UPVOTE */}
            <button
                onClick={() => vote("up")}
                disabled={loading}
                className="p-0 flex items-center justify-center"
            >
                <div
                    style={{
                        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                        width: 22,
                        height: 18,
                        background:
                            userVote === "up" ? THEME.accentPrimary : THEME.muted
                    }}
                />
            </button>

            {/* SCORE */}
            <span className="text-xs font-mono"
                style={{
                    color:
                        score > 0
                            ? THEME.accentPrimary
                            : score < 0
                                ? THEME.danger
                                : "#E5E9F0"
                }}>
                {score > 0 ? `+${score}` : score}
            </span>

            {/* DOWNVOTE */}
            <button
                onClick={() => vote("down")}
                disabled={loading}
                className="p-0 flex items-center justify-center"
            >
                <div
                    style={{
                        clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
                        width: 22,
                        height: 18,
                        background:
                            userVote === "down" ? THEME.danger : THEME.muted
                    }}
                />
            </button>
        </div>
    );
}