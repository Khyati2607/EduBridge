const Quiz = require("../models/Quiz");
const { generateAIQuiz } = require("../services/aiQuizService");

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

// Generate AI quiz
const generateQuiz = async (req, res) => {
  try {
    const { lessonId, topic, numberOfQuestions } = req.body;

    if (!lessonId || !topic) {
      return res.status(400).json({
        success: false,
        message: "lessonId and topic are required",
      });
    }

    const questions = await generateAIQuiz(
      topic,
      numberOfQuestions || 5
    );

    const quiz = await Quiz.insertMany(
      questions.map((q) => ({
        lesson: lessonId,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks || 1,
      }))
    );

    res.status(201).json({
      success: true,
      message: "AI Quiz Generated Successfully",
      count: quiz.length,
      quiz,
    });
  } catch (error) {
    console.error("AI Quiz Error:", error);

    res.status(500).json({
      success: false,
      message: "AI Quiz Generation Failed",
      error: error.message,
    });
  }
};

module.exports = {
  getQuizByLesson,
  createQuiz,
  generateQuiz,
};