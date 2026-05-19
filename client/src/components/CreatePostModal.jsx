import { useState } from "react";
import { createPost } from "../api/postApi";

export default function CreatePostModal({ onClose, onPostCreated }) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [communityId, setCommunityId] = useState("");
    const [loading, setLoading] = useState(false);

    const TITLE_MAX = 80;
    const BODY_MAX = 500;

    const handleSubmit = async () => {
        if (!title.trim() || !body.trim() || !communityId.trim()) return;
        setLoading(true);
        try {
            const res = await createPost({ title, body, communityId });
            onPostCreated(res.data.post);
            onClose();
        } catch (err) {
            console.error("Failed to create post", err);
        } finally {
            setLoading(false);
        }
    };

    const sharedInputStyle = {
        flex: 1,
        background: "rgba(57,255,100,0.025)",
        border: "1px solid rgba(57,255,100,0.1)",
        borderLeft: "none",
        outline: "none",
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 13,
        color: "#c8e6c9",
        letterSpacing: "0.5px",
        padding: "11px 14px",
        transition: "all 0.25s",
    };

    const Field = ({ num, label, children, count, max }) => (
        <div className="flex flex-col gap-[7px]">
            <div
                className="flex items-center gap-2 text-[10px] tracking-[2px]"
                style={{ fontFamily: "'Share Tech Mono', monospace", color: "rgba(57,255,100,0.5)" }}
            >
                <span style={{ color: "rgba(0,200,255,0.45)", fontSize: 9 }}>{num}</span>
                {label}
                <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(57,255,100,0.15), transparent)" }} />
            </div>
            <div className="flex">
                <div className="w-[3px] flex-shrink-0" style={{ background: "linear-gradient(to bottom, rgba(57,255,100,0.25), transparent)" }} />
                {children}
            </div>
            {max && (
                <div className="flex justify-end">
                    <span
                        className="text-[10px] tracking-wider"
                        style={{
                            fontFamily: "'Share Tech Mono', monospace",
                            color: count > max * 0.85 ? "rgba(255,80,80,0.6)" : "rgba(57,255,100,0.2)",
                        }}
                    >{count}/{max}</span>
                </div>
            )}
        </div>
    );

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@300;500;600&display=swap');`}</style>

            {/* Overlay */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-6"
                style={{ background: "rgba(2,8,16,0.92)" }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                {/* Scanlines */}
                <div
                    className="fixed inset-0 pointer-events-none"
                    style={{ background: "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)" }}
                />

                {/* Modal */}
                <div
                    className="relative w-full max-w-[480px]"
                    style={{
                        background: "linear-gradient(145deg, rgba(2,15,28,0.98), rgba(1,10,18,0.99))",
                        border: "1px solid rgba(57,255,100,0.22)",
                        clipPath: "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px))",
                        boxShadow: "0 0 60px rgba(57,255,100,0.07), 0 30px 80px rgba(0,0,0,0.8)",
                    }}
                >
                    {/* Corner accents */}
                    <div className="absolute top-[-1px] left-[-1px] w-[18px] h-[18px] border-t-2 border-l-2 border-[#39ff64]" />
                    <div className="absolute bottom-[-1px] right-[-1px] w-[18px] h-[18px] border-b-2 border-r-2 border-[#39ff64]" />

                    {/* Left bar */}
                    <div className="absolute top-0 left-0 w-[3px] h-full opacity-60"
                        style={{ background: "linear-gradient(to bottom, #39ff64, rgba(57,255,100,0.1))" }} />

                    {/* HEADER */}
                    <div
                        className="flex items-start justify-between px-7 pt-6 pb-5 relative"
                        style={{ borderBottom: "1px solid rgba(57,255,100,0.1)" }}
                    >
                        <div className="absolute bottom-[-1px] left-7 w-[60px] h-[1px]"
                            style={{ background: "#39ff64", boxShadow: "0 0 8px rgba(57,255,100,0.8)" }} />

                        <div className="flex flex-col gap-[3px]">
                            <span className="text-[10px] tracking-[3px]"
                                style={{ fontFamily: "'Share Tech Mono', monospace", color: "rgba(57,255,100,0.35)" }}>
                                SYS://CAMPUS/CREATE.EXE
                            </span>
                            <h2 className="text-[17px] font-black tracking-[1.5px]"
                                style={{ fontFamily: "'Orbitron', monospace", color: "#e0ffe8", textShadow: "0 0 18px rgba(57,255,100,0.25)" }}>
                                NEW BROADCAST
                            </h2>
                            <span className="text-[10px] tracking-[2px]"
                                style={{ fontFamily: "'Share Tech Mono', monospace", color: "rgba(57,255,100,0.25)" }}>
                                TRANSMIT TO NETWORK
                            </span>
                        </div>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="w-[30px] h-[30px] flex items-center justify-center text-sm flex-shrink-0 transition-all duration-200"
                            style={{
                                fontFamily: "'Share Tech Mono', monospace",
                                color: "rgba(57,255,100,0.4)",
                                background: "transparent",
                                border: "1px solid rgba(57,255,100,0.2)",
                                clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#39ff64"; e.currentTarget.style.borderColor = "rgba(57,255,100,0.6)"; e.currentTarget.style.background = "rgba(57,255,100,0.06)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(57,255,100,0.4)"; e.currentTarget.style.borderColor = "rgba(57,255,100,0.2)"; e.currentTarget.style.background = "transparent"; }}
                        >✕</button>
                    </div>

                    {/* BODY */}
                    <div className="px-7 py-6 flex flex-col gap-5">

                        <Field num="01" label="TRANSMISSION TITLE" count={title.length} max={TITLE_MAX}>
                            <input
                                maxLength={TITLE_MAX}
                                placeholder="ENTER_TITLE_HERE"
                                onChange={(e) => setTitle(e.target.value)}
                                style={sharedInputStyle}
                                onFocus={(e) => { e.target.style.borderColor = "rgba(57,255,100,0.38)"; e.target.style.background = "rgba(57,255,100,0.045)"; e.target.style.color = "#e8ffe8"; }}
                                onBlur={(e) => { e.target.style.borderColor = "rgba(57,255,100,0.1)"; e.target.style.background = "rgba(57,255,100,0.025)"; e.target.style.color = "#c8e6c9"; }}
                            />
                        </Field>

                        <Field num="02" label="MESSAGE BODY" count={body.length} max={BODY_MAX}>
                            <textarea
                                maxLength={BODY_MAX}
                                placeholder="WRITE YOUR TRANSMISSION..."
                                onChange={(e) => setBody(e.target.value)}
                                style={{ ...sharedInputStyle, resize: "none", height: 110, lineHeight: 1.6 }}
                                onFocus={(e) => { e.target.style.borderColor = "rgba(57,255,100,0.38)"; e.target.style.background = "rgba(57,255,100,0.045)"; e.target.style.color = "#e8ffe8"; }}
                                onBlur={(e) => { e.target.style.borderColor = "rgba(57,255,100,0.1)"; e.target.style.background = "rgba(57,255,100,0.025)"; e.target.style.color = "#c8e6c9"; }}
                            />
                        </Field>

                        <Field num="03" label="TARGET COMMUNITY">
                            <input
                                placeholder="COMMUNITY_ID"
                                onChange={(e) => setCommunityId(e.target.value)}
                                style={sharedInputStyle}
                                onFocus={(e) => { e.target.style.borderColor = "rgba(57,255,100,0.38)"; e.target.style.background = "rgba(57,255,100,0.045)"; e.target.style.color = "#e8ffe8"; }}
                                onBlur={(e) => { e.target.style.borderColor = "rgba(57,255,100,0.1)"; e.target.style.background = "rgba(57,255,100,0.025)"; e.target.style.color = "#c8e6c9"; }}
                            />
                        </Field>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center justify-end gap-3 px-7 pb-6">
                        <button
                            onClick={onClose}
                            className="px-5 py-[9px] text-[11px] tracking-[2px] transition-all duration-200"
                            style={{
                                fontFamily: "'Share Tech Mono', monospace",
                                color: "rgba(57,255,100,0.35)",
                                background: "transparent",
                                border: "1px solid rgba(57,255,100,0.15)",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(57,255,100,0.7)"; e.currentTarget.style.borderColor = "rgba(57,255,100,0.35)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(57,255,100,0.35)"; e.currentTarget.style.borderColor = "rgba(57,255,100,0.15)"; }}
                        >ABORT</button>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !title.trim() || !body.trim() || !communityId.trim()}
                            className="relative px-7 py-[10px] text-[10px] font-bold tracking-[3px] overflow-hidden transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group"
                            style={{
                                fontFamily: "'Orbitron', monospace",
                                color: "#39ff64",
                                background: "transparent",
                                border: "1px solid rgba(57,255,100,0.5)",
                                clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                                textShadow: "0 0 10px rgba(57,255,100,0.6)",
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.color = "#020810";
                                    e.currentTarget.style.textShadow = "none";
                                    e.currentTarget.querySelector(".btn-bg").style.transform = "translateX(0)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = "#39ff64";
                                e.currentTarget.style.textShadow = "0 0 10px rgba(57,255,100,0.6)";
                                e.currentTarget.querySelector(".btn-bg").style.transform = "translateX(-105%)";
                            }}
                        >
                            <span
                                className="btn-bg absolute inset-0 bg-[#39ff64] transition-transform duration-300 z-0"
                                style={{ transform: "translateX(-105%)" }}
                            />
                            <span className="relative z-10">
                                {loading ? "TRANSMITTING..." : "[ TRANSMIT ]"}
                            </span>
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}