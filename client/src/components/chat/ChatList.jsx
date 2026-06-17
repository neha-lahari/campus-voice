import { useEffect, useState } from "react";
import API from "../../utils/api";

export default function ChatList({ onSelectConversation }) {
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        API.get("/dm/conversations")
            .then(res => setConversations(res.data))
            .catch(err => console.error("Failed to load conversations:", err));
    }, []);

    const currentUserId = localStorage.getItem("userId");

    return (
        <div className="w-full bg-transparent">
            {conversations.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-2 text-slate-600 text-sm">
                    <span className="text-3xl">📭</span>
                    <span>No conversations yet</span>
                </div>
            ) : conversations.map((convo) => {
                // Find the other person
                const otherUser = convo.participants?.find(
                    p => String(p._id) !== String(currentUserId)
                );
                const lastMsg = convo.lastMessage?.text || "No messages yet";

                return (
                    <div
                        key={convo._id}
                        onClick={() => onSelectConversation({ conversationId: convo._id, user: otherUser })}
                        className="flex items-center gap-3.5 px-4 py-3.5 border-b border-slate-800 hover:bg-cyan-400/[0.03] hover:border-slate-700 transition-colors cursor-pointer group"
                    >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-[#1a2133] border border-slate-700 text-cyan-400 group-hover:border-cyan-400/50 transition-colors">
                            {(otherUser?.username || "?").substring(0, 2).toUpperCase()}
                        </div>

                        {/* last message */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="text-sm font-semibold text-[#E5E9F0] truncate">
                                    {otherUser?.username || "Unknown"}
                                </span>
                                <span className="w-2 h-2 rounded-full bg-[#A3FF12] flex-shrink-0" />
                            </div>
                            <p className="text-xs text-slate-500 truncate">{lastMsg}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}