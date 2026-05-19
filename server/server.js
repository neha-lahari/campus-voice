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

app.use(cors());

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
// SOCKET.IO SERVER
// =====================================================

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH", "DELETE"]
    }
});


// =====================================================
// SOCKET HANDLER
// =====================================================

require("./helpers/socketHandler")(io);


// =====================================================
// CRON JOBS
// =====================================================

require("./helpers/pollCron");

require("./helpers/reminderCron");


// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./routes/authRoutes");

const communityRoutes = require("./routes/communityRoutes");

const postRoutes = require("./routes/postRoutes");

const messageRoutes = require("./routes/messageRoutes");

const profileRoutes = require("./routes/profileRoutes");

const searchRoutes = require("./routes/searchRoutes");


app.use("/api/votes", require("./routes/voteRoutes"));

app.use("/api/comments", require("./routes/commentRoutes"));

app.use("/api/notices", require("./routes/noticeRoutes"));

app.use("/api/profile", profileRoutes);

app.use("/api/search", searchRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/communities", communityRoutes);

app.use("/api/auth", authRoutes);


// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});