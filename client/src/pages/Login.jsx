import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        identifier: "",
        password: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await API.post("/login", form);

            localStorage.setItem("token", res.data.token);

            alert("Login successful");

            navigate("/main"); // ✅ ADD THIS LINE
        } catch (err) {
            alert(err.response?.data?.message || "Login failed");
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
                    className="relative z-10 w-full max-w-[420px]"
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
                    {/* HEADER */}
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
                                style={{
                                    fontFamily: "'Orbitron', monospace",
                                    color: "#39ff64",
                                    textShadow:
                                        "0 0 25px rgba(57,255,100,0.7)",
                                    letterSpacing: "4px",
                                }}
                            >
                                CAMPUSVOICE
                            </span>
                        </div>

                        <h2
                            style={{
                                fontFamily: "'Orbitron', monospace",
                                color: "#e0ffe8",
                                fontSize: "20px",
                                letterSpacing: "2px",
                            }}
                        >
                            LOGIN
                        </h2>

                        <p
                            style={{
                                fontFamily: "'Rajdhani', sans-serif",
                                color: "rgba(150,200,160,0.5)",
                                fontSize: "12px",
                                letterSpacing: "3px",
                                textTransform: "uppercase",
                            }}
                        >
                            access campus network
                        </p>
                    </div>

                    {/* FORM */}
                    <div className="px-9 pt-7 pb-8">
                        <form onSubmit={handleSubmit}>
                            {/* IDENTIFIER */}
                            <div className="mb-5">
                                <div
                                    style={{
                                        fontFamily:
                                            "'Share Tech Mono', monospace",
                                        color: "rgba(57,255,100,0.6)",
                                        fontSize: "11px",
                                        marginBottom: "6px",
                                    }}
                                >
                                    USER ID / EMAIL
                                </div>

                                <input
                                    name="identifier"
                                    placeholder="Email or Roll Number"
                                    onChange={handleChange}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        background:
                                            "rgba(57,255,100,0.03)",
                                        border:
                                            "1px solid rgba(57,255,100,0.12)",
                                        color: "#c8e6c9",
                                        fontFamily:
                                            "'Share Tech Mono', monospace",
                                        outline: "none",
                                    }}
                                />
                            </div>

                            {/* PASSWORD */}
                            <div className="mb-6">
                                <div
                                    style={{
                                        fontFamily:
                                            "'Share Tech Mono', monospace",
                                        color: "rgba(57,255,100,0.6)",
                                        fontSize: "11px",
                                        marginBottom: "6px",
                                    }}
                                >
                                    PASSWORD
                                </div>

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter password"
                                    onChange={handleChange}
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        background:
                                            "rgba(57,255,100,0.03)",
                                        border:
                                            "1px solid rgba(57,255,100,0.12)",
                                        color: "#c8e6c9",
                                        fontFamily:
                                            "'Share Tech Mono', monospace",
                                        outline: "none",
                                    }}
                                />
                            </div>

                            {/* BUTTON */}
                            {/* BUTTON */}
                            <button
                                type="submit"
                                className="relative w-full py-4 overflow-hidden text-[12px] font-bold tracking-[5px] transition-all duration-300"
                                style={{
                                    fontFamily: "'Orbitron', monospace",
                                    border: "1px solid #39ff64",
                                    color: "#39ff64",
                                    background: "transparent",
                                    cursor: "pointer",
                                    clipPath:
                                        "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                                    boxShadow: "0 0 20px rgba(57,255,100,0.1)",
                                    textShadow: "0 0 15px rgba(57,255,100,0.6)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#020810";
                                    e.currentTarget.style.textShadow = "none";
                                    e.currentTarget.style.boxShadow =
                                        "0 0 35px rgba(57,255,100,0.4)";
                                    e.currentTarget.querySelector(".btn-bg").style.transform =
                                        "translateX(0)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "#39ff64";
                                    e.currentTarget.style.textShadow =
                                        "0 0 15px rgba(57,255,100,0.6)";
                                    e.currentTarget.style.boxShadow =
                                        "0 0 20px rgba(57,255,100,0.1)";
                                    e.currentTarget.querySelector(".btn-bg").style.transform =
                                        "translateX(-105%)";
                                }}
                            >
                                {/* SLIDING BACKGROUND */}
                                <span
                                    className="btn-bg absolute inset-0 bg-[#39ff64] z-0 transition-transform duration-300"
                                    style={{ transform: "translateX(-105%)" }}
                                />

                                {/* TEXT */}
                                <span className="relative z-10">
                                    LOGIN
                                </span>
                            </button>
                        </form>

                        {/* SIGNUP LINK */}
                        <p
                            style={{
                                marginTop: "16px",
                                textAlign: "center",
                                fontFamily:
                                    "'Share Tech Mono', monospace",
                                fontSize: "12px",
                                color: "rgba(57,255,100,0.25)",
                            }}
                        >
                            NEW USER?{" "}
                            <a
                                href="/signup"
                                style={{
                                    color: "#39ff64",
                                    textDecoration: "none",
                                }}
                            >
                                CREATE ACCOUNT
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;