export default function UserCard({ user }) {
    if (!user) return null;

    return (
        <div className="p-6 w-full rounded-lg shadow-xl" style={{ background: '#121824', border: '1px solid rgba(0,240,255,0.15)' }}>

            <div className="flex gap-5 items-center flex-wrap sm:flex-nowrap">

                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden" style={{ border: '1px solid rgba(78,93,120,0.3)', background: 'rgba(6,10,19,0.5)' }}>
                    <img
                        src={user.avatar || "https://ui-avatars.com/api/?name=" + user.name + "&background=39ff64&color=020810"}
                        alt=""
                        className="w-full h-full object-cover opacity-90"
                    />
                </div>

                <div>
                    <h2
                        className="text-xl font-bold tracking-wide leading-tight text-[#E5E9F0]"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        {user.name}
                    </h2>

                    <div
                        className="flex items-center gap-1 mt-1.5 text-[11px] tracking-wider"
                        style={{ fontFamily: "'Share Tech Mono', monospace" }}
                    >
                        <span style={{ color: '#4E5D78' }}>JOINED:</span>
                        <span style={{ color: 'rgba(229,233,240,0.6)' }}>
                            {new Date(user.createdAt).toLocaleDateString().toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bio */}
            {user.bio && (
                <p
                    className="mt-4 text-xs leading-relaxed border-t pt-3.5 border-zinc-800/40"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'rgba(229,233,240,0.75)' }}
                >
                    {user.bio}
                </p>
            )}

            {/* posts + comments */}
            <div
                className="mt-5 pt-3 border-t border-zinc-800/60 text-[11px] tracking-widest flex items-center gap-4"
                style={{ fontFamily: "'Share Tech Mono', monospace", color: '#4E5D78' }}
            >
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px]" style={{ color: '#00F0FF' }}>⌸</span>
                    <span>POSTS: <strong className="text-[#E5E9F0]">{user.postsCount || 0}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px]" style={{ color: '#00F0FF' }}>⌿</span>
                    <span>COMMENTS: <strong className="text-[#E5E9F0]">{user.commentsCount || 0}</strong></span>
                </div>
            </div>

        </div>
    );
}