const express = require("express");
const router = express.Router();

const {
  getQuizByLesson,
  createQuiz,
  generateQuiz,
} = require("../controllers/quizController");

router.post("/generate", generateQuiz);

router.get("/:lessonId", getQuizByLesson);

router.post("/", createQuiz);

module.exports = router;