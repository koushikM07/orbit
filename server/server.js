const express = require("express");
const cors = require("cors");

const discussionRoutes = require("./routes/discussion");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");

require("./database/database");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);


app.get("/", (req, res) => {
    res.send("Orbit Backend Running 🚀");
});


const PORT = 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});