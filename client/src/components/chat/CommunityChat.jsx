import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";
import API from "../../utils/api";

//first 2 letters of a senders name
function Avatar({ name }) {
    const initials = (name || "?").substring(0, 2).toUpperCase();
    return (
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-cyan-400 bg-[#1a2133] border border-slate-700">
            {initials}
        </div>
    );
}

export default function CommunityChat({ communityId, userRole }) {
    const [messages, setMessages] = useState([]);
    const [allMessages, setAllMessages] = useState([]);
    const [text, setText] = useState("");
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [pinnedMessages, setPinnedMessages] = useState([]);
    const [pinnedIndex, setPinnedIndex] = useState(0);
    const [pendingAtt, setPendingAtt] = useState(null);

    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);

    const currentUserId = localStorage.getItem("userId");
    const canPin = userRole === "admin" || userRole === "cr";

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
            if (String(msg?.community) !== String(communityId)) return;
            setMessages(prev => [...prev, msg]);
            setAllMessages(prev => [...prev, msg]);
        };

        const onPinned = (msg) => {
            if (String(msg?.community) !== String(communityId)) return;
            const update = prev => prev.map(m => String(m._id) === String(msg._id) ? msg : m);
            setMessages(update);
            setAllMessages(update);
            setPinnedMessages(prev => {
                const without = prev.filter(m => String(m._id) !== String(msg._id));
                return [...without, msg].slice(-3);
            });
        };

        const onUnpinned = (msg) => {
            setPinnedMessages(prev => prev.filter(m => String(m._id) !== String(msg._id)));
            setMessages(prev => prev.map(m =>
                String(m._id) === String(msg._id) ? { ...m, pinned: false } : m
            ));
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

    // Scroll to bottom whenever messages update
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await API.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setPendingAtt({
                url: res.data.url,
                fileType: res.data.type === "image" ? "image" : file.type === "application/pdf" ? "pdf" : "file",
                name: res.data.name,
            });
        } catch (err) {
            console.error("Upload failed:", err.response?.data || err.message);
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const send = () => {
        if (!text.trim() && !pendingAtt) return;
        socket.emit("communityMessage", {
            communityId,
            text: text.trim(),
            attachments: pendingAtt ? [pendingAtt] : [],
        });
        setText("");
        setPendingAtt(null);
    };

    const handlePin = (messageId) => {
        socket.emit("pinMessage", { messageId, communityId });
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query.trim()) { setMessages(allMessages); return; }
        const lower = query.toLowerCase();
        setMessages(
            allMessages.filter(m =>
                m.text?.toLowerCase().includes(lower) ||
                m.sender?.name?.toLowerCase().includes(lower)
            )
        );
    };

    const renderAttachment = (att, index) => {
        if (att.fileType === "image") {
            return (
                <a key={index} href={att.url} target="_blank" rel="noreferrer">
                    <img src={att.url} alt={att.name || "image"}
                        className="max-w-[200px] rounded-lg mt-2 border border-slate-700 block cursor-pointer" />
                </a>
            );
        }
        return (
            <a key={index} href={att.url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs text-cyan-400 border border-cyan-400/20 bg-cyan-400/5 rounded-lg no-underline hover:bg-cyan-400/10 transition-colors">
                📄 {att.name || att.url?.split("/").pop()}
            </a>
        );
    };

    return (
        <div className="flex flex-col h-[600px] bg-[#060A13] overflow-hidden rounded-xl border border-slate-800">

            {/* Pinned message  */}
            {pinnedMessages.length > 0 && (
                <div
                    onClick={() => setPinnedIndex(i => (i + 1) % pinnedMessages.length)}
                    className={`flex items-center gap-3 px-4 py-2.5 bg-yellow-400/5 border-b border-yellow-400/20 ${pinnedMessages.length > 1 ? "cursor-pointer" : ""}`}
                >
                    <span className="text-yellow-400 text-sm flex-shrink-0">📌</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-yellow-400 font-semibold mb-0.5">
                            Pinned {pinnedMessages.length > 1 ? `· ${pinnedIndex + 1}/${pinnedMessages.length}` : ""}
                        </p>
                        <p className="text-[12px] text-[#E5E9F0] truncate">
                            {pinnedMessages[pinnedIndex]?.text ||
                                pinnedMessages[pinnedIndex]?.attachments?.[0]?.name ||
                                "📎 Attachment"}
                        </p>
                    </div>
                    {pinnedMessages.length > 1 && (
                        <span className="text-[10px] text-slate-500 flex-shrink-0">tap to cycle</span>
                    )}
                </div>
            )}

            <div className="flex items-center gap-3 px-4 py-3 bg-[#121824] border-b border-slate-800">
                <span className="w-2 h-2 rounded-full bg-[#A3FF12] flex-shrink-0" />
                <span className="text-[#E5E9F0] font-semibold text-sm flex-1">Community Chat</span>

                {/* Search */}
                <div className="relative">
                    <input
                        value={searchQuery}
                        onChange={e => handleSearch(e.target.value)}
                        placeholder="Search..."
                        className="pl-3 pr-7 py-1.5 text-xs w-36 rounded-lg bg-[#060A13] border border-slate-700 text-[#E5E9F0] outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                    />
                    {searchQuery && (
                        <button onClick={() => handleSearch("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs bg-transparent border-0 cursor-pointer">
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-600 text-sm">
                        <span className="text-3xl">💬</span>
                        <span>{searchQuery ? "No messages found." : "No messages yet. Say hello!"}</span>
                    </div>
                ) : messages.map((m, i) => {
                    const isMe = String(m.sender?._id) === String(currentUserId);
                    const senderName = m.sender?.name || "Unknown";

                    return (
                        <div key={m._id || i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>

                            {m.pinned && (
                                <span className="text-[10px] text-yellow-400 mb-1">📌 Pinned</span>
                            )}

                            <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                {!isMe && <Avatar name={senderName} />}

                                <div className="max-w-[70%]">
                                    {!isMe && (
                                        <p className="text-[11px] text-slate-500 mb-1 font-medium">{senderName}</p>
                                    )}

                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed text-[#E5E9F0]
                    ${isMe
                                            ? "bg-cyan-500/20 border border-cyan-400/30 rounded-tr-sm"
                                            : "bg-[#121824] border border-slate-700 rounded-tl-sm"}
                    ${m.pinned ? "border-yellow-400/40" : ""}
                  `}>
                                        {m.text && <p className="m-0">{m.text}</p>}
                                        {m.attachments?.map((att, ai) => renderAttachment(att, ai))}
                                    </div>

                                    {canPin && !m.pinned && (
                                        <button onClick={() => handlePin(m._id)}
                                            className="mt-1 text-[10px] text-slate-600 hover:text-yellow-400 bg-transparent border-0 cursor-pointer p-0 transition-colors">
                                            📌 Pin
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {pendingAtt && (
                <div className="flex items-center gap-3 px-4 py-2 bg-cyan-400/5 border-t border-slate-800">
                    {pendingAtt.fileType === "image"
                        ? <img src={pendingAtt.url} alt="preview" className="w-10 h-10 object-cover rounded-lg border border-slate-700" />
                        : <span className="text-xl">📄</span>
                    }
                    <span className="flex-1 text-xs text-cyan-400 truncate">{pendingAtt.name}</span>
                    <button onClick={() => setPendingAtt(null)}
                        className="text-slate-500 hover:text-slate-300 bg-transparent border-0 cursor-pointer text-base">✕</button>
                </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-3 bg-[#121824] border-t border-slate-800">
                <input type="file" ref={fileInputRef} className="hidden"
                    accept="image/*,application/pdf" onChange={handleFileSelect} />

                {/* Attach button */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className={`p-2 rounded-lg border text-base transition-colors
            ${pendingAtt ? "border-cyan-400/50 text-cyan-400 bg-cyan-400/10" : "border-slate-700 text-slate-500 hover:text-slate-300"}
            ${uploading ? "opacity-40 cursor-not-allowed" : "cursor-pointer bg-transparent"}
          `}
                >
                    {uploading ? "⏳" : "📎"}
                </button>

                {/* Text input */}
                <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && send()}
                    placeholder={pendingAtt ? "Add a caption..." : "Type a message..."}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#060A13] border border-slate-700 text-[#E5E9F0] text-sm outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                />

                {/* Send button */}
                <button
                    onClick={send}
                    disabled={!text.trim() && !pendingAtt}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold border border-[#A3FF12] text-[#A3FF12] transition-opacity
            ${(text.trim() || pendingAtt) ? "opacity-100 cursor-pointer hover:bg-[#a3ff12]/10" : "opacity-30 cursor-not-allowed"}
          `}
                >
                    Send
                </button>
            </div>
        </div>
    );
}