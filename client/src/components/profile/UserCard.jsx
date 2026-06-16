export default function UserCard({ user }) {
    if (!user) return null;

    return (
        <div
            className="p-6 w-full bg-[#121824] border border-[#00F0FF]/15 shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
            style={{ clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))' }}
        >
            {/* PROFILE AVATAR & HEADER META BLOCK */}
            <div className="flex gap-5 items-center flex-wrap sm:flex-nowrap">

                {/* AVATAR CONTAINER */}
                <div
                    className="w-20 h-20 flex-shrink-0 p-1 border border-[#4E5D78]/30 bg-[#060A13]/50"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
                >
                    <img
                        src={user.avatar || "https://via.placeholder.com/100"}
                        alt=""
                        className="w-full h-full object-cover opacity-90"
                        style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                    />
                </div>

                <div>
                    <h2 className="text-xl font-bold tracking-wide leading-tight font-['Plus_Jakarta_Sans'] text-[#E5E9F0]">
                        {user.name}
                    </h2>

                    <div className="flex flex-col gap-0.5 mt-1.5 text-[11px] tracking-wider font-medium font-['Share_Tech_Mono']">
                        <div className="flex items-center gap-1">
                            <span className="text-[#4E5D78]">KARMA_SCORE:</span>
                            <span className="text-[#A3FF12]">{user.karma || 0}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <span className="text-[#4E5D78]">SYS_REGISTRY:</span>
                            <span className="text-[#E5E9F0]/60">
                                {new Date(user.createdAt).toLocaleDateString().toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* USER BIO STRING */}
            {user.bio && (
                <p className="mt-4 text-xs leading-relaxed border-t border-zinc-800/40 pt-3.5 font-['Plus_Jakarta_Sans'] text-[#E5E9F0]/75">
                    {user.bio}
                </p>
            )}

            {/* EARNED SYSTEM BADGES ARRAY */}
            {user.badges && user.badges.length > 0 && (/////removee thiss shittttttttttttt
                <div className="mt-4 flex flex-wrap gap-1.5">
                    {user.badges.map((badge, index) => (
                        <span
                            key={index}
                            className="px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-bold font-['Share_Tech_Mono'] bg-[#00F0FF]/[0.03] border border-[#00F0FF]/20 text-[#00F0FF]"
                        >
                            [{badge}]
                        </span>
                    ))}
                </div>
            )}

            {/* FOOTER DIRECTORY AGGREGATES */}
            <div className="mt-5 pt-3 border-t border-zinc-800/60 text-[11px] tracking-widest flex items-center gap-4 font-['Share_Tech_Mono'] text-[#4E5D78]">
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-[#00F0FF]">⌸</span>
                    <span>POSTS: <strong className="text-[#E5E9F0]">{user.postsCount || 0}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-[#00F0FF]">⌿</span>
                    <span>COMMENTS: <strong className="text-[#E5E9F0]">{user.commentsCount || 0}</strong></span>
                </div>
            </div>
        </div>
    );
}