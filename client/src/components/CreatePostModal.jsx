import { useState } from "react";
import api from "../utils/api";

const FLAIRS = ["Doubt", "Resource", "Announcement", "Meme", "News"];

const THEME = {
    bgCard: "#121824",
    textMain: "#E5E9F0",
    textMuted: "#4E5D78",
    accent: "#00F0FF",
};

const inputClass = "w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:border-[#00F0FF] focus:bg-[#00F0FF]/5 placeholder-[#4E5D78]";
const inputStyle = { background: "rgba(6,10,19,0.4)", border: "1px solid rgba(78,93,120,0.2)", color: THEME.textMain };

export default function CreatePostModal({ communityId, onClose, onPostCreated }) {
    const [flair, setFlair] = useState("");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [link, setLink] = useState("");
    const [files, setFiles] = useState([]);
    const [anonymous, setAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || loading) return;

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("title", title);
            formData.append("body", body);
            formData.append("community", communityId);
            formData.append("flair", flair);
            formData.append("link", link);
            formData.append("isAnonymous", anonymous);
            files.forEach((file) => formData.append("file", file));

            const res = await api.post("/posts", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            onPostCreated?.(res.data.post);
            onClose();
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.message || "Failed to create post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-lg p-7 max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl"
                style={{ background: THEME.bgCard, border: "1px solid rgba(0,240,255,0.15)" }}
            >
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-zinc-800/60">
                    <h2
                        className="text-sm font-bold tracking-[3px] uppercase"
                        style={{ fontFamily: "'Orbitron', monospace", color: THEME.textMain }}
                    >
                        CREATE NEW POST
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-sm hover:text-[#00F0FF] transition-colors"
                        style={{ color: THEME.textMuted, fontFamily: "monospace" }}
                    >
                        ✕
                    </button>
                </div>

                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Post title *"
                    required
                    className={`${inputClass} mb-3.5`}
                    style={inputStyle}
                />

                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Body (optional)"
                    rows={5}
                    className={`${inputClass} mb-3.5 resize-none`}
                    style={inputStyle}
                />

                <input
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="URL (optional)"
                    className={`${inputClass} mb-4`}
                    style={inputStyle}
                />

                {/* File upload */}
                <div
                    className="mb-5 p-3.5 rounded-lg border border-dashed"
                    style={{ background: "rgba(6,10,19,0.2)", borderColor: "rgba(78,93,120,0.3)" }}
                >
                    <label
                        className="block text-[11px] mb-2"
                        style={{ fontFamily: "'Share Tech Mono', monospace", color: THEME.textMuted }}
                    >
                        ATTACH FILE (IMAGE / PDF)
                    </label>
                    <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => setFiles(Array.from(e.target.files))}
                        className="text-xs text-[#E5E9F0]"
                    />
                </div>

                <p
                    className="text-[11px] mb-2"
                    style={{ fontFamily: "'Share Tech Mono', monospace", color: THEME.textMuted }}
                >
                    ASSIGN FLAIR:
                </p>
                <div className="flex gap-2 flex-wrap mb-5">
                    {FLAIRS.map((f) => {
                        const isSelected = flair === f;
                        return (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setFlair(isSelected ? "" : f)}
                                className={`px-3 py-1 font-mono text-[11px] tracking-wider border rounded transition-all uppercase cursor-pointer ${isSelected
                                        ? "border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/5"
                                        : "border-[#4E5D78]/30 text-[#4E5D78] hover:bg-[#00F0FF]/5 hover:border-[#00F0FF]/40 hover:text-[#00F0FF]"
                                    }`}
                            >
                                {f}
                            </button>
                        );
                    })}
                </div>

                <label className="flex items-center gap-2 mb-6 text-xs text-[#E5E9F0] cursor-pointer">
                    <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={(e) => setAnonymous(e.target.checked)}
                        className="accent-[#A3FF12]"
                    />
                    Post anonymously
                </label>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || !title.trim()}
                    className="w-full py-3 rounded-lg text-xs font-bold uppercase tracking-[3px] border border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF]/10 disabled:opacity-40 transition-all duration-200"
                    style={{ fontFamily: "'Orbitron', monospace" }}
                >
                    {loading ? "[ POSTING... ]" : "[ POST ]"}
                </button>
            </form>
        </div>
    );
}