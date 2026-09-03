import { useState } from "react";
import { askAI } from "../services/aiService";

const AIAssistant = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const data = await askAI(question);
      setAnswer(data.answer);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Unable to connect to AI Assistant."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🤖 EduBridge AI Assistant
          </h1>

          <p className="text-gray-600 mt-2">
            Ask anything about your learning.
          </p>

          <div className="mt-6">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your question here..."
              className="w-full border border-gray-300 rounded-xl p-4 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleAsk}
              disabled={loading || !question.trim()}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Thinking..." : "Ask AI"}
            </button>
          </div>

          {error && (
            <div className="mt-5 bg-red-100 text-red-700 p-4 rounded-xl">
              {error}
            </div>
          )}

          {answer && (
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h2 className="font-semibold text-lg text-gray-800 mb-3">
                AI Answer
              </h2>

              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {answer}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AIAssistant;