import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import API from "../../utils/api";

const THEME = {
    bg: '#060A13', card: '#121824',
    border: 'rgba(0,240,255,0.12)', borderMuted: 'rgba(78,93,120,0.15)',
    cyan: '#00F0FF', lime: '#A3FF12', text: '#E5E9F0', muted: '#4E5D78',
};

export default function CommunityChat({ communityId, userRole }) {
    const [messages, setMessages] = useState([]);
    const [allMessages, setAllMessages] = useState([]);
    const [text, setText] = useState("");
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [pinnedMessages, setPinnedMessages] = useState([]);
    const [pinnedIndex, setPinnedIndex] = useState(0);
    const [pendingFile, setPendingFile] = useState(null); // 👈 file preview before send
    const [pendingAtt, setPendingAtt] = useState(null);   // 👈 uploaded att waiting to send
    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);
    const currentUserId = localStorage.getItem("userId");
    const isCR = userRole === "admin" || userRole === "cr";

    useEffect(() => {
        if (!communityId) return;
        API.get(`/messages/community/${communityId}`)
            .then(res => {
                const msgs = Array.isArray(res.data) ? res.data : [];
                setMessages(msgs);
                setAllMessages(msgs);
                setPinnedMessages(msgs.filter(m => m.pinned));
            })
            .catch(console.error);
    }, [communityId]);

    useEffect(() => {
        if (!communityId) return;
        socket.emit("joinCommunity", communityId);

        const onNew = (msg) => {
            if (String(msg?.community) === String(communityId)) {
                setMessages(prev => [...prev, msg]);
                setAllMessages(prev => [...prev, msg]);
            }
        };
        const onPinned = (msg) => {
            if (String(msg?.community) === String(communityId)) {
                setMessages(prev => prev.map(m => String(m._id) === String(msg._id) ? msg : m));
                setAllMessages(prev => prev.map(m => String(m._id) === String(msg._id) ? msg : m));
                setPinnedMessages(prev => {
                    const filtered = prev.filter(m => String(m._id) !== String(msg._id));
                    return [...filtered, msg].slice(-3);
                });
            }
        };
        const onUnpinned = (msg) => {
            setPinnedMessages(prev => prev.filter(m => String(m._id) !== String(msg._id)));
            setMessages(prev => prev.map(m => String(m._id) === String(msg._id) ? { ...m, pinned: false } : m));
        };

        socket.on("newCommunityMessage", onNew);
        socket.on("messagePinned", onPinned);
        socket.on("messageUnpinned", onUnpinned);
        return () => {
            socket.off("newCommunityMessage", onNew);
            socket.off("messagePinned", onPinned);
            socket.off("messageUnpinned", onUnpinned);
        };
    }, [communityId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 👇 Upload file but DON'T send yet — show preview with caption input
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await API.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            const att = {
                url: res.data.url,
                fileType: res.data.type === "image" ? "image" :
                    file.type === "application/pdf" ? "pdf" : "file",
                name: res.data.name
            };
            setPendingFile(file);
            setPendingAtt(att); // store, wait for user to hit send
        } catch (err) {
            console.error("Upload failed:", err.response?.data || err.message);
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    // 👇 Send text + optional attachment together
    const send = () => {
        if (!text.trim() && !pendingAtt) return;
        socket.emit("communityMessage", {
            communityId,
            text: text.trim(),
            attachments: pendingAtt ? [pendingAtt] : []
        });
        setText("");
        setPendingFile(null);
        setPendingAtt(null);
    };

    const cancelPending = () => {
        setPendingFile(null);
        setPendingAtt(null);
    };

    const handlePin = (messageId) => {
        socket.emit("pinMessage", { messageId, communityId });
    };

    const handleSearch = (q) => {
        setSearchQuery(q);
        if (!q.trim()) { setMessages(allMessages); return; }
        const filtered = allMessages.filter(m =>
            m.text?.toLowerCase().includes(q.toLowerCase()) ||
            m.sender?.name?.toLowerCase().includes(q.toLowerCase())
        );
        setMessages(filtered);
    };

    const renderAttachment = (att, i) => {
        if (att.fileType === "image") {
            return (
                <a key={i} href={att.url} target="_blank" rel="noreferrer">
                    <img src={att.url} alt={att.name || "image"}
                        style={{ maxWidth: 220, borderRadius: 4, marginTop: 6, border: '1px solid #333', display: 'block', cursor: 'pointer' }} />
                </a>
            );
        }
        return (
            <a key={i} href={att.url} target="_blank" rel="noreferrer"
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6,
                    padding: '6px 12px', fontSize: 11, color: THEME.cyan,
                    border: `1px solid rgba(0,240,255,0.2)`, background: 'rgba(0,240,255,0.03)',
                    fontFamily: 'monospace', textDecoration: 'none'
                }}>
                📄 {att.name || att.url?.split('/').pop()}
            </a>
        );
    };

    return (
        <div className="flex flex-col" style={{ height: "600px" }}>

            {/* PINNED STICKY HEADER */}
            {pinnedMessages.length > 0 && (
                <div onClick={() => setPinnedIndex(i => (i + 1) % pinnedMessages.length)}
                    style={{
                        padding: '8px 16px', background: 'rgba(163,255,18,0.04)',
                        borderBottom: `1px solid rgba(163,255,18,0.2)`,
                        cursor: pinnedMessages.length > 1 ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', gap: 10
                    }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                        {pinnedMessages.map((_, i) => (
                            <div key={i} style={{
                                width: 3, height: 8,
                                background: i === pinnedIndex ? THEME.lime : 'rgba(163,255,18,0.3)',
                                borderRadius: 2
                            }} />
                        ))}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 9, color: THEME.lime, fontFamily: 'monospace', letterSpacing: 2, marginBottom: 2 }}>
                            📌 PINNED {pinnedMessages.length > 1 ? `(${pinnedIndex + 1}/${pinnedMessages.length})` : ""}
                        </div>
                        <div style={{ fontSize: 11, color: THEME.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {pinnedMessages[pinnedIndex]?.text || pinnedMessages[pinnedIndex]?.attachments?.[0]?.name || "📎 Attachment"}
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER + SEARCH */}
            <div style={{
                padding: '10px 16px', background: THEME.card,
                borderBottom: `1px solid ${THEME.borderMuted}`,
                display: 'flex', alignItems: 'center', gap: 10
            }}>
                <span style={{ fontSize: 10, color: THEME.muted, letterSpacing: 3, flex: 1 }}>
                    COMMUNITY_CHANNEL // LIVE
                </span>
                <input value={searchQuery} onChange={e => handleSearch(e.target.value)}
                    placeholder="Search messages..."
                    style={{
                        padding: '4px 10px', fontSize: 10, width: 160,
                        background: 'rgba(6,10,19,0.6)', border: `1px solid ${THEME.borderMuted}`,
                        color: THEME.text, fontFamily: 'monospace', outline: 'none'
                    }} />
                {searchQuery && (
                    <button onClick={() => handleSearch("")}
                        style={{ fontSize: 10, color: THEME.muted, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                )}
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: THEME.lime }} />
            </div>

            {/* MESSAGES */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: THEME.muted, letterSpacing: 3 }}>
                        {searchQuery ? "[ NO MESSAGES MATCH ]" : "[ NO TRANSMISSION HISTORY RECOVERED ]"}
                    </div>
                ) : messages.map((m, i) => {
                    const isMe = String(m.sender?._id) === String(currentUserId);
                    const senderName = m.sender?.name || "UNKNOWN";
                    return (
                        <div key={m._id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                            {m.pinned && <span style={{ fontSize: 9, color: THEME.lime, marginBottom: 2, fontFamily: 'monospace' }}>📌 PINNED</span>}
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                                {!isMe && (
                                    <div style={{
                                        width: 26, height: 26, flexShrink: 0, background: 'rgba(6,10,19,0.8)',
                                        border: `1px solid rgba(78,93,120,0.3)`, display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: 9, color: THEME.cyan,
                                        clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
                                    }}>{senderName.substring(0, 2).toUpperCase()}</div>
                                )}
                                <div style={{ maxWidth: '70%' }}>
                                    {!isMe && (
                                        <div style={{ fontSize: 9, color: THEME.muted, marginBottom: 3, fontFamily: 'monospace', letterSpacing: 1 }}>
                                            {senderName.toUpperCase()}
                                        </div>
                                    )}
                                    <div style={{
                                        padding: '10px 14px', fontSize: 13,
                                        fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.6,
                                        color: THEME.text, minHeight: 20,
                                        background: isMe ? THEME.card : 'rgba(6,10,19,0.7)',
                                        border: `1px solid ${m.pinned ? 'rgba(163,255,18,0.3)' : isMe ? 'rgba(0,240,255,0.25)' : 'rgba(78,93,120,0.2)'}`,
                                        clipPath: isMe
                                            ? 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'
                                            : 'polygon(0 8px, 8px 0, 100% 0, 100% 100%, 0 100%)'
                                    }}>
                                        {m.text && <p style={{ margin: 0 }}>{m.text}</p>}
                                        {m.attachments?.map((att, ai) => renderAttachment(att, ai))}
                                    </div>
                                    {isCR && !m.pinned && (
                                        <button onClick={() => handlePin(m._id)}
                                            style={{ marginTop: 3, fontSize: 9, background: 'none', border: 'none', color: THEME.muted, cursor: 'pointer', fontFamily: 'monospace' }}>
                                            📌 PIN
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* FILE PREVIEW BEFORE SEND — like WhatsApp */}
            {pendingAtt && (
                <div style={{
                    padding: '8px 12px', background: 'rgba(0,240,255,0.04)',
                    borderTop: `1px solid rgba(0,240,255,0.15)`,
                    display: 'flex', alignItems: 'center', gap: 10
                }}>
                    {pendingAtt.fileType === "image" ? (
                        <img src={pendingAtt.url} alt="preview"
                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, border: '1px solid #333' }} />
                    ) : (
                        <span style={{ fontSize: 20 }}>📄</span>
                    )}
                    <div style={{ flex: 1, fontSize: 10, color: THEME.cyan, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pendingAtt.name}
                    </div>
                    <button onClick={cancelPending}
                        style={{ background: 'none', border: 'none', color: THEME.muted, cursor: 'pointer', fontSize: 14 }}>✕</button>
                </div>
            )}

            {/* INPUT */}
            <div style={{
                padding: '10px 12px', background: THEME.card,
                borderTop: `1px solid ${THEME.borderMuted}`,
                display: 'flex', gap: 8, alignItems: 'center'
            }}>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }}
                    accept="image/*,application/pdf"
                    onChange={handleFileSelect} />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    style={{
                        background: pendingAtt ? 'rgba(0,240,255,0.08)' : 'none',
                        border: `1px solid ${pendingAtt ? THEME.cyan : THEME.borderMuted}`,
                        color: pendingAtt ? THEME.cyan : THEME.muted,
                        padding: '8px 10px', cursor: 'pointer', fontSize: 14,
                        opacity: uploading ? 0.4 : 1
                    }}>
                    {uploading ? '⏳' : '📎'}
                </button>
                <input value={text} onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder={pendingAtt ? "Add a caption..." : "Broadcast to channel..."}
                    style={{
                        flex: 1, padding: '10px 16px', background: 'rgba(6,10,19,0.6)',
                        border: `1px solid rgba(78,93,120,0.2)`, color: THEME.text,
                        fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", outline: 'none'
                    }} />
                <button onClick={send} disabled={!text.trim() && !pendingAtt}
                    style={{
                        padding: '10px 18px', background: 'transparent',
                        border: `1px solid ${THEME.lime}`, color: THEME.lime,
                        fontSize: 11, letterSpacing: 3, fontFamily: 'monospace',
                        cursor: (text.trim() || pendingAtt) ? 'pointer' : 'not-allowed',
                        opacity: (text.trim() || pendingAtt) ? 1 : 0.3,
                        clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)'
                    }}>
                    SEND
                </button>
            </div>
        </div>
    );
}