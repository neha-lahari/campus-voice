import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";

export default function ChatWindow({ conversationId, selectedUser }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const bottomRef = useRef(null);
    const currentUserId = localStorage.getItem("userId");

    useEffect(() => {
        if (!conversationId) return;

        socket.emit("joinConversation", { conversationId });

        fetch(`${import.meta.env.VITE_API_URL}/dm/messages/${conversationId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
            .then(res => res.json())
            .then(data => setMessages(Array.isArray(data) ? data : []))
            .catch(err => console.error("History sync failed:", err));

        socket.emit("seenMessages", { conversationId });
    }, [conversationId]);

    useEffect(() => {
        const handler = (msg) => {
            if (String(msg?.conversation) === String(conversationId)) {
                setMessages(prev => [...prev, msg]);
                socket.emit("seenMessages", { conversationId });
            }
        };
        socket.on("newDMMessage", handler);
        return () => socket.off("newDMMessage", handler);
    }, [conversationId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!text.trim()) return;
        socket.emit("dmMessage", { conversationId, text });
        setText("");
    };

    if (!conversationId) {
        return (
            <div className="flex-1 h-full flex flex-col items-center justify-center gap-3 bg-[#060A13]/20">
                <span className="text-4xl">💬</span>
                <p className="text-sm text-slate-500">Select a conversation to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#121824]/40 border border-slate-800 rounded-xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#121824] border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-[#1a2133] border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
                        {(selectedUser?.username || "?").substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-[#E5E9F0]">
                        {selectedUser?.username || "Unknown"}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#A3FF12]" />
                    <span className="text-xs text-slate-500">Online</span>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-[#060A13]/20">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-600 text-sm">
                        <span className="text-3xl">🛸</span>
                        <span>No messages yet. Say hello!</span>
                    </div>
                ) : messages.map((m) => {
                    const isMe = String(m.sender?._id) === String(currentUserId);
                    return (
                        <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                ${isMe
                                    ? "bg-[#121824] border border-cyan-400/30 text-[#E5E9F0] rounded-tr-sm"
                                    : "bg-[#060A13]/80 border border-slate-700 text-[#E5E9F0]/80 rounded-tl-sm"}
              `}>
                                <p className="m-0">{m.text}</p>
                                {isMe && m.seenBy?.length > 1 && (
                                    <span className="block text-right text-[10px] text-cyan-400/50 mt-1">Seen</span>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 px-3 py-3 bg-[#121824] border-t border-slate-800">
                <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#060A13]/50 border border-slate-700 text-[#E5E9F0] text-sm outline-none focus:border-cyan-400/50 placeholder:text-slate-600 transition-colors"
                />
                <button
                    onClick={sendMessage}
                    disabled={!text.trim()}
                    className="px-5 py-2.5 rounded-xl border border-[#A3FF12] text-[#A3FF12] text-sm font-semibold bg-transparent hover:bg-[#A3FF12]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    Send
                </button>
            </div>
        </div>
    );
}