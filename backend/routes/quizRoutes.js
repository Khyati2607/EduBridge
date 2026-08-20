const express = require("express");
const router = express.Router();

const {
  getQuizByLesson,
  createQuiz,
} = require("../controllers/quizController");

router.get("/:lessonId", getQuizByLesson);

router.post("/", createQuiz);

module.exports = router;