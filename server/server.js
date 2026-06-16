const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());


// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
    res.send("API is running...");
});


// =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));


// =====================================================
// CREATE HTTP SERVER
// =====================================================

const server = http.createServer(app);


// =====================================================
// SOCKET.IO SETUP
// =====================================================

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: true
    }
});


// =====================================================
// SOCKET HANDLER
// =====================================================

require("./helpers/socketHandler")(io);

const { setSocket } = require("./helpers/createNotification");

setSocket(io);


// =====================================================
// CRON JOBS
// =====================================================

require("./helpers/cron");


// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./routes/authRoutes");
app.use("/api/upload", require("./routes/uploadRoutes"));
const communityRoutes = require("./routes/communityRoutes");
const postRoutes = require("./routes/postRoutes");
const messageRoutes = require("./routes/messageRoutes");
const profileRoutes = require("./routes/profileRoutes");
const searchRoutes = require("./routes/searchRoutes");

app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));

app.use("/api/profile", profileRoutes);
app.use("/api/search", searchRoutes);

app.use("/api/messages", messageRoutes);
app.use("/api/dm", require("./routes/dmRoutes"));
app.use("/api/posts", postRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api/notifications", require("./routes/notificationRoutes"));


// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});