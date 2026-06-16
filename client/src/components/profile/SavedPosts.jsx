import { useEffect, useState } from "react";
import API from "../../utils/api";
import PostCard from "../PostCard";

export default function SavedPosts() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetchSaved();
    }, []);

    const fetchSaved = async () => {
        try {
            const res = await API.get("/profile/me/saved");
            setPosts(res.data.posts);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-4">
            {posts.length === 0 ? (
                <div className="w-full py-12 text-center text-xs uppercase font-['Share_Tech_Mono'] tracking-[2px] border border-dashed border-[#4E5D78]/15 bg-[#121824]/20 text-[#4E5D78]">
                    [ NO ARCHIVED DATA STRINGS FOUND IN SAVED_POSTS ]
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