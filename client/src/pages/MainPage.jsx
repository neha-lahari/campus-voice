import { Routes, Route, Navigate } from "react-router-dom";
import Feed from "./Feed";

export default function MainPage() {
    return (
        <div>

            {/* NAVBAR (UNCHANGED) */}
            <nav
                style={{
                    padding: "10px",
                    background: "#0a0f1a",
                    color: "#39ff64",
                }}
            >
                Campus Voice
            </nav>

            {/* FIX: relative routing */}
            <Routes>
                <Route path="/" element={<Navigate to="feed" />} />
                <Route path="feed" element={<Feed />} />
            </Routes>

        </div>
    );
}