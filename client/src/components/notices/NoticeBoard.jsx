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

const TYPES = ["all", "general", "exam", "event", "assignment", "deadline"];

export default function NoticeBoard({ communityId, userRole }) {
    const [notices, setNotices] = useState([]);
    const [type, setType] = useState("all");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingNotice, setEditingNotice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    // ✅ FIX 1: Normalize role — handles "admin", "Admin", "CR", "cr" all correctly
    const normalizedRole = userRole?.toLowerCase();
    const isCR = normalizedRole === "cr" || normalizedRole === "admin" || normalizedRole === "moderator";

    const [form, setForm] = useState({
        title: "",
        content: "",
        type: "general",
        priority: "normal",
        deadline: ""
    });

    const fetchNotices = async () => {
        try {
            const params = new URLSearchParams();
            if (type && type !== "all") params.append("type", type);
            const res = await API.get(`/notices/${communityId}?${params}`);

            // ✅ FIX 2: Backend returns { notices: [] }, not a plain array
            const data = res.data;
            if (Array.isArray(data)) {
                setNotices(data);
            } else if (Array.isArray(data?.notices)) {
                setNotices(data.notices);
            } else {
                setNotices([]);
            }
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
            deadline: notice.deadline
                ? new Date(notice.deadline).toISOString().slice(0, 16)
                : ""
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

                await API.post("/notices", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
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

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selected].slice(0, 5));
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // ✅ FIX 3: Use optional chaining — notices[i].title could be undefined briefly
    const filtered = notices.filter(n =>
        n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.content?.toLowerCase().includes(search.toLowerCase())
    );

    const pinned = filtered.filter(n => n.priority === "high");
    const rest = filtered.filter(n => n.priority !== "high");

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Share+Tech+Mono&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
                .nb-filter:hover { border-color: rgba(0,240,255,0.4) !important; color: #00F0FF !important; }
                .nb-input:focus { outline: none; border-color: #00F0FF !important; }
                .nb-input::placeholder { color: rgba(78,93,120,0.4); }
                .nb-textarea:focus { outline: none; border-color: #00F0FF !important; }
                .nb-textarea::placeholder { color: rgba(78,93,120,0.4); }
                .file-item:hover { border-color: rgba(255,68,68,0.4) !important; }
                ::-webkit-scrollbar { width: 3px; }
                ::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.15); }
                select option { background: #121824; color: #E5E9F0; }
            `}</style>

            {/* ✅ FIX 4: Removed background: THEME.bg — was creating double dark panel.
                Parent in CommunityDetails already provides the card background. */}
            <div style={{ padding: 20, minHeight: 500, fontFamily: "'Share Tech Mono', monospace" }}>

                {/* TOP BAR */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
                    <input
                        className="nb-input"
                        placeholder="Search notices..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            padding: '8px 14px', fontSize: 11,
                            background: 'rgba(6,10,19,0.6)', border: `1px solid ${THEME.borderMuted}`,
                            color: THEME.text, letterSpacing: 1,
                            fontFamily: "'Share Tech Mono', monospace", width: 200
                        }}
                    />

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {TYPES.map(t => (
                            <button key={t} className="nb-filter" onClick={() => setType(t)}
                                style={{
                                    padding: '5px 12px', fontSize: 10, letterSpacing: 2,
                                    textTransform: 'uppercase', cursor: 'pointer',
                                    background: type === t ? 'rgba(0,240,255,0.08)' : 'transparent',
                                    border: `1px solid ${type === t ? THEME.cyan : THEME.borderMuted}`,
                                    color: type === t ? THEME.cyan : THEME.muted,
                                    transition: 'all 0.15s',
                                    fontFamily: "'Share Tech Mono', monospace"
                                }}>
                                {t}
                            </button>
                        ))}
                    </div>

                    {isCR && (
                        <button onClick={openCreate} style={{
                            padding: '8px 16px', fontSize: 11,
                            background: THEME.lime, color: '#060A13',
                            border: 'none', cursor: 'pointer', fontWeight: 700,
                            letterSpacing: 2, fontFamily: "'Orbitron', monospace",
                            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'
                        }}>
                            + NOTICE
                        </button>
                    )}
                </div>

                {/* PINNED */}
                {pinned.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 10, color: THEME.muted, letterSpacing: 3, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>📌</span> PINNED ANNOUNCEMENTS
                        </div>
                        {pinned.map(n => (
                            <NoticeCard key={n._id} notice={n} isCR={isCR}
                                onEdit={() => openEdit(n)}
                                onDelete={() => handleDelete(n._id)}
                                onArchive={() => handleArchive(n._id)}
                            />
                        ))}
                    </div>
                )}

                {/* REST */}
                {rest.length === 0 && pinned.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, fontSize: 11, color: THEME.muted, letterSpacing: 2 }}>
                        [ NO NOTICES FOUND ]
                    </div>
                ) : (
                    rest.map(n => (
                        <NoticeCard key={n._id} notice={n} isCR={isCR}
                            onEdit={() => openEdit(n)}
                            onDelete={() => handleDelete(n._id)}
                            onArchive={() => handleArchive(n._id)}
                        />
                    ))
                )}
            </div>

            {/* ✅ MODAL — position:fixed works correctly now that clipPath is removed from parent */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 20
                }}>
                    <div style={{
                        background: THEME.card, width: '100%', maxWidth: 500,
                        maxHeight: '90vh', overflowY: 'auto',
                        border: `1px solid ${THEME.border}`,
                        clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
                        padding: 24
                    }}>
                        <p style={{ fontSize: 11, color: THEME.cyan, letterSpacing: 3, marginBottom: 20 }}>
                            {editingNotice ? "EDIT NOTICE" : "CREATE NOTICE"}
                        </p>

                        <input className="nb-input" placeholder="Title *"
                            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                            style={{
                                width: '100%', padding: '10px 14px', marginBottom: 12,
                                background: 'rgba(6,10,19,0.6)', border: `1px solid ${THEME.borderMuted}`,
                                color: THEME.text, fontSize: 13, boxSizing: 'border-box',
                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                        />

                        <textarea className="nb-textarea" placeholder="Description *"
                            value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                            rows={4}
                            style={{
                                width: '100%', padding: '10px 14px', marginBottom: 12,
                                background: 'rgba(6,10,19,0.6)', border: `1px solid ${THEME.borderMuted}`,
                                color: THEME.text, fontSize: 13, resize: 'vertical', boxSizing: 'border-box',
                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                            }}
                        />

                        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                                style={{
                                    flex: 1, padding: '9px 12px',
                                    background: 'rgba(6,10,19,0.8)', border: `1px solid ${THEME.borderMuted}`,
                                    color: THEME.text, fontSize: 12,
                                    fontFamily: "'Share Tech Mono', monospace"
                                }}>
                                <option value="general">General</option>
                                <option value="exam">Exam</option>
                                <option value="event">Event</option>
                                <option value="assignment">Assignment</option>
                                <option value="deadline">Deadline</option>
                            </select>

                            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                                style={{
                                    flex: 1, padding: '9px 12px',
                                    background: 'rgba(6,10,19,0.8)', border: `1px solid ${THEME.borderMuted}`,
                                    color: THEME.text, fontSize: 12,
                                    fontFamily: "'Share Tech Mono', monospace"
                                }}>
                                <option value="normal">Normal</option>
                                <option value="medium">Medium</option>
                                <option value="high">High 🔴</option>
                            </select>
                        </div>

                        <input type="datetime-local" value={form.deadline}
                            onChange={e => setForm({ ...form, deadline: e.target.value })}
                            style={{
                                width: '100%', padding: '9px 12px', marginBottom: 12,
                                background: 'rgba(6,10,19,0.8)', border: `1px solid ${THEME.borderMuted}`,
                                color: THEME.text, fontSize: 12, boxSizing: 'border-box',
                                fontFamily: "'Share Tech Mono', monospace", colorScheme: 'dark'
                            }}
                        />

                        {!editingNotice && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 10, color: THEME.muted, letterSpacing: 2, marginBottom: 8 }}>
                                    ATTACHMENTS (PDFs, images, docs — max 5)
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        padding: '8px 16px', fontSize: 10, letterSpacing: 2,
                                        background: 'transparent',
                                        border: `1px solid ${THEME.borderMuted}`,
                                        color: THEME.muted, cursor: 'pointer',
                                        fontFamily: "'Share Tech Mono', monospace",
                                        marginBottom: 8
                                    }}
                                >
                                    📎 ATTACH FILES
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                {files.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {files.map((f, i) => (
                                            <div key={i} className="file-item" style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '6px 10px',
                                                background: 'rgba(6,10,19,0.6)',
                                                border: `1px solid ${THEME.borderMuted}`,
                                                fontSize: 11, color: THEME.text,
                                                transition: 'all 0.15s'
                                            }}>
                                                <span style={{ fontSize: 10, color: THEME.cyan }}>📎 {f.name}</span>
                                                <button onClick={() => removeFile(i)} style={{
                                                    background: 'transparent', border: 'none',
                                                    color: '#FF4444', cursor: 'pointer', fontSize: 12, padding: '0 4px'
                                                }}>✕</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                            <button onClick={handleSubmit}
                                disabled={loading || !form.title.trim() || !form.content.trim()}
                                style={{
                                    flex: 1, padding: '10px 0', fontSize: 11,
                                    background: THEME.lime, color: '#060A13',
                                    border: 'none', cursor: 'pointer', fontWeight: 700,
                                    letterSpacing: 2, fontFamily: "'Orbitron', monospace",
                                    opacity: (loading || !form.title.trim() || !form.content.trim()) ? 0.5 : 1
                                }}>
                                {loading ? "SAVING..." : (editingNotice ? "UPDATE" : "CREATE")}
                            </button>
                            <button onClick={() => { setShowModal(false); setFiles([]); }} style={{
                                padding: '10px 20px', fontSize: 11,
                                background: 'transparent', border: `1px solid ${THEME.borderMuted}`,
                                color: THEME.muted, cursor: 'pointer',
                                fontFamily: "'Share Tech Mono', monospace"
                            }}>
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}