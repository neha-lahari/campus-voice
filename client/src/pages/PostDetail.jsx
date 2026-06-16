import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

import { useAuth } from '../context/AuthContext';
import CommentThread from '../components/CommentThread';
import CommentBox from '../components/CommentBox';
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

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [voteCount, setVoteCount] = useState(0);
    const [userVote, setUserVote] = useState(null);
    const [saved, setSaved] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editBody, setEditBody] = useState("");

    useEffect(() => {
        fetchPost();
        fetchComments();
    }, [id]);

    const fetchPost = async () => {
        try {
            const res = await api.get(`/posts/${id}`);
            const p = res.data.post;

            setPost(p);
            setEditBody(p.body || "");
            setVoteCount(res.data.voteCount ?? 0);

            const uid = user?._id?.toString();

            setUserVote(
                p.upvotes?.some(x => x.toString() === uid)
                    ? 'up'
                    : p.downvotes?.some(x => x.toString() === uid)
                        ? 'down'
                        : null
            );

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await api.get(`/comments?postId=${id}`);
            setComments(res.data.comments || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleVote = async (type) => {
        try {
            const res = await api.post(`/posts/${id}/vote`, { type });
            setVoteCount(res.data.voteCount);
            setUserVote(res.data.userVote);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        try {
            const res = await api.post(`/posts/${id}/save`);
            setSaved(res.data.saved);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkSolved = async () => {//////reemoveeeeeeee thissssssssssssss
        try {
            await api.patch(`/posts/${id}/solve`);
            setPost(prev => ({ ...prev, isSolved: true }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async () => {
        try {
            const res = await api.put(`/posts/${id}`, {
                body: editBody
            });

            setPost(res.data.post);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/posts/${id}`);

            const slug = post?.community?.slug;

            setPost(null);

            if (slug) {
                navigate(`/community/${slug}`, { replace: true });
            } else {
                navigate("/home", { replace: true });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCommentAdded = (newComment) => {
        setComments(prev => [...prev, newComment]);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{
                    background: `linear-gradient(to bottom, ${THEME.bgMainStart}, ${THEME.bgMainEnd})`,
                    color: THEME.accentSecondary
                }}>
                Loading...
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{
                    background: `linear-gradient(to bottom, ${THEME.bgMainStart}, ${THEME.bgMainEnd})`,
                    color: THEME.textMuted
                }}>
                Post not found
            </div>
        );
    }

    const isAuthor = user?._id === post.author?._id;

    return (
        <div className="min-h-screen w-full py-8 px-4"
            style={{ background: `linear-gradient(to bottom, ${THEME.bgMainStart}, ${THEME.bgMainEnd})` }}>

            <div className="max-w-3xl mx-auto space-y-5">

                {/* POST CARD */}
                <div className="p-6"
                    style={{
                        background: THEME.bgCard,
                        border: '1px solid rgba(0,240,255,0.12)'
                    }}>

                    {/* META */}
                    <div className="text-xs mb-4" style={{ color: THEME.textMuted }}>
                        r/{post.community?.name} • {post.isAnonymous ? "Anonymous" : post.author?.name} • {
                            formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                        }
                    </div>

                    {/* TITLE */}
                    <h1 className="text-lg font-bold mb-3" style={{ color: THEME.textMain }}>
                        {post.title}
                    </h1>

                    {/* BODY */}
                    {!isEditing ? (
                        <p className="mb-4 whitespace-pre-wrap" style={{ color: '#b2c0d4' }}>
                            {post.body}
                        </p>
                    ) : (
                        <div className="space-y-2">
                            <textarea
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                className="w-full p-2"
                            />
                            <button onClick={handleUpdate}>Save</button>
                        </div>
                    )}

                    {/* ATTACHMENTS */}
                    {post.attachments?.length > 0 && (
                        <div className="space-y-4 mb-4">
                            {post.attachments.map((att, i) => {

                                // IMAGE
                                if (att.fileType === "image") {
                                    return (
                                        <img
                                            key={i}
                                            src={att.url}
                                            alt="attachment"
                                            className="w-full rounded-lg border border-zinc-800"
                                        />
                                    );
                                }

                                // PDF (FIXED UI)
                                if (att.fileType === "pdf") {
                                    return (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 p-4 rounded-lg border border-zinc-800"
                                            style={{ background: 'rgba(0,240,255,0.03)' }}
                                        >
                                            <span className="text-2xl">📄</span>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-mono text-cyan-400 truncate">
                                                    {att.url.split('/').pop()}
                                                </p>
                                                <p className="text-xs mt-0.5" style={{ color: '#4E5D78' }}>
                                                    PDF Document
                                                </p>
                                            </div>

                                            <a
                                                href={att.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="shrink-0 px-4 py-2 text-xs font-bold font-mono tracking-widest border rounded"
                                                style={{
                                                    color: '#00F0FF',
                                                    borderColor: 'rgba(0,240,255,0.3)',
                                                    background: 'rgba(0,240,255,0.05)'
                                                }}
                                            >
                                                OPEN PDF ↗
                                            </a>
                                        </div>
                                    );
                                }

                                return null;
                            })}
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="flex gap-3 items-center">

                        <button onClick={() => handleVote("up")}>▲</button>
                        <span>{voteCount}</span>
                        <button onClick={() => handleVote("down")}>▼</button>

                        <button onClick={handleSave}>
                            {saved ? "Saved" : "Save"}
                        </button>

                        {isAuthor && (
                            <>
                                <button onClick={() => setIsEditing(true)}>Edit</button>
                                <button onClick={handleDelete}>Delete</button>
                            </>
                        )}

                        {isAuthor && post.flair === "Doubt" && !post.isSolved && (////////removeeeeeeeeethissssssssss
                            <button onClick={handleMarkSolved}>
                                Mark Solved
                            </button>
                        )}
                    </div>
                </div>

                {/* COMMENTS */}
                <CommentBox postId={id} onCommentAdded={handleCommentAdded} />

                <CommentThread
                    comments={comments}
                    postId={id}
                    onCommentAdded={handleCommentAdded}
                />

            </div>
        </div>
    );
}