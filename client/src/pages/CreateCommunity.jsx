import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

const THEME = {
    bgMainStart: '#060A13',      // Deep Void Navy Start
    bgMainEnd: '#0B111E',        // Deep Void Navy End
    bgCard: '#121824',           // Translucent Steel Panel
    accentPrimary: '#A3FF12',    // Neon Lime
    accentSecondary: '#00F0FF',  // Cyber Cyan
    textMain: '#E5E9F0',         // High-Readability Ice Text
    textMuted: '#4E5D78',        // Technical Gridline Gray
};

export default function CreateCommunity() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

        try {
            setLoading(true);

            const res = await API.post("/communities", {
                name,
                slug,
                description
            });

            navigate(`/community/${res.data.community.slug}`);

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to create community");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&family=Rajdhani:wght@500;600&display=swap');
                
                .form-input {
                    transition: all 0.2s ease;
                }
                .form-input:focus {
                    outline: none;
                    border-color: ${THEME.accentSecondary} !important;
                    background: rgba(0, 240, 255, 0.02) !important;
                }
                .submit-btn-panel {
                    transition: all 0.25s ease;
                }
                .submit-btn-panel:hover:not(:disabled) {
                    background: rgba(163, 255, 18, 0.05) !important;
                    box-shadow: 0 0 15px rgba(163, 255, 18, 0.15);
                }
            `}</style>

            <div
                className="min-h-screen w-full flex items-center justify-center px-4 py-12"
                style={{ background: `linear-gradient(to bottom, ${THEME.bgMainStart}, ${THEME.bgMainEnd})` }}
            >
                {/* Main Content Box Frame */}
                <div
                    className="w-full max-w-xl p-6 sm:p-8"
                    style={{
                        background: THEME.bgCard,
                        border: '1px solid rgba(0, 240, 255, 0.12)',
                        clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))',
                        boxShadow: '0 30px 70px rgba(0,0,0,0.6)'
                    }}
                >
                    {/* Header Layout */}
                    <div className="mb-6 pb-4 border-b" style={{ borderColor: 'rgba(78, 93, 120, 0.15)' }}>
                        <h1
                            className="text-xl font-bold tracking-wide mb-1"
                            style={{ fontFamily: "'Orbitron', monospace", color: THEME.textMain }}
                        >
                            Create Community
                        </h1>
                        <p
                            className="text-xs tracking-[1px]"
                            style={{ fontFamily: "'Share Tech Mono', monospace", color: THEME.textMuted }}
                        >
                            Build your own space for discussions
                        </p>
                    </div>

                    {/* Data Form Submission View */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Community Title Field */}
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-[11px] tracking-[1px]" style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(0, 240, 255, 0.5)' }}>
                                <span>Community Name</span>
                                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, rgba(0, 240, 255, 0.15), transparent)` }} />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. DSA Warriors"
                                className="form-input w-full py-2.5 px-4 text-sm rounded-none border text-[#c8d4e6]"
                                style={{
                                    background: 'rgba(6, 10, 19, 0.4)',
                                    borderColor: 'rgba(0, 240, 255, 0.12)',
                                    fontFamily: "'Share Tech Mono', monospace"
                                }}
                                required
                            />
                        </div>

                        {/* Description Context Area */}
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-[11px] tracking-[1px]" style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(0, 240, 255, 0.5)' }}>
                                <span>Description</span>
                                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, rgba(0, 240, 255, 0.15), transparent)` }} />
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is this community about?"
                                rows={4}
                                className="form-input w-full py-2.5 px-4 text-sm rounded-none border text-[#c8d4e6] resize-none leading-relaxed"
                                style={{
                                    background: 'rgba(6, 10, 19, 0.4)',
                                    borderColor: 'rgba(0, 240, 255, 0.12)',
                                    fontFamily: "'Rajdhani', sans-serif"
                                }}
                            />
                        </div>

                        {/* Downsized Control Trigger Action */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="submit-btn-panel w-full sm:w-auto px-4 py-2 text-[11px] font-bold tracking-[1px] uppercase block"
                                style={{
                                    fontFamily: "'Orbitron', monospace",
                                    background: 'transparent',
                                    color: THEME.accentPrimary,
                                    border: `1px solid ${THEME.accentPrimary}`,
                                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                                    cursor: 'pointer'
                                }}
                            >
                                {loading ? "[ Creating... ]" : "[ Create Community ]"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </>
    );
}