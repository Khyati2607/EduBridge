require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({
  vertexai: false,
  apiKey: apiKey,
});

const askGemini = async (question) => {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `You are EduBridge AI Learning Assistant.

Explain concepts clearly and simply for students.
Use beginner-friendly language.
Give simple examples when useful.
Help students understand the concept rather than making the explanation unnecessarily complicated.

Student question:
${question}`,
      });

      return response.text;
    } catch (error) {
      console.error(`Gemini attempt ${attempt} failed:`, error.message);

      const isTemporaryError =
        error.message?.includes("503") ||
        error.message?.includes("UNAVAILABLE");

      if (!isTemporaryError || attempt === maxAttempts) {
        throw error;
      }

      const delay = attempt * 2000;

      console.log(
        `Gemini is busy. Retrying in ${delay / 1000} seconds...`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = { askGemini };