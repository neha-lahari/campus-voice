import { useEffect, useState } from "react";
import API from "../../utils/api";

export default function ChatList({ onSelectConversation }) {
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        // ✅ Correct endpoint: /conversations (not /chats)
        API.get("/dm/conversations")
            .then(res => setConversations(res.data))
            .catch(err => console.error("Failed to load conversations:", err));
    }, []);

    return (
        <div className="w-full bg-transparent">
            {conversations.length === 0 ? (
                <div className="py-10 text-center text-xs uppercase tracking-widest font-['Share_Tech_Mono'] text-[#4E5D78]">
                    [ NO ACTIVE CHANNEL PATHS ]
                </div>
            ) : (
                conversations.map((convo) => {
                    // The other participant (not the current user)
                    const currentUserId = localStorage.getItem("userId");
                    const otherUser = convo.participants?.find(
                        (p) => String(p._id) !== String(currentUserId)
                    );

                    const lastMsgText =
                        convo.lastMessage?.text || "CONNECTING TO DATASTREAM...";

                    return (
                        <div
                            key={convo._id}
                            // ✅ Pass BOTH conversationId AND user to parent
                            onClick={() =>
                                onSelectConversation({
                                    conversationId: convo._id,
                                    user: otherUser,
                                })
                            }
                            className="group flex items-center gap-3.5 p-3.5 border-b border-[#4E5D78]/12 hover:bg-[#00F0FF]/[0.02] hover:border-[#00F0FF]/20 transition-all duration-200 cursor-pointer"
                        >
                            {/* AVATAR GLYPH */}
                            <div
                                className="w-10 h-10 flex-shrink-0 flex items-center justify-center font-['Share_Tech_Mono'] text-xs font-bold bg-[#060A13]/60 border border-[#4E5D78]/25 text-[#00F0FF] group-hover:border-[#00F0FF] transition-colors"
                                style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
                            >
                                {otherUser?.username?.substring(0, 2).toUpperCase() || "ID"}
                            </div>

                            {/* TEXT */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <span className="text-sm font-semibold tracking-wide truncate text-[#E5E9F0] font-['Plus_Jakarta_Sans']">
                                        {otherUser?.username || "UNKNOWN"}
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full block flex-shrink-0 bg-[#A3FF12] shadow-[0_0_6px_#A3FF12]" />
                                </div>
                                <p className="text-xs truncate tracking-normal font-['Share_Tech_Mono'] text-[#4E5D78]">
                                    {lastMsgText}
                                </p>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
