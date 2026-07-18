const Quiz = require("../models/Quiz");

// Get all quiz questions
const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.find().populate("lesson");

    res.status(200).json({
      success: true,
      count: quiz.length,
      quiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Create quiz question
const createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);

    res.status(201).json({
      success: true,
      message: "Quiz Question Created",
      quiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getQuiz,
  createQuiz,
};