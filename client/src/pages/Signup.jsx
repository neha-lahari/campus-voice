import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const fields = [
    {
        label: "STUDENT NAME",
        name: "name",
        type: "text",
        placeholder: "ENTER YOUR NAME",
    },
    {
        label: "COLLEGE EMAIL",
        name: "email",
        type: "email",
        placeholder: "ENTER YOUR EMAIL",
    },
    {
        label: "ROLL NUMBER",
        name: "rollNumber",
        type: "text",
        placeholder: "XXXXXXXXX",
    },
    {
        label: "SECURITY PASSWORD",
        name: "password",
        type: "password",
        placeholder: "••••••••••••",
    },
];

function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        rollNumber: "",
        password: "",
    });

    const handleChange = (e) =>
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // ✅ FIX: trim + clean roll number BEFORE sending
            const payload = {
                ...form,
                rollNumber: form.rollNumber.trim(),
            };

            const res = await API.post("/signup", payload);

            localStorage.setItem("token", res.data.token);
            alert("Account Created Successfully");
            navigate("/main"); // ✅ ADD THIS
        } catch (err) {
            alert(err.response?.data?.message || "Signup Failed");
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@300;500;600&display=swap');
            `}</style>

            <div
                className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden"
                style={{ background: "#020810" }}
            >
                {/* GRID */}
                <div
                    className="fixed inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(57,255,100,0.10) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(57,255,100,0.10) 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                        maskImage:
                            "radial-gradient(circle at center, black 40%, transparent 90%)",
                        WebkitMaskImage:
                            "radial-gradient(circle at center, black 40%, transparent 90%)",
                    }}
                />

                {/* MAIN CARD */}
                <div
                    className="relative z-10 w-full max-w-[460px]"
                    style={{
                        background:
                            "linear-gradient(145deg, rgba(2,15,28,0.97), rgba(1,10,18,0.99))",
                        border: "1px solid rgba(57,255,100,0.25)",
                        clipPath:
                            "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))",
                        boxShadow:
                            "0 30px 80px rgba(0,0,0,0.8), 0 0 60px rgba(57,255,100,0.06)",
                    }}
                >
                    {/* HEADER (UNCHANGED) */}
                    <div className="px-9 pt-7 pb-6 border-b border-[rgba(57,255,100,0.1)]">
                        <div className="flex items-center gap-3 mb-5">
                            <div
                                className="w-10 h-10 flex items-center justify-center text-[#020810] font-black text-sm rounded"
                                style={{
                                    background: "#39ff64",
                                    fontFamily: "'Orbitron', monospace",
                                    boxShadow: "0 0 15px rgba(57,255,100,0.4)",
                                }}
                            >
                                CV
                            </div>

                            <span
                                className="text-lg font-bold tracking-[4px]"
                                style={{
                                    fontFamily: "'Orbitron', monospace",
                                    color: "#39ff64",
                                    textShadow:
                                        "0 0 25px rgba(57,255,100,0.7)",
                                }}
                            >
                                CAMPUSVOICE
                            </span>
                        </div>

                        <h2
                            className="text-xl font-black text-[#e0ffe8] tracking-wide"
                            style={{
                                fontFamily: "'Orbitron', monospace",
                            }}
                        >
                            CREATE ACCOUNT
                        </h2>

                        <p
                            className="text-xs tracking-[3px] uppercase mt-1"
                            style={{
                                fontFamily: "'Rajdhani', sans-serif",
                                color: "rgba(150,200,160,0.5)",
                            }}
                        >
                            campus discussion network
                        </p>
                    </div>

                    {/* FORM */}
                    <div className="px-9 pt-7 pb-8">
                        <form onSubmit={handleSubmit}>
                            {fields.map(({ label, name, type, placeholder }) => (
                                <div key={name} className="mb-[18px]">
                                    <div
                                        className="flex items-center gap-2 mb-2 text-[11px] tracking-[2px]"
                                        style={{
                                            fontFamily:
                                                "'Share Tech Mono', monospace",
                                            color: "rgba(57,255,100,0.6)",
                                        }}
                                    >
                                        {label}
                                        <div className="flex-1 h-px bg-gradient-to-r from-green-400/20 to-transparent" />
                                    </div>

                                    <input
                                        type={type}
                                        name={name}
                                        value={form[name]}   // ✅ FIXED
                                        placeholder={placeholder}
                                        onChange={handleChange}
                                        className="w-full py-3 px-5 text-sm text-[#c8e6c9] outline-none"
                                        style={{
                                            fontFamily:
                                                "'Share Tech Mono', monospace",
                                            letterSpacing: 1,
                                            background:
                                                "rgba(57,255,100,0.03)",
                                            border:
                                                "1px solid rgba(57,255,100,0.12)",
                                        }}
                                    />
                                </div>
                            ))}

                            {/* BUTTON (UNCHANGED) */}
                            <button
                                type="submit"
                                className="relative w-full py-4 overflow-hidden text-[12px] font-bold tracking-[5px] transition-all duration-300"
                                style={{
                                    fontFamily: "'Orbitron', monospace",
                                    border: "1px solid #39ff64",
                                    color: "#39ff64",
                                    clipPath:
                                        "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                                }}
                            >
                                <span className="relative z-10">
                                    [ JOIN CAMPUS ]
                                </span>
                            </button>
                        </form>

                        {/* LOGIN */}
                        <p
                            className="text-center mt-5 text-[12px] tracking-wider"
                            style={{
                                fontFamily:
                                    "'Share Tech Mono', monospace",
                                color: "rgba(57,255,100,0.25)",
                            }}
                        >
                            ALREADY REGISTERED?{" "}
                            <a
                                href="/login"
                                style={{
                                    color: "#39ff64",
                                    textDecoration: "none",
                                }}
                            >
                                LOGIN HERE
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Signup;