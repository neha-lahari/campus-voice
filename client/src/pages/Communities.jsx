import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Communities() {
    const [communities, setCommunities] = useState([]);
    const navigate = useNavigate();

    const fetchCommunities = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/communities", {
                withCredentials: true
            });

            setCommunities(res.data.communities);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCommunities();
    }, []);

    const toggleJoin = async (id) => {
        try {
            await axios.post(
                `http://localhost:5000/api/communities/${id}/join`,
                {},
                { withCredentials: true }
            );

            fetchCommunities(); // refresh
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: 20, background: "#020810", minHeight: "100vh", color: "#39ff64" }}>
            <h2>Communities</h2>

            {communities.map((c) => (
                <div
                    key={c._id}
                    style={{
                        border: "1px solid #39ff64",
                        padding: 10,
                        marginTop: 10,
                        cursor: "pointer"
                    }}
                >
                    <div onClick={() => navigate(`/community/${c._id}`)}>
                        <h3>{c.name}</h3>
                        <p>{c.description}</p>
                        <small>{c.members?.length || 0} members</small>
                    </div>

                    <button
                        onClick={() => toggleJoin(c._id)}
                        style={{ marginTop: 10 }}
                    >
                        Join / Leave
                    </button>
                </div>
            ))}
        </div>
    );
}