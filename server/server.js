const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
const app = express();

app.set("trust proxy", 1);

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json());

// test route
app.get("/", (req, res) => {
    res.send("API is running...");
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("MongoDB Error:", err));

// http server
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: true,
    },
});

// socket 
require("./helpers/socketHandler")(io);

const { setSocket } = require("./helpers/createNotification");
setSocket(io);

require("./helpers/deadlineCron");

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));

app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/communities", require("./routes/communityRoutes"));

app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/dm", require("./routes/dmRoutes"));

app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));

const PORT = process.env.PORT || 5000;

// ✅ FIXED listen for Render
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});