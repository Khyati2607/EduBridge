const express = require("express");
const router = express.Router();

const {
  getLessons,
  createLesson,
} = require("../controllers/lessonController");

// Get all lessons
router.get("/", getLessons);

// Create lesson
router.post("/", createLesson);

module.exports = router;