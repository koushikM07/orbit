const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const discussionRoutes = require("./routes/discussion");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const chatRoutes = require("./routes/chat");
const userRoutes = require("./routes/user");
require("./database/database");

const app = express();

app.use(cors());

app.use(express.json());


// =====================================================
// HTTP SERVER
// =====================================================

const server = http.createServer(app);


// =====================================================
// SOCKET.IO
// =====================================================

const io = new Server(server, {

    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }

});


// =====================================================
// ATTACH IO TO REQUEST
// =====================================================

app.use((req, res, next) => {

    req.io = io;

    next();

});


// =====================================================
// SOCKET CONNECTION
// =====================================================

io.on("connection", (socket) => {

    console.log(
        "User connected:",
        socket.id
    );

    socket.on("join-user", (userId) => {

    socket.join(`user-${userId}`);

    console.log(
        `User ${userId} joined notification room`
    );

    });
    socket.on("join-chat", () => {

        socket.join("orbit-chat");

        console.log(
            "User joined Orbit Chat:",
            socket.id
        );

    });


    socket.on("disconnect", () => {

        console.log(
            "User disconnected:",
            socket.id
        );

    });

});


// =====================================================
// ROUTES
// =====================================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/discussions",
    discussionRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/chat",
    chatRoutes
);

app.use(
    "/api/users",
    userRoutes
);
// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {

    res.send(
        "Orbit Backend Running 🚀"
    );

});


// =====================================================
// START SERVER
// =====================================================

const PORT = 5000;

server.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});