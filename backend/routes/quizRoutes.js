const express = require("express");
const router = express.Router();

const {
  getQuiz,
  createQuiz,
} = require("../controllers/quizController");

// Get all quiz questions
router.get("/", getQuiz);

// Create quiz question
router.post("/", createQuiz);

module.exports = router;