const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));

const dashboardRoutes = require("./routes/dashboardRoutes");
const issueRoutes = require("./routes/issueRoutes");
const commentRoutes=require("./routes/commentRoutes");
const voteRoutes=require("./routes/voteRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/admin", adminRoutes);

app.use("/api/issues", issueRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/votes", voteRoutes);

app.use((err, req, res, next) => {
  console.error("MULTER/CLOUDINARY ERROR:", err);
  res.status(500).json({ message: err.message });
});

app.get("/", (req, res) => {
  res.send("CleanStreet API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

