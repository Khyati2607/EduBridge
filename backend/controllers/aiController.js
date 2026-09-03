const { askGemini } = require("../services/aiService");
const Progress = require("../models/Progress");
const {
  generateRecommendations,
} = require("../services/recommendationService");

// AI Learning Assistant
const askAI = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const answer = await askGemini(question);

    res.status(200).json({
      success: true,
      question,
      answer,
    });
  } catch (error) {
    console.error("AI Error:", error);

    res.status(500).json({
      success: false,
      message: "AI assistant failed",
      error: error.message,
    });
  }
};

// Personalized learning recommendations
const getRecommendations = async (req, res) => {
  try {
    const student = req.user.id;

    const progress = await Progress.find({
      student,
    })
      .populate("lesson")
      .sort({ updatedAt: -1 });

    if (progress.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Complete some quizzes to get personalized recommendations.",
        recommendations: null,
      });
    }

    // Keep only the latest progress for each lesson
    const latestProgress = {};

    progress.forEach((item) => {
      const lessonId = item.lesson?._id?.toString();

      if (!lessonId) return;

      if (
        !latestProgress[lessonId] ||
        new Date(item.updatedAt) >
          new Date(latestProgress[lessonId].updatedAt)
      ) {
        latestProgress[lessonId] = item;
      }
    });

    const uniqueProgress = Object.values(latestProgress);

    const recommendations = await generateRecommendations(
      uniqueProgress
    );

    res.status(200).json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error("Recommendation Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate learning recommendations",
      error: error.message,
    });
  }
};

module.exports = {
  askAI,
  getRecommendations,
};