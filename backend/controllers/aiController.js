const { askGemini } = require("../services/aiService");

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

module.exports = { askAI };