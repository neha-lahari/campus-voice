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
    const [pendingAtt, setPendingAtt] = useState(null);
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
                    <img
                        src={att.url}
                        alt={att.name || "image"}
                        className="mt-1.5 block max-w-[220px] rounded cursor-pointer"
                        style={{ border: '1px solid #333' }}
                    />
                </a>
            );
        }
        return (
            <a key={i} href={att.url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1.5 text-[11px] no-underline rounded"
                style={{ color: THEME.cyan, border: 'rgba(0,240,255,0.2)', background: 'rgba(0,240,255,0.03)', fontFamily: 'monospace' }}>
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
                .search-input::placeholder { color: rgba(78,93,120,0.5); }
                .convo-item:hover { background: rgba(0,240,255,0.03) !important; }
                .search-result:hover { background: rgba(163,255,18,0.05) !important; }
                ::-webkit-scrollbar { width: 3px; }
                ::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.15); border-radius: 2px; }
            `}</style>

            <div
                className="flex overflow-hidden"
                style={{ height: 'calc(100vh - 56px)', background: THEME.bg, fontFamily: "'Share Tech Mono', monospace" }}
            >

                {/*  Sidebar  */}
                <div
                    className="flex flex-col flex-shrink-0 w-[280px]"
                    style={{ background: THEME.card, borderRight: `1px solid ${THEME.borderMuted}` }}
                >
                    {/* Search header */}
                    <div className="p-4" style={{ borderBottom: `1px solid ${THEME.borderMuted}` }}>
                        <p className="text-[10px] tracking-[3px] mb-2.5" style={{ color: THEME.muted }}>
                            DIRECT_CHANNELS
                        </p>
                        <div className="relative">
                            <input
                                className="search-input w-full px-3 py-2 text-[11px] transition-all duration-200"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search users..."
                                style={{ background: 'rgba(6,10,19,0.6)', border: `1px solid ${THEME.borderMuted}`, color: THEME.text, fontFamily: "'Share Tech Mono', monospace", boxSizing: 'border-box' }}
                            />

                            {/* Search dropdown */}
                            {search.trim() && (
                                <div
                                    className="absolute left-0 right-0 top-full z-50 overflow-y-auto max-h-[220px]"
                                    style={{ background: THEME.card, border: `1px solid ${THEME.border}` }}
                                >
                                    {searching && (
                                        <div className="px-3 py-2.5 text-[10px]" style={{ color: THEME.muted }}>SCANNING...</div>
                                    )}
                                    {!searching && searchResults.length === 0 && (
                                        <div className="px-3 py-2.5 text-[10px]" style={{ color: THEME.muted }}>NO USERS FOUND</div>
                                    )}
                                    {searchResults.map(u => (
                                        <div
                                            key={u._id}
                                            className="search-result flex items-center gap-2.5 px-3 py-2.5 cursor-pointer"
                                            onClick={() => openConversation(u)}
                                            style={{ borderBottom: `1px solid ${THEME.borderMuted}` }}
                                        >
                                            {/* Avatar */}
                                            <div
                                                className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-[10px] rounded"
                                                style={{ background: 'rgba(6,10,19,0.8)', border: '1px solid rgba(78,93,120,0.3)', color: THEME.cyan }}
                                            >
                                                {initials(u)}
                                            </div>
                                            <div>
                                                <div className="text-[11px]" style={{ color: THEME.text }}>{displayName(u)}</div>
                                                {u.department && (
                                                    <div className="text-[10px]" style={{ color: THEME.muted }}>{u.department} · {u.batch}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Conversation list */}
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-6 text-center text-[10px] tracking-[2px] leading-loose" style={{ color: THEME.muted }}>
                                [ NO ACTIVE<br />CHANNEL PATHS ]
                            </div>
                        ) : conversations.map(convo => {
                            const other = getOtherUser(convo);
                            if (!other) return null;
                            const isActive = String(activeConvo.conversationId) === String(convo._id);
                            return (
                                <div
                                    key={convo._id}
                                    className="convo-item flex items-center gap-3 px-4 py-3 cursor-pointer"
                                    onClick={() => setActiveConvo({ conversationId: convo._id, user: other })}
                                    style={{
                                        borderBottom: `1px solid ${THEME.borderMuted}`,
                                        background: isActive ? 'rgba(0,240,255,0.04)' : 'transparent',
                                        borderLeft: isActive ? `2px solid ${THEME.cyan}` : '2px solid transparent',
                                    }}
                                >
                                    {/* Avatar */}
                                    <div
                                        className="w-9 h-9 flex-shrink-0 flex items-center justify-center text-[11px] rounded"
                                        style={{
                                            background: 'rgba(6,10,19,0.7)',
                                            border: `1px solid ${isActive ? THEME.cyan : 'rgba(78,93,120,0.25)'}`,
                                            color: THEME.cyan,
                                        }}
                                    >
                                        {initials(other)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div
                                            className="text-[12px] mb-0.5 font-semibold truncate"
                                            style={{ color: THEME.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                                        >
                                            {displayName(other)}
                                        </div>
                                        <div className="text-[10px] truncate" style={{ color: THEME.muted }}>
                                            {convo.lastMessage?.text || (convo.lastMessage?.attachments?.length ? "📎 Attachment" : "...")}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/*  Chat Panel  */}
                <div className="flex flex-col flex-1 overflow-hidden">

                    {/* Empty state */}
                    {!activeConvo.conversationId ? (
                        <div className="flex-1 flex items-center justify-center">
                            <span className="text-[10px] tracking-[3px]" style={{ color: THEME.muted }}>
                                [ SEARCH A USER TO BEGIN ]
                            </span>
                        </div>
                    ) : (
                        <>
            
                            <div
                                className="flex items-center justify-between px-5 py-3.5"
                                style={{ background: THEME.card, borderBottom: `1px solid ${THEME.borderMuted}` }}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="w-2 h-2 rounded-full" style={{ background: THEME.lime }} />
                                    <span
                                        className="text-[12px] tracking-[2px]"
                                        style={{ color: THEME.text, fontFamily: "'Orbitron', monospace" }}
                                    >
                                        {displayName(activeConvo.user).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-[10px] tracking-[2px]" style={{ color: THEME.muted }}>
                                    COMMS_LINK // ACTIVE
                                </span>
                            </div>

                            {/* Messages list */}
                            <div
                                className="flex-1 overflow-y-auto flex flex-col gap-2.5 px-5 py-4"
                                style={{ background: 'rgba(6,10,19,0.3)' }}
                            >
                                {messages.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center text-[10px] tracking-[3px]" style={{ color: THEME.muted }}>
                                        [ NO TRANSMISSION HISTORY RECOVERED ]
                                    </div>
                                ) : messages.map((m, i) => {
                                    const mine = isMyMessage(m);
                                    const isSeen = mine && m.seenBy?.some(id => String(id) !== String(currentUserId));
                                    return (
                                        <div
                                            key={m._id || i}
                                            className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {/* Other user avatar */}
                                            {!mine && (
                                                <div
                                                    className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-[9px] rounded"
                                                    style={{ background: 'rgba(6,10,19,0.8)', border: '1px solid rgba(78,93,120,0.3)', color: THEME.cyan }}
                                                >
                                                    {initials(activeConvo.user)}
                                                </div>
                                            )}

                                            {/* Bubble */}
                                            <div className="max-w-[65%]">
                                                <div
                                                    className="px-3.5 py-2.5 text-[13px] leading-relaxed rounded"
                                                    style={{
                                                        color: THEME.text,
                                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                        background: mine ? THEME.card : 'rgba(6,10,19,0.7)',
                                                        border: `1px solid ${mine ? 'rgba(0,240,255,0.25)' : 'rgba(78,93,120,0.2)'}`,
                                                    }}
                                                >
                                                    {m.text && <p className="m-0">{m.text}</p>}
                                                    {m.attachments?.map((att, ai) => renderAttachment(att, ai))}
                                                    {mine && (
                                                        <div
                                                            className="text-[9px] text-right mt-1 tracking-[1px]"
                                                            style={{ color: isSeen ? 'rgba(0,240,255,0.6)' : 'rgba(78,93,120,0.5)', fontFamily: 'monospace' }}
                                                        >
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

                            {/* Pending attachment preview */}
                            {pendingAtt && (
                                <div
                                    className="flex items-center gap-2.5 px-3 py-2"
                                    style={{ background: 'rgba(0,240,255,0.04)', borderTop: '1px solid rgba(0,240,255,0.15)' }}
                                >
                                    {pendingAtt.fileType === "image" ? (
                                        <img src={pendingAtt.url} alt="preview" className="w-12 h-12 object-cover rounded" style={{ border: '1px solid #333' }} />
                                    ) : (
                                        <span className="text-xl">📄</span>
                                    )}
                                    <div className="flex-1 text-[10px] truncate" style={{ color: THEME.cyan, fontFamily: 'monospace' }}>
                                        {pendingAtt.name}
                                    </div>
                                    <button
                                        onClick={() => setPendingAtt(null)}
                                        className="text-sm bg-transparent border-none cursor-pointer"
                                        style={{ color: THEME.muted }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            {/* Input bar */}
                            <div
                                className="flex items-center gap-2 px-4 py-3"
                                style={{ background: THEME.card, borderTop: `1px solid ${THEME.borderMuted}` }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileSelect}
                                />

                                {/* Attach button */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="px-2.5 py-2 text-sm cursor-pointer transition-all duration-200 rounded"
                                    style={{
                                        background: pendingAtt ? 'rgba(0,240,255,0.08)' : 'none',
                                        border: `1px solid ${pendingAtt ? THEME.cyan : THEME.borderMuted}`,
                                        color: pendingAtt ? THEME.cyan : THEME.muted,
                                        opacity: uploading ? 0.4 : 1,
                                    }}
                                >
                                    {uploading ? '⏳' : '📎'}
                                </button>

                                {/* Text input */}
                                <input
                                    className="msg-input flex-1 px-4 py-2.5 text-[13px] rounded transition-all duration-200"
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    placeholder={pendingAtt ? "Add a caption..." : "Type a message..."}
                                    style={{
                                        background: 'rgba(6,10,19,0.6)',
                                        border: '1px solid rgba(78,93,120,0.2)',
                                        color: THEME.text,
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    }}
                                />

                                {/* Send button */}
                                <button
                                    onClick={sendMessage}
                                    disabled={!text.trim() && !pendingAtt}
                                    className="px-5 py-2.5 text-[11px] tracking-[3px] rounded transition-all duration-200"
                                    style={{
                                        background: 'transparent',
                                        border: `1px solid ${THEME.lime}`,
                                        color: THEME.lime,
                                        fontFamily: 'monospace',
                                        cursor: (text.trim() || pendingAtt) ? 'pointer' : 'not-allowed',
                                        opacity: (text.trim() || pendingAtt) ? 1 : 0.3,
                                    }}
                                >
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