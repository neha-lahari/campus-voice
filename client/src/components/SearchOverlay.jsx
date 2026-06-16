import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SearchOverlay({ onClose }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const inputRef = useRef();
    const navigate = useNavigate();

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults(null);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/search?q=${query}`,
                    { withCredentials: true }
                );
                setResults(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const go = (path) => {
        onClose();
        navigate(path);
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#060A13]/90 backdrop-blur-md flex flex-col items-center pt-24 px-4 font-sans selection:bg-[#A3FF12]/30 selection:text-white">
            <div className="w-full max-w-xl">

                {/* INPUT CONTAINER MODULE */}
                <div
                    className="flex items-center gap-3 border border-[#00F0FF]/20 bg-[#121824]/90 px-4 py-3 mb-5 transition-all duration-300 focus-within:border-[#00F0FF] focus-within:shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                >
                    <span className="text-sm text-[#00F0FF]">🔍</span>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search posts, communities, users..."
                        className="flex-1 bg-transparent outline-none text-sm text-[#E5E9F0] placeholder-[#4E5D78]/60 font-medium tracking-wide"
                    />
                    <button
                        onClick={onClose}
                        className="text-xs font-semibold text-[#4E5D78] hover:text-rose-500 transition-colors uppercase tracking-wider pl-2"
                    >
                        Close
                    </button>
                </div>

                {/* LOADING / SEARCHING STATUS */}
                {loading && (
                    <div className="flex items-center justify-center gap-2 py-4">
                        <span className="w-1.5 h-1.5 bg-[#00F0FF] animate-ping rounded-full" />
                        <p className="text-xs font-medium text-[#4E5D78] tracking-wide">Searching...</p>
                    </div>
                )}

                {/* SEARCH RESULTS MATRIX */}
                {results && !loading && (
                    <div
                        className="border border-[#4E5D78]/20 bg-[#121824]/45 overflow-hidden flex flex-col"
                        style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
                    >
                        {/* POSTS */}
                        {results.posts?.length > 0 && (
                            <Section title="Posts">
                                {results.posts.map(p => (
                                    <ResultRow
                                        key={p._id}
                                        primary={p.title}
                                        secondary={p.flair || "post"}
                                        onClick={() => go(`/post/${p._id}`)}
                                    />
                                ))}
                            </Section>
                        )}

                        {/* USERS */}
                        {results.users?.length > 0 && (
                            <Section title="Users">
                                {results.users.map(u => (
                                    <ResultRow
                                        key={u._id}
                                        primary={u.name}
                                        secondary={u.rollNumber || "user"}
                                        onClick={() => go(`/profile/${u._id}`)}
                                    />
                                ))}
                            </Section>
                        )}

                        {/* COMMUNITIES */}
                        {results.communities?.length > 0 && (
                            <Section title="Communities">
                                {results.communities.map(c => (
                                    <ResultRow
                                        key={c._id}
                                        primary={c.name}
                                        secondary="community"
                                        onClick={() => go(`/community/${c.slug}`)}
                                    />
                                ))}
                            </Section>
                        )}

                        {/* EMPTY STATE */}
                        {!results.posts?.length &&
                            !results.users?.length &&
                            !results.communities?.length && (
                                <div className="text-center py-8">
                                    <p className="text-xs font-medium text-[#4E5D78]">
                                        No results found.
                                    </p>
                                </div>
                            )}
                    </div>
                )}
            </div>
        </div>
    );
}

// STRUCTURAL CONTAINER FOR SECTIONS
const Section = ({ title, children }) => (
    <div className="border-b border-[#4E5D78]/10 last:border-0">
        <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#00F0FF]">
                {title}
            </p>
        </div>
        <div className="flex flex-col p-1.5 gap-0.5">{children}</div>
    </div>
);

// STRUCTURAL CONTENT ROW Indices
const ResultRow = ({ primary, secondary, onClick }) => (
    <div
        onClick={onClick}
        className="flex items-center justify-between px-3 py-2 border-l-2 border-transparent hover:border-[#A3FF12] hover:bg-[#A3FF12]/5 transition-all duration-150 cubic-bezier(0.4, 0, 0.2, 1) cursor-pointer group rounded-sm"
    >
        <p className="text-xs font-medium text-[#E5E9F0] group-hover:text-white transition-colors">
            {primary}
        </p>
        <p className="text-xs font-medium text-[#4E5D78]">
            {secondary}
        </p>
    </div>
);