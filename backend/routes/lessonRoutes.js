const express = require("express");
const router = express.Router();

const {
  getLessonsByCourse,
  createLesson,
} = require("../controllers/lessonController");

router.get("/:courseId", getLessonsByCourse);

router.post("/", createLesson);

module.exports = router;