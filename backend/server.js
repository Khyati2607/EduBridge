const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const progressRoutes = require("./routes/progressRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const aiRoutes = require("./routes/aiRoutes");
dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const lessonRoutes = require("./routes/lessonRoutes");
const quizRoutes = require("./routes/quizRoutes");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.get("/", (req, res) => {
    res.json({
        message: "AI Interview Assessment and Feedback System Backend is Running 🚀",
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});