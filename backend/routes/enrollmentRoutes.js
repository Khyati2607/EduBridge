const express = require("express");

const router = express.Router();

const protect = require("../middleware/protect");

const {
  enrollCourse,
  getMyCourses,
} = require("../controllers/enrollmentController");

// Enroll in course
router.post("/", protect, enrollCourse);

// Get logged-in student's courses
router.get("/my", protect, getMyCourses);

module.exports = router;