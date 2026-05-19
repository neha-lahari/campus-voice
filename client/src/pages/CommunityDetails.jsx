import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PostCard from "../components/PostCard";

export default function CommunityDetails() {
    const { id } = useParams();
    const [community, setCommunity] = useState(null);
    const [posts, setPosts] = useState([]);

    const fetchCommunity = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/communities/id/${id}`,
                { withCredentials: true }
            );

            setCommunity(res.data.community);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/posts?community=${id}`,
                { withCredentials: true }
            );

            setPosts(res.data.posts);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCommunity();
        fetchPosts();
    }, [id]);

    return (
        <div style={{ background: "#020810", minHeight: "100vh", color: "#39ff64", padding: 20 }}>
            <h2>{community?.name}</h2>
            <p>{community?.description}</p>
            <p>Members: {community?.membersCount}</p>

            <hr />

            {posts.map((p) => (
                <PostCard key={p._id} post={p} />
            ))}
        </div>
    );
}