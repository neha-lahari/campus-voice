import { useState, useEffect, useRef } from "react";
import API from "../utils/api";
import { socket } from "../socket";

const THEME = {
    bg: '#060A13', card: '#121824',
    border: 'rgba(0, 240, 255, 0.12)', borderMuted: 'rgba(78, 93, 120, 0.15)',
    cyan: '#00F0FF', lime: '#A3FF12', text: '#E5E9F0', muted: '#4E5D78',
};

export default function Messages() {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [activeConvo, setActiveConvo] = useState({ conversationId: null, user: null });
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [searching, setSearching] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [pendingAtt, setPendingAtt] = useState(null); // 👈 file waiting to send
    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);
    const currentUserId = useRef(localStorage.getItem("userId")).current;

    useEffect(() => {
        API.get("/dm/conversations")
            .then(res => setConversations(res.data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!search.trim()) { setSearchResults([]); return; }
        setSearching(true);
        const timer = setTimeout(() => {
            API.get(`/search?q=${encodeURIComponent(search)}`)
                .then(res => {
                    const filtered = (res.data.users || []).filter(u => String(u._id) !== String(currentUserId));
                    setSearchResults(filtered);
                })
                .catch(console.error)
                .finally(() => setSearching(false));
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (!activeConvo.conversationId) return;
        setMessages([]);
        setPendingAtt(null);
        socket.emit("joinConversation", { conversationId: activeConvo.conversationId });
        API.get(`/dm/messages/${activeConvo.conversationId}`)
            .then(res => setMessages(Array.isArray(res.data) ? res.data : []))
            .catch(console.error);
        socket.emit("seenMessages", { conversationId: activeConvo.conversationId });
    }, [activeConvo.conversationId]);

    useEffect(() => {
        const handler = (msg) => {
            if (String(msg?.conversation) === String(activeConvo.conversationId)) {
                setMessages(prev => [...prev, msg]);
                socket.emit("seenMessages", { conversationId: activeConvo.conversationId });
            }
            setConversations(prev => prev.map(c =>
                String(c._id) === String(msg.conversation) ? { ...c, lastMessage: msg } : c
            ));
        };
        socket.on("newDMMessage", handler);
        return () => socket.off("newDMMessage", handler);
    }, [activeConvo.conversationId]);

    useEffect(() => {
        const handler = ({ conversationId, userId }) => {
            if (String(conversationId) !== String(activeConvo.conversationId)) return;
            if (String(userId) === String(currentUserId)) return;
            setMessages(prev => prev.map(m => {
                const senderId = m.sender?._id || m.sender;
                if (String(senderId) !== String(currentUserId)) return m;
                const alreadySeen = m.seenBy?.some(id => String(id) === String(userId));
                if (alreadySeen) return m;
                return { ...m, seenBy: [...(m.seenBy || []), userId] };
            }));
        };
        socket.on("messagesSeen", handler);
        return () => socket.off("messagesSeen", handler);
    }, [activeConvo.conversationId, currentUserId]);

    useEffect(() => {
        if (!activeConvo.conversationId) return;
        const handler = () => socket.emit("joinConversation", { conversationId: activeConvo.conversationId });
        socket.on("connect", handler);
        return () => socket.off("connect", handler);
    }, [activeConvo.conversationId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const openConversation = async (otherUser) => {
        try {
            const res = await API.post("/dm/conversation", { userId: otherUser._id });
            const convo = res.data;
            setActiveConvo({ conversationId: convo._id, user: otherUser });
            setSearch("");
            setSearchResults([]);
            setConversations(prev => {
                const exists = prev.find(c => String(c._id) === String(convo._id));
                if (exists) return prev;
                return [{ ...convo, participants: [{ _id: currentUserId }, otherUser] }, ...prev];
            });
        } catch (err) { console.error(err); }
    };

    const sendMessage = () => {
        if (!text.trim() && !pendingAtt) return;
        if (!activeConvo.conversationId) return;
        socket.emit("dmMessage", {
            conversationId: activeConvo.conversationId,
            text: text.trim(),
            attachments: pendingAtt ? [pendingAtt] : []
        });
        setText("");
        setPendingAtt(null);
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeConvo.conversationId) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await API.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setPendingAtt({
                url: res.data.url,
                fileType: res.data.type === "image" ? "image" :
                    file.type === "application/pdf" ? "pdf" : "file",
                name: res.data.name
            });
        } catch (err) {
            console.error("Upload failed:", err.response?.data || err.message);
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const getOtherUser = (convo) => convo.participants?.find(p => String(p._id) !== String(currentUserId));
    const isMyMessage = (msg) => String(msg.sender?._id || msg.sender) === String(currentUserId);
    const displayName = (user) => user?.name || user?.username || "Unknown";
    const initials = (user) => displayName(user).substring(0, 2).toUpperCase();

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
                📄 {att.name || att.url?.split('/').pop() || 'FILE'}
            </a>
        );
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Share+Tech+Mono&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
                .msg-input:focus { outline: none; border-color: #00F0FF !important; }
                .msg-input::placeholder { color: rgba(78,93,120,0.5); }
                .search-input:focus { outline: none; border-color: #00F0FF !important; }
                .convo-item:hover { background: rgba(0,240,255,0.03) !important; }
                .search-result:hover { background: rgba(163,255,18,0.05) !important; }
                ::-webkit-scrollbar { width: 3px; }
                ::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.15); border-radius: 2px; }
            `}</style>

            <div style={{ display: 'flex', height: 'calc(100vh - 56px)', background: THEME.bg, fontFamily: "'Share Tech Mono', monospace", overflow: 'hidden' }}>

                {/* SIDEBAR */}
                <div style={{ width: 280, flexShrink: 0, borderRight: `1px solid ${THEME.borderMuted}`, display: 'flex', flexDirection: 'column', background: THEME.card }}>
                    <div style={{ padding: 16, borderBottom: `1px solid ${THEME.borderMuted}` }}>
                        <p style={{ fontSize: 10, color: THEME.muted, letterSpacing: 3, margin: '0 0 10px 0' }}>DIRECT_CHANNELS</p>
                        <div style={{ position: 'relative' }}>
                            <input className="search-input" value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search users..."
                                style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', background: 'rgba(6,10,19,0.6)', border: `1px solid ${THEME.borderMuted}`, color: THEME.text, fontSize: 11, fontFamily: "'Share Tech Mono', monospace" }} />
                            {search.trim() && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: THEME.card, border: `1px solid ${THEME.border}`, zIndex: 50, maxHeight: 220, overflowY: 'auto' }}>
                                    {searching && <div style={{ padding: '10px 12px', fontSize: 10, color: THEME.muted }}>SCANNING...</div>}
                                    {!searching && searchResults.length === 0 && <div style={{ padding: '10px 12px', fontSize: 10, color: THEME.muted }}>NO USERS FOUND</div>}
                                    {searchResults.map(u => (
                                        <div key={u._id} className="search-result" onClick={() => openConversation(u)}
                                            style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${THEME.borderMuted}` }}>
                                            <div style={{ width: 28, height: 28, background: 'rgba(6,10,19,0.8)', border: '1px solid rgba(78,93,120,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: THEME.cyan, flexShrink: 0, clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}>{initials(u)}</div>
                                            <div>
                                                <div style={{ fontSize: 11, color: THEME.text }}>{displayName(u)}</div>
                                                {u.department && <div style={{ fontSize: 10, color: THEME.muted }}>{u.department} · {u.batch}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {conversations.length === 0 ? (
                            <div style={{ padding: 24, textAlign: 'center', fontSize: 10, color: THEME.muted, letterSpacing: 2, lineHeight: 2 }}>[ NO ACTIVE<br />CHANNEL PATHS ]</div>
                        ) : conversations.map(convo => {
                            const other = getOtherUser(convo);
                            if (!other) return null;
                            const isActive = String(activeConvo.conversationId) === String(convo._id);
                            return (
                                <div key={convo._id} className="convo-item"
                                    onClick={() => setActiveConvo({ conversationId: convo._id, user: other })}
                                    style={{ padding: '12px 16px', borderBottom: `1px solid ${THEME.borderMuted}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, background: isActive ? 'rgba(0,240,255,0.04)' : 'transparent', borderLeft: isActive ? `2px solid ${THEME.cyan}` : '2px solid transparent' }}>
                                    <div style={{ width: 36, height: 36, flexShrink: 0, background: 'rgba(6,10,19,0.7)', border: `1px solid ${isActive ? THEME.cyan : 'rgba(78,93,120,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: THEME.cyan, clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>{initials(other)}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 12, color: THEME.text, marginBottom: 2, fontFamily: "'Plus Jakarta Sans'", fontWeight: 600 }}>{displayName(other)}</div>
                                        <div style={{ fontSize: 10, color: THEME.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {convo.lastMessage?.text || (convo.lastMessage?.attachments?.length ? "📎 Attachment" : "...")}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CHAT PANEL */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {!activeConvo.conversationId ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                            <div style={{ fontSize: 10, color: THEME.muted, letterSpacing: 3 }}>[ SELECT A CHANNEL OR SEARCH A USER TO BEGIN ]</div>
                        </div>
                    ) : (
                        <>
                            <div style={{ padding: '14px 20px', background: THEME.card, borderBottom: `1px solid ${THEME.borderMuted}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: THEME.lime }} />
                                    <span style={{ fontSize: 12, color: THEME.text, letterSpacing: 2, fontFamily: "'Orbitron', monospace" }}>{displayName(activeConvo.user).toUpperCase()}</span>
                                </div>
                                <span style={{ fontSize: 10, color: THEME.muted, letterSpacing: 2 }}>COMMS_LINK // ACTIVE</span>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(6,10,19,0.3)' }}>
                                {messages.length === 0 ? (
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: THEME.muted, letterSpacing: 3 }}>[ NO TRANSMISSION HISTORY RECOVERED ]</div>
                                ) : messages.map((m, i) => {
                                    const mine = isMyMessage(m);
                                    const isSeen = mine && m.seenBy?.some(id => String(id) !== String(currentUserId));
                                    return (
                                        <div key={m._id || i} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                                            {!mine && (
                                                <div style={{ width: 24, height: 24, flexShrink: 0, background: 'rgba(6,10,19,0.8)', border: '1px solid rgba(78,93,120,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: THEME.cyan, clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}>{initials(activeConvo.user)}</div>
                                            )}
                                            <div style={{ maxWidth: '65%' }}>
                                                <div style={{ padding: '10px 14px', fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.6, color: THEME.text, minHeight: 20, background: mine ? THEME.card : 'rgba(6,10,19,0.7)', border: `1px solid ${mine ? 'rgba(0,240,255,0.25)' : 'rgba(78,93,120,0.2)'}`, clipPath: mine ? 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' : 'polygon(0 8px, 8px 0, 100% 0, 100% 100%, 0 100%)' }}>
                                                    {m.text && <p style={{ margin: 0 }}>{m.text}</p>}
                                                    {m.attachments?.map((att, ai) => renderAttachment(att, ai))}
                                                    {mine && (
                                                        <div style={{ fontSize: 9, color: isSeen ? 'rgba(0,240,255,0.6)' : 'rgba(78,93,120,0.5)', textAlign: 'right', marginTop: 4, letterSpacing: 1, fontFamily: 'monospace' }}>
                                                            {isSeen ? "✓✓ SEEN" : "✓ SENT"}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>

                            {/* FILE PREVIEW BEFORE SEND */}
                            {pendingAtt && (
                                <div style={{ padding: '8px 12px', background: 'rgba(0,240,255,0.04)', borderTop: `1px solid rgba(0,240,255,0.15)`, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {pendingAtt.fileType === "image" ? (
                                        <img src={pendingAtt.url} alt="preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, border: '1px solid #333' }} />
                                    ) : (
                                        <span style={{ fontSize: 20 }}>📄</span>
                                    )}
                                    <div style={{ flex: 1, fontSize: 10, color: THEME.cyan, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pendingAtt.name}</div>
                                    <button onClick={() => setPendingAtt(null)} style={{ background: 'none', border: 'none', color: THEME.muted, cursor: 'pointer', fontSize: 14 }}>✕</button>
                                </div>
                            )}

                            <div style={{ padding: '12px 16px', background: THEME.card, borderTop: `1px solid ${THEME.borderMuted}`, display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,application/pdf" onChange={handleFileSelect} />
                                <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                                    style={{ background: pendingAtt ? 'rgba(0,240,255,0.08)' : 'none', border: `1px solid ${pendingAtt ? THEME.cyan : THEME.borderMuted}`, color: pendingAtt ? THEME.cyan : THEME.muted, padding: '8px 10px', cursor: 'pointer', fontSize: 14, opacity: uploading ? 0.4 : 1 }}>
                                    {uploading ? '⏳' : '📎'}
                                </button>
                                <input className="msg-input" value={text} onChange={e => setText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    placeholder={pendingAtt ? "Add a caption..." : "Type a message..."}
                                    style={{ flex: 1, padding: '10px 16px', background: 'rgba(6,10,19,0.6)', border: '1px solid rgba(78,93,120,0.2)', color: THEME.text, fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                                <button onClick={sendMessage} disabled={!text.trim() && !pendingAtt}
                                    style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${THEME.lime}`, color: THEME.lime, fontSize: 11, letterSpacing: 3, fontFamily: 'monospace', cursor: (text.trim() || pendingAtt) ? 'pointer' : 'not-allowed', opacity: (text.trim() || pendingAtt) ? 1 : 0.3, clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}>
                                    SEND
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}