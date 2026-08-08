const express = require("express");
const cors = require("cors");
const discussionRoutes = require("./routes/discussion");

require("./database/database");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Orbit Backend Running 🚀");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});