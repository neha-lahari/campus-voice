import PostCard from "../PostCard";

export default function UserPosts({ posts }) {
    return (
        <div className="space-y-4">
            {posts.length === 0 ? (
                <div className="w-full py-12 text-center text-xs uppercase font-['Share_Tech_Mono'] tracking-[2px] border border-dashed border-[#4E5D78]/15 bg-[#121824]/20 text-[#4E5D78]">
                    [ NO TRANSMISSIONS LOGGED IN THIS DIRECTORY ]
                </div>
            ) : (
                posts.map(post => (
                    <PostCard
                        key={post._id}
                        post={post}
                    />
                ))
            )}
        </div>
    );
}