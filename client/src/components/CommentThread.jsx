import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import CommentBox from './CommentBox';
import API from '../utils/api';

function Comment({ comment, postId, depth = 0, onReplyAdded }) {
    const [showReply, setShowReply] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const [upvotes, setUpvotes] = useState(comment.upvotes?.length || 0);
    const [downvotes, setDownvotes] = useState(comment.downvotes?.length || 0);
    const [userVote, setUserVote] = useState(null);
    const [loading, setLoading] = useState(false);

    const authorName = comment.isAnonymous
        ? "Anonymous"
        : comment.author?.name;

    const timeAgo = formatDistanceToNow(
        new Date(comment.createdAt),
        { addSuffix: true }
    );

    const vote = async (type) => {
        if (loading) return;
        setLoading(true);

        try {
            const { data } = await API.post(
                `/comments/${comment._id}/vote`,
                { type }
            );

            setUpvotes(data.upvotes);
            setDownvotes(data.downvotes);
            setUserVote(data.userVote);
        } catch (err) {
            console.error(err?.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReplyAdded = (reply) => {
        onReplyAdded?.(reply);
        setShowReply(false);
    };

    return (
        <div
            className="border-l border-[#4E5D78]/15 pl-4 mt-4 first:mt-0"
            style={{ marginLeft: depth > 0 ? `${depth * 16}px` : '0px' }}
        >
            <div className="flex items-center gap-2 font-['Share_Tech_Mono'] text-xs tracking-wide">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-4 h-4 flex items-center justify-center bg-[#121824] border border-[#4E5D78]/30 text-[#00F0FF] text-[10px] cursor-pointer hover:border-[#00F0FF] transition-colors"
                >
                    {collapsed ? "+" : "-"}
                </button>

                <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[#E5E9F0]">
                    {authorName}
                </span>
                <span className="text-[#4E5D78]">
                    • {timeAgo.toUpperCase()}
                </span>
            </div>

            {!collapsed && (
                <div className="mt-2 space-y-3">
                    <p className="text-xs leading-relaxed font-['Plus_Jakarta_Sans'] text-[#E5E9F0]/90">
                        {comment.body}
                    </p>

                    <div className="flex items-center gap-4 font-['Share_Tech_Mono'] text-[11px] tracking-wider text-[#4E5D78]">
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => vote("up")}
                                className={`cursor-pointer hover:text-[#A3FF12] transition-colors ${userVote === 'up' ? 'text-[#A3FF12]' : ''}`}
                            >
                                ⬆ {upvotes}
                            </button>

                            <button
                                onClick={() => vote("down")}
                                className={`cursor-pointer hover:text-[#00F0FF] transition-colors ${userVote === 'down' ? 'text-[#00F0FF]' : ''}`}
                            >
                                ⬇ {downvotes}
                            </button>
                        </div>

                        <div className="border-l border-[#4E5D78]/20 pl-4">
                            SCORE: <span className="text-[#E5E9F0] font-bold">{upvotes - downvotes}</span>{/*  removeeee thissssss  */}
                        </div>

                        <button
                            onClick={() => setShowReply(!showReply)}
                            className="text-[#00F0FF]/80 hover:text-[#00F0FF] underline underline-offset-2 cursor-pointer transition-colors ml-auto text-[10px] uppercase"
                        >
                            [ Reply ]
                        </button>
                    </div>

                    {showReply && (
                        <div className="pt-1">
                            <CommentBox
                                postId={postId}
                                parentCommentId={comment._id}
                                onCommentAdded={handleReplyAdded}
                                onCancel={() => setShowReply(false)}
                            />
                        </div>
                    )}

                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {comment.replies.map(reply => (
                                <Comment
                                    key={reply._id}
                                    comment={reply}
                                    postId={postId}
                                    depth={depth + 1}
                                    onReplyAdded={onReplyAdded}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// build tree 
function buildTree(comments) {
    const map = {};
    const roots = [];

    comments.forEach(c => {
        map[c._id] = { ...c, replies: [] };
    });

    comments.forEach(c => {
        if (c.parentComment && map[c.parentComment]) {
            map[c.parentComment].replies.push(map[c._id]);
        } else {
            roots.push(map[c._id]);
        }
    });

    return roots;
}

export default function CommentThread({ comments, postId, onCommentAdded }) {
    const tree = buildTree(comments);

    if (!tree.length) {
        return (
            <div className="w-full py-10 text-center text-xs font-['Share_Tech_Mono'] tracking-[2px] border border-dashed border-[#4E5D78]/15 bg-[#121824]/10 text-[#4E5D78] uppercase">
                [ NO DATA TRANSMISSIONS APPENDED TO THIS RECORD ]
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-[#121824]/20 p-4 border border-[#4E5D78]/10">
            {tree.map(c => (
                <Comment
                    key={c._id}
                    comment={c}
                    postId={postId}
                    onReplyAdded={onCommentAdded}
                />
            ))}
        </div>
    );
}