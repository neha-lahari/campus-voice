import { useEffect, useRef, useState } from "react";
import API from "../../utils/api";
import NoticeCard from "./NoticeCard";

const THEME = {
    bg: '#060A13',
    card: '#121824',
    borderMuted: 'rgba(78, 93, 120, 0.15)',
    border: 'rgba(0, 240, 255, 0.12)',
    cyan: '#00F0FF',
    lime: '#A3FF12',
    text: '#E5E9F0',
    muted: '#4E5D78',
};

const TYPES = ["all", "general", "exam", "event", "assignment", "deadline", "archived"];

const modalInputStyle = {
    background: 'rgba(6,10,19,0.6)',
    border: '1px solid rgba(78,93,120,0.15)',
    color: '#E5E9F0',
    boxSizing: 'border-box',
};

export default function NoticeBoard({ communityId, userRole }) {
    const [notices, setNotices] = useState([]);
    const [type, setType] = useState("all");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const normalizedRole = userRole?.toLowerCase();
    const isCR = normalizedRole === "cr" || normalizedRole === "admin" || normalizedRole === "moderator";

    const [form, setForm] = useState({
        title: "", content: "", type: "general", priority: "normal", deadline: ""
    });

    const fetchNotices = async () => {
        try {
            const params = new URLSearchParams();

            if (type === "archived") {
                params.append("archived", "true");
            } else {
                if (type && type !== "all") params.append("type", type);
            }

            const res = await API.get(`/notices/${communityId}?${params}`);
            const data = res.data;

            if (Array.isArray(data)) setNotices(data);
            else if (Array.isArray(data?.notices)) setNotices(data.notices);
            else setNotices([]);

        } catch (err) {
            console.error("fetchNotices error:", err);
            setNotices([]);
        }
    };

    useEffect(() => {
        if (communityId) fetchNotices();
    }, [communityId, type]);

    const openCreate = () => {
        setEditingNotice(null);
        setFiles([]);
        setForm({ title: "", content: "", type: "general", priority: "normal", deadline: "" });
        setShowModal(true);
    };

    const openEdit = (notice) => {
        setEditingNotice(notice);
        setFiles([]);
        setForm({
            title: notice.title,
            content: notice.content,
            type: notice.type,
            priority: notice.priority,
            deadline: notice.deadline ? new Date(notice.deadline).toISOString().slice(0, 16) : ""
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.content.trim()) return;
        setLoading(true);
        try {
            if (editingNotice) {
                await API.put(`/notices/${editingNotice._id}`, form);
            } else {
                const formData = new FormData();
                formData.append("title", form.title);
                formData.append("content", form.content);
                formData.append("type", form.type);
                formData.append("priority", form.priority);
                formData.append("communityId", communityId);
                if (form.deadline) formData.append("deadline", form.deadline);
                files.forEach(f => formData.append("files", f));
                await API.post("/notices", formData, { headers: { "Content-Type": "multipart/form-data" } });
            }
            setShowModal(false);
            setFiles([]);
            fetchNotices();
        } catch (err) {
            console.error("handleSubmit error:", err?.response?.data || err);
            alert(err?.response?.data?.message || "Failed to save notice");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (noticeId) => {
        if (!window.confirm("Delete this notice?")) return;
        try {
            await API.delete(`/notices/${noticeId}`);
            fetchNotices();
        } catch (err) { console.error(err); }
    };

    const handleArchive = async (noticeId) => {
        try {
            await API.patch(`/notices/${noticeId}/archive`);
            fetchNotices();
        } catch (err) { console.error(err); }
    };

    // BUG FIX: was defined but never passed to NoticeCard before
    const handleUnarchive = async (noticeId) => {
        try {
            await API.patch(`/notices/${noticeId}/unarchive`);
            fetchNotices();
        } catch (err) { console.error(err); }
    };

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selected].slice(0, 5));
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const filtered = notices.filter(n =>
        n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.content?.toLowerCase().includes(search.toLowerCase())
    );

    // On archived tab, don't split into pinned/rest — just show all
    const isArchived = type === "archived";
    const pinned = isArchived ? [] : filtered.filter(n => n.priority === "high");
    const rest = isArchived ? filtered : filtered.filter(n => n.priority !== "high");

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Share+Tech+Mono&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
                .nb-input:focus { outline: none; border-color: #00F0FF !important; }
                .nb-input::placeholder { color: rgba(78,93,120,0.4); }
                .nb-textarea:focus { outline: none; border-color: #00F0FF !important; }
                .nb-textarea::placeholder { color: rgba(78,93,120,0.4); }
                select option { background: #121824; color: #E5E9F0; }
            `}</style>

            <div className="p-5 min-h-[500px]" style={{ fontFamily: "'Share Tech Mono', monospace" }}>

                {/* Top bar */}
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">

                    {/* Search */}
                    <input
                        className="nb-input px-3 py-2 text-[11px] rounded w-[200px] transition-all duration-200"
                        placeholder="Search notices..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ ...modalInputStyle, background: 'rgba(6,10,19,0.6)', letterSpacing: 1 }}
                    />

                    {/* Type filters */}
                    <div className="flex gap-1.5 flex-wrap">
                        {TYPES.map(t => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className="px-3 py-1 text-[10px] tracking-[2px] uppercase cursor-pointer rounded transition-all duration-150 hover:border-[#00F0FF]/40 hover:text-[#00F0FF]"
                                style={{
                                    background: type === t ? 'rgba(0,240,255,0.08)' : 'transparent',
                                    border: `1px solid ${type === t ? THEME.cyan : THEME.borderMuted}`,
                                    color: type === t ? THEME.cyan : THEME.muted,
                                    fontFamily: "'Share Tech Mono', monospace",
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Create button — only for CR/admin, not on archived tab */}
                    {isCR && !isArchived && (
                        <button
                            onClick={openCreate}
                            className="px-4 py-2 text-[11px] font-bold tracking-[2px] rounded cursor-pointer transition-all duration-200 hover:opacity-90"
                            style={{ background: THEME.lime, color: '#060A13', border: 'none', fontFamily: "'Orbitron', monospace" }}
                        >
                            + NOTICE
                        </button>
                    )}
                </div>

                {/* Pinned section — hidden on archived tab */}
                {pinned.length > 0 && (
                    <div className="mb-5">
                        <div className="flex items-center gap-2 text-[10px] tracking-[3px] mb-2.5" style={{ color: THEME.muted }}>
                            <span>📌</span> PINNED
                        </div>
                        {pinned.map(n => (
                            <NoticeCard
                                key={n._id} notice={n} isCR={isCR}
                                onEdit={() => openEdit(n)}
                                onDelete={() => handleDelete(n._id)}
                                onArchive={() => handleArchive(n._id)}
                                onUnarchive={() => handleUnarchive(n._id)}
                            />
                        ))}
                    </div>
                )}

                {/* Notices list / empty state */}
                {rest.length === 0 && pinned.length === 0 ? (
                    <div className="text-center py-10 text-[11px] tracking-[2px]" style={{ color: THEME.muted }}>
                        {isArchived ? "[ NO ARCHIVED NOTICES ]" : "[ NO NOTICES FOUND ]"}
                    </div>
                ) : (
                    rest.map(n => (
                        <NoticeCard
                            key={n._id} notice={n} isCR={isCR}
                            onEdit={() => openEdit(n)}
                            onDelete={() => handleDelete(n._id)}
                            onArchive={() => handleArchive(n._id)}
                            onUnarchive={() => handleUnarchive(n._id)}
                        />
                    ))
                )}
            </div>

            {/* Create / Edit modal */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5" style={{ background: 'rgba(0,0,0,0.85)' }}>
                    <div
                        className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-lg p-6"
                        style={{ background: THEME.card, border: `1px solid ${THEME.border}` }}
                    >
                        <p className="text-[11px] tracking-[3px] mb-5" style={{ color: THEME.cyan }}>
                            {editingNotice ? "EDIT NOTICE" : "CREATE NOTICE"}
                        </p>

                        <input
                            className="nb-input w-full px-4 py-2.5 mb-3 rounded text-[13px] transition-all duration-200"
                            placeholder="Title *"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            style={{ ...modalInputStyle, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        />

                        <textarea
                            className="nb-textarea w-full px-4 py-2.5 mb-3 rounded text-[13px] resize-y transition-all duration-200"
                            placeholder="Description *"
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            rows={4}
                            style={{ ...modalInputStyle, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        />

                        <div className="flex gap-2.5 mb-3">
                            <select
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                                className="flex-1 px-3 py-2 rounded text-[12px]"
                                style={{ ...modalInputStyle, fontFamily: "'Share Tech Mono', monospace" }}
                            >
                                <option value="general">General</option>
                                <option value="exam">Exam</option>
                                <option value="event">Event</option>
                                <option value="assignment">Assignment</option>
                                <option value="deadline">Deadline</option>
                            </select>

                            <select
                                value={form.priority}
                                onChange={e => setForm({ ...form, priority: e.target.value })}
                                className="flex-1 px-3 py-2 rounded text-[12px]"
                                style={{ ...modalInputStyle, fontFamily: "'Share Tech Mono', monospace" }}
                            >
                                <option value="normal">Normal</option>
                                <option value="medium">Medium</option>
                                <option value="high">High 🔴</option>
                            </select>
                        </div>

                        <input
                            type="datetime-local"
                            value={form.deadline}
                            onChange={e => setForm({ ...form, deadline: e.target.value })}
                            className="w-full px-3 py-2 mb-4 rounded text-[12px]"
                            style={{ ...modalInputStyle, fontFamily: "'Share Tech Mono', monospace", colorScheme: 'dark' }}
                        />

                        {/* File attachments — only when creating */}
                        {!editingNotice && (
                            <div className="mb-4">
                                <p className="text-[10px] tracking-[2px] mb-2" style={{ color: THEME.muted }}>
                                    ATTACHMENTS (PDFs, images — max 5)
                                </p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 text-[10px] tracking-[2px] rounded cursor-pointer mb-2 transition-all duration-150 hover:opacity-80"
                                    style={{ background: 'transparent', border: `1px solid ${THEME.borderMuted}`, color: THEME.muted, fontFamily: "'Share Tech Mono', monospace" }}
                                >
                                    📎 ATTACH FILES
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {files.length > 0 && (
                                    <div className="flex flex-col gap-1.5">
                                        {files.map((f, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between px-3 py-1.5 rounded text-[11px]"
                                                style={{ background: 'rgba(6,10,19,0.6)', border: `1px solid ${THEME.borderMuted}` }}
                                            >
                                                <span style={{ color: THEME.cyan }}>📎 {f.name}</span>
                                                <button
                                                    onClick={() => removeFile(i)}
                                                    className="bg-transparent border-none cursor-pointer text-[12px] px-1 hover:opacity-70"
                                                    style={{ color: '#FF4444' }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2.5 mt-1">
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !form.title.trim() || !form.content.trim()}
                                className="flex-1 py-2.5 text-[11px] font-bold tracking-[2px] rounded cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                                style={{ background: THEME.lime, color: '#060A13', border: 'none', fontFamily: "'Orbitron', monospace" }}
                            >
                                {loading ? "SAVING..." : (editingNotice ? "UPDATE" : "CREATE")}
                            </button>
                            <button
                                onClick={() => { setShowModal(false); setFiles([]); }}
                                className="px-5 py-2.5 text-[11px] rounded cursor-pointer transition-all duration-150 hover:opacity-70"
                                style={{ background: 'transparent', border: `1px solid ${THEME.borderMuted}`, color: THEME.muted, fontFamily: "'Share Tech Mono', monospace" }}
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}