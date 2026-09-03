require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  vertexai: false,
  apiKey: process.env.GEMINI_API_KEY,
});

const generateAIQuiz = async (topic, numberOfQuestions = 5) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",

    contents: `
You are an AI quiz generator for EduBridge.

Generate exactly ${numberOfQuestions} multiple-choice questions about:
${topic}

Rules:
- Each question must have exactly 4 options.
- Only one option must be correct.
- Questions should be beginner-friendly.
- Avoid duplicate questions.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not include explanations.

Return exactly this format:

{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 1",
      "marks": 1
    }
  ]
}
`,
  });

  const text = response.text.trim();

  // Remove accidental markdown fences if Gemini adds them
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const data = JSON.parse(cleaned);

  return data.questions;
};

module.exports = { generateAIQuiz };