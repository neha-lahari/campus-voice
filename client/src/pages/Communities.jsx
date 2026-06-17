import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

const THEME = {
    bgMainStart: '#060A13',
    bgMainEnd: '#0B111E',
    bgCard: '#121824',
    accentPrimary: '#A3FF12',
    accentSecondary: '#00F0FF',
    textMain: '#E5E9F0',
    textMuted: '#4E5D78',
};

export default function Communities() {
    const [communities, setCommunities] = useState([]);
    const navigate = useNavigate();

    const fetchCommunities = async () => {
        try {
            const res = await API.get("/communities");
            setCommunities(res.data.communities);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCommunities();
    }, []);

    const toggleJoin = async (e, id) => {
        e.stopPropagation();
        try {
            await API.post(`/communities/${id}/join`);
            fetchCommunities();
        } catch (err) {
            console.error(err);
        }
    };

    const joined = communities.filter(c => c.isJoined);
    const discover = communities.filter(c => !c.isJoined);

    const CommunityCard = ({ c }) => (
        <div
            onClick={() => navigate(`/community/${c.slug}`)}
            className="flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group"
            style={{ background: 'rgba(18,24,36,0.7)', border: '1px solid rgba(0,240,255,0.12)' }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = THEME.accentSecondary;
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0,240,255,0.08)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(0,240,255,0.12)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Community info */}
            <div>
                <p
                    className="font-semibold text-sm tracking-wide group-hover:text-[#00F0FF] transition-colors"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: THEME.textMain }}
                >
                    {c.name}
                </p>
                <p
                    className="text-xs mt-0.5"
                    style={{ fontFamily: "'Inter', sans-serif", color: THEME.textMuted }}
                >
                    {c.memberCount ?? 0} active members
                </p>
            </div>

            {/* Join / Leave button */}
            <button
                onClick={(e) => toggleJoin(e, c._id)}
                className="text-xs font-bold px-4 py-1.5 rounded uppercase tracking-wider transition-all duration-200"
                style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: c.isJoined ? 'transparent' : 'rgba(163,255,18,0.05)',
                    color: c.isJoined ? THEME.textMuted : THEME.accentPrimary,
                    border: c.isJoined ? '1px solid rgba(78,93,120,0.3)' : `1px solid ${THEME.accentPrimary}`,
                }}
                onMouseEnter={e => {
                    if (c.isJoined) {
                        e.currentTarget.style.color = '#f43f5e';
                        e.currentTarget.style.borderColor = '#f43f5e';
                        e.currentTarget.style.background = 'rgba(244,63,94,0.05)';
                    } else {
                        e.currentTarget.style.background = THEME.accentPrimary;
                        e.currentTarget.style.color = '#060A13';
                    }
                }}
                onMouseLeave={e => {
                    if (c.isJoined) {
                        e.currentTarget.style.color = THEME.textMuted; // BUG FIX: was Theme.textMuted
                        e.currentTarget.style.borderColor = 'rgba(78,93,120,0.3)';
                        e.currentTarget.style.background = 'transparent';
                    } else {
                        e.currentTarget.style.background = 'rgba(163,255,18,0.05)';
                        e.currentTarget.style.color = THEME.accentPrimary;
                        e.currentTarget.style.borderColor = THEME.accentPrimary;
                    }
                }}
            >
                {c.isJoined ? "Leave" : "Join"}
            </button>
        </div>
    );

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
                .header-btn:hover {
                    background: #00F0FF !important;
                    box-shadow: 0 0 15px rgba(0,240,255,0.3);
                    color: #060A13 !important;
                }
            `}</style>

            <div
                className="min-h-screen py-8 px-4"
                style={{ background: `linear-gradient(to bottom, ${THEME.bgMainStart}, ${THEME.bgMainEnd})` }}
            >
                <div className="max-w-2xl mx-auto">

                    {/* Header bar */}
                    <div
                        className="flex items-center justify-between mb-7 px-4 py-3 rounded-lg border"
                        style={{ background: 'rgba(18,24,36,0.8)', borderColor: 'rgba(0,240,255,0.15)' }}
                    >
                        <h1
                            className="text-sm font-bold tracking-[2px] uppercase"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: THEME.textMain }}
                        >
                            Communities
                        </h1>
                        <button
                            onClick={() => navigate("/create-community")}
                            className="header-btn px-4 py-1.5 text-xs font-bold tracking-wider uppercase rounded transition-all duration-200"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: THEME.accentPrimary, color: '#060A13' }}
                        >
                            + Create New
                        </button>
                    </div>

                    {/* Sections */}
                    <div className="flex flex-col gap-6">

                        {/* Joined communities */}
                        {joined.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2.5 pl-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                    <h2
                                        className="text-xs font-bold tracking-[1.5px] uppercase"
                                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: THEME.accentSecondary }}
                                    >
                                        My Subscribed Networks
                                    </h2>
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    {joined.map(c => (
                                        <CommunityCard key={c._id} c={c} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Discover communities */}
                        <div>
                            <div className="flex items-center gap-2 mb-2.5 pl-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                                <h2
                                    className="text-xs font-bold tracking-[1.5px] uppercase"
                                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: THEME.textMuted }}
                                >
                                    Explore Channels
                                </h2>
                            </div>

                            {discover.length === 0 ? (
                                <div
                                    className="text-center py-10 rounded-lg border border-dashed"
                                    style={{ background: THEME.bgCard, borderColor: 'rgba(78,93,120,0.2)' }}
                                >
                                    <p
                                        className="text-xs"
                                        style={{ fontFamily: "'Inter', sans-serif", color: THEME.textMuted }}
                                    >
                                        No further alternative networks found.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2.5">
                                    {discover.map(c => (
                                        <CommunityCard key={c._id} c={c} />
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}