const express = require("express");
const router = express.Router();

const {
  getCourses,
  getCourseById,
  createCourse,
} = require("../controllers/courseController");

// Get all courses
router.get("/", getCourses);

// Get single course by ID
router.get("/:id", getCourseById);

// Create new course
router.post("/", createCourse);

module.exports = router;