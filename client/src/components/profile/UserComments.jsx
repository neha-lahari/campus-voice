export default function UserComments({ comments }) {
    return (
        <div className="space-y-3.5">
            {comments.length === 0 ? (
                <div className="w-full py-12 text-center text-xs uppercase font-['Share_Tech_Mono'] tracking-[2px] border border-dashed border-[#4E5D78]/15 bg-[#121824]/20 text-[#4E5D78]">
                    [ NO COMMENTS ]
                </div>
            ) : (
                comments.map(comment => (
                    <div
                        key={comment._id}
                        className="p-4 bg-[#121824] border border-[#00F0FF]/10 hover:border-[#00F0FF]/25 hover:shadow-[0_0_20px_rgba(0,240,255,0.03)] transition-all duration-200"
                        style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
                    >
                        <p className="text-xs leading-relaxed font-['Plus_Jakarta_Sans'] text-[#E5E9F0]/85">
                            {comment.body}
                        </p>

                        <div className="text-[11px] mt-3 pt-2.5 border-t border-zinc-800/40 flex items-center gap-1.5 tracking-wide font-['Share_Tech_Mono'] text-[#4E5D78]">
                            <span className="text-[#00F0FF]">↳</span>
                            <span>TARGET POST:</span>
                            <span className="font-semibold text-[#E5E9F0] truncate max-w-xs md:max-w-md">
                                "{comment.post?.title}"
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}