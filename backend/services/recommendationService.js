const { askGemini } = require("./aiService");

const generateRecommendations = async (progress) => {
  const performance = progress.map((item) => ({
    lesson:
      item.lesson?.lessonName?.english ||
      "Unknown Lesson",
    score: item.percentage,
    completed: item.completed,
  }));

  const prompt = `
Analyze this student's learning performance:

${JSON.stringify(performance, null, 2)}

Create a personalized learning recommendation.

Rules:
- Identify weak areas from lower scores.
- Identify areas where the student is doing well.
- Recommend specific lessons or topics to practice.
- Keep recommendations beginner-friendly.
- Give practical next steps.
- Do not invent lesson names that are not present in the data when referring to existing lessons.
- Return ONLY valid JSON.

Return exactly:

{
  "summary": "Short summary of the student's performance",
  "weakAreas": ["area 1", "area 2"],
  "strongAreas": ["area 1", "area 2"],
  "recommendations": [
    {
      "title": "Recommendation title",
      "reason": "Why this is recommended",
      "action": "What the student should do next"
    }
  ]
}
`;

  const response = await askGemini(prompt);

  const cleaned = response
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned);
};

module.exports = { generateRecommendations };