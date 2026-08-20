const Quiz = require("../models/Quiz");

// Get quiz by lesson
const getQuizByLesson = async (req, res) => {
  try {
    const quiz = await Quiz.find({
      lesson: req.params.lessonId,
    });

    res.status(200).json({
      success: true,
      count: quiz.length,
      quiz,
    });
  } catch (error) {
    console.log(error);

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
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getQuizByLesson,
  createQuiz,
};