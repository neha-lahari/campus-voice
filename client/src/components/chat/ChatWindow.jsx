import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";

export default function ChatWindow({ conversationId, selectedUser }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const bottomRef = useRef(null);
    const currentUserId = localStorage.getItem("userId");

    // LOAD HISTORY + JOIN ROOM
    useEffect(() => {
        if (!conversationId) return;

        // ✅ Tell server to add this socket to the DM room
        socket.emit("joinConversation", { conversationId });

        fetch(`http://localhost:5000/api/dm/messages/${conversationId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then(res => res.json())
            .then(data => {
                setMessages(Array.isArray(data) ? data : []);
            })
            .catch(err => console.error("History sync failed:", err));

        // ✅ Mark messages as seen when you open the conversation
        socket.emit("seenMessages", { conversationId });

    }, [conversationId]);

    // SOCKET LISTENER
    useEffect(() => {
        const handler = (msg) => {
            // ✅ Only add message if it belongs to THIS conversation
            if (String(msg?.conversation) === String(conversationId)) {
                setMessages(prev => [...prev, msg]);

                // Mark seen immediately
                socket.emit("seenMessages", { conversationId });
            }
        };

        socket.on("newDMMessage", handler);
        return () => socket.off("newDMMessage", handler);
    }, [conversationId]);

    // AUTO-SCROLL on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!text.trim()) return;

        socket.emit("dmMessage", {
            conversationId,
            text,
        });

        setText("");
    };

    if (!conversationId) {
        return (
            <div className="flex-1 h-full flex items-center justify-center bg-[#060A13]/20">
                <p className="font-['Share_Tech_Mono'] text-xs text-[#4E5D78] tracking-widest uppercase">
                    [ SELECT A CHANNEL TO BEGIN ]
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#121824]/40 border border-[#4E5D78]/10">

            {/* HEADER */}
            <div className="flex items-center justify-between p-4 bg-[#121824] border-b border-[#4E5D78]/15">
                <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#A3FF12] animate-pulse" />
                    <span className="font-['Orbitron'] text-xs font-bold tracking-[2px] text-[#E5E9F0] uppercase">
                        {selectedUser?.username || "NULL_NODE"}
                    </span>
                </div>
                <span className="font-['Share_Tech_Mono'] text-[10px] text-[#4E5D78] uppercase tracking-wider">
                    COMMS_LINK // ACTIVE
                </span>
            </div>

            {/* MESSAGES FEED */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#060A13]/20">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center font-['Share_Tech_Mono'] text-xs text-[#4E5D78] tracking-widest uppercase">
                        [ NO TRANSMISSION HISTORY RECOVERED ]
                    </div>
                ) : (
                    messages.map((m) => {
                        const isMe = String(m.sender?._id) === String(currentUserId);
                        return (
                            <div
                                key={m._id}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[75%] px-4 py-2.5 text-xs font-medium relative transition-all duration-200 ${isMe
                                        ? "bg-[#121824] border border-[#00F0FF]/30 text-[#E5E9F0]"
                                        : "bg-[#060A13]/80 border border-[#4E5D78]/20 text-[#E5E9F0]/80"
                                        }`}
                                    style={{
                                        clipPath: isMe
                                            ? 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'
                                            : 'polygon(0 8px, 8px 0, 100% 0, 100% 100%, 0 100%)'
                                    }}
                                >
                                    <p className="leading-relaxed font-['Plus_Jakarta_Sans']">{m.text}</p>

                                    {/* SEEN INDICATOR (your messages only) */}
                                    {isMe && m.seenBy?.length > 1 && (
                                        <span className="block text-right font-['Share_Tech_Mono'] text-[9px] text-[#00F0FF]/60 mt-1 tracking-wider">
                                            SEEN
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div className="p-3 bg-[#121824] border-t border-[#4E5D78]/15 flex gap-2.5">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type encrypted packet payload..."
                    className="flex-1 px-4 py-2.5 bg-[#060A13]/50 border border-[#4E5D78]/20 text-[#E5E9F0] text-xs focus:outline-none focus:border-[#00F0FF] focus:bg-[#00F0FF]/5 transition-all placeholder-zinc-600 font-medium"
                />
                <button
                    onClick={sendMessage}
                    disabled={!text.trim()}
                    className="px-5 font-['Share_Tech_Mono'] text-xs font-bold tracking-widest uppercase bg-transparent border border-[#A3FF12] text-[#A3FF12] hover:bg-[#A3FF12]/10 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}
                >
                    SEND
                </button>
            </div>

        </div>
    );
}
