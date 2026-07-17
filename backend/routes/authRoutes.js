const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/authController");

// Test Route
router.get("/test", (req, res) => {
  res.json({ message: "Auth route is working!" });
});

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Protected Profile Route
router.get("/profile", protect, getProfile);

module.exports = router;