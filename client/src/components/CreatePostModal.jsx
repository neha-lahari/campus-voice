import { useState } from "react";
import api from "../utils/api";

const FLAIRS = ["Doubt", "Resource", "Announcement", "Meme", "News"];

const flairStyles = {
    Doubt: 'border-red-500/30 text-red-400 hover:bg-red-500/10',
    Resource: 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10',
    Announcement: 'border-lime-500/30 text-lime-400 hover:bg-lime-500/10',
    Meme: 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10',
    News: 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10',
};

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
        if (!title.trim() || loading) return;//this prevents clicking create 4 times so that the post wont get duplicted

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
                className="w-full max-w-lg p-7 max-h-[90vh] overflow-y-auto bg-[#121824] border border-[#00F0FF]/15 shadow-2xl relative"
                style={{ clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))' }}
            >
                {/* HEADER */}
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-zinc-800/60">
                    <h2 className="text-sm font-bold tracking-[3px] uppercase font-['Orbitron'] text-[#E5E9F0]">
                        CREATE NEW POST
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-transparent border-none font-mono text-sm cursor-pointer text-[#4E5D78] hover:text-[#00F0FF] transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* FORM FIELDS */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ENTER CONTAINER TITLE *"
                    required
                    className="w-full px-4 py-2.5 mb-3.5 bg-[#060A13]/40 border border-[#4E5D78]/20 text-[#E5E9F0] text-sm focus:outline-none focus:border-[#00F0FF] focus:bg-[#00F0FF]/5 transition-all placeholder-zinc-600 font-medium"
                />

                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="BODY"
                    rows={5}
                    className="w-full px-4 py-2.5 mb-3.5 bg-[#060A13]/40 border border-[#4E5D78]/20 text-[#E5E9F0] text-sm focus:outline-none focus:border-[#00F0FF] focus:bg-[#00F0FF]/5 transition-all placeholder-zinc-600 resize-none font-medium"
                />

                <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="(URL)"
                    className="w-full px-4 py-2.5 mb-4 bg-[#060A13]/40 border border-[#4E5D78]/20 text-[#E5E9F0] text-sm focus:outline-none focus:border-[#00F0FF] focus:bg-[#00F0FF]/5 transition-all placeholder-zinc-600 font-medium"
                />

                {/* FILE ATTACHMENT */}
                <div className="mb-5 p-3.5 border border-dashed border-zinc-800 bg-[#060A13]/20">
                    <label className="block text-[11px] tracking-wider mb-2 font-['Share_Tech_Mono'] text-[#4E5D78]">
                        ATTACH REGISTRY MEDIA (IMAGES / PDF)
                    </label>
                    <input
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        onChange={(e) => setFiles(Array.from(e.target.files))}
                        className="text-xs font-mono text-[#E5E9F0]"
                    />
                </div>

                {/* FLAIRS */}
                <div className="block text-[11px] tracking-wider mb-2 font-['Share_Tech_Mono'] text-[#4E5D78]">
                    ASSIGN CLASSIFICATION TAG:
                </div>
                <div className="flex gap-2 flex-wrap mb-5">
                    {FLAIRS.map((f) => {
                        const isSelected = flair === f;
                        return (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setFlair(isSelected ? "" : f)}
                                className={`px-3 py-1 font-mono text-[11px] tracking-wider border transition-all uppercase bg-transparent cursor-pointer ${isSelected
                                    ? 'bg-[#00F0FF]/5 border-[#00F0FF] text-[#00F0FF]'
                                    : `${flairStyles[f] || 'border-zinc-800'} text-[#4E5D78]`
                                    }`}
                            >
                                {f}
                            </button>
                        );
                    })}
                </div>

                {/* ANONYMOUS TOGGLE */}
                <label className="flex items-center gap-2.5 mb-6 text-xs cursor-pointer select-none tracking-wide text-[#E5E9F0]">
                    <input
                        type="checkbox"
                        checked={anonymous}
                        onChange={(e) => setAnonymous(e.target.checked)}
                        className="w-3.5 h-3.5 border border-[#4E5D78]/40 bg-transparent rounded-none appearance-none checked:bg-[#A3FF12]/10 checked:border-[#A3FF12] text-center checked:after:content-['■'] checked:after:text-[8px] checked:after:text-[#A3FF12] flex items-center justify-center transition-all"
                    />
                    <span>Post transmission anonymously</span>
                </label>

                {/* SUBMIT BUTTON */}
                <button
                    type="submit"
                    disabled={loading || !title.trim()}
                    className="w-full py-3 text-xs font-bold tracking-[3px] uppercase border border-[#A3FF12] text-[#A3FF12] bg-transparent hover:bg-[#A3FF12]/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all font-['Orbitron'] cursor-pointer"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%)' }}
                >
                    {loading ? "[ TRANSMITTING... ]" : "[ POST ]"}
                </button>
            </form>
        </div>
    );
}