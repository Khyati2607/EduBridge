import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function Quiz() {
  const { lessonId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      const res = await API.get(`/quizzes/${lessonId}`);
      setQuestions(res.data.quiz);
    } catch (error) {
      console.log(error);
    }
  };

  const handleOption = (questionId, option) => {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const submitQuiz = async () => {
    let marks = 0;

    questions.forEach((q) => {
      if (answers[q._id] === q.correctAnswer) {
        marks++;
      }
    });

    setScore(marks);
    setSubmitted(true);

    const percentage = Math.round((marks / questions.length) * 100);

    try {
      await API.post("/progress", {
        student: localStorage.getItem("userId"),
        lesson: lessonId,
        score: marks,
        totalQuestions: questions.length,
        percentage,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setScore(0);
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-green-700 mb-8">
          Quiz
        </h1>

        {questions.map((q, index) => (
          <div key={q._id} className="mb-8">

            <h2 className="font-semibold text-lg mb-4">
              {index + 1}. {q.question}
            </h2>

            {q.options.map((option) => (
              <label
                key={option}
                className={`block border rounded-lg p-3 mb-2 cursor-pointer
                ${
                  submitted
                    ? option === q.correctAnswer
                      ? "bg-green-200 border-green-600"
                      : answers[q._id] === option
                      ? "bg-red-200 border-red-600"
                      : ""
                    : "hover:bg-green-100"
                }`}
              >
                <input
                  type="radio"
                  name={q._id}
                  value={option}
                  checked={answers[q._id] === option}
                  disabled={submitted}
                  onChange={() => handleOption(q._id, option)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}

          </div>
        ))}

        {!submitted ? (
          <button
            onClick={submitQuiz}
            className="bg-green-600 text-white px-6 py-3 rounded-xl"
          >
            Submit Quiz
          </button>
        ) : (
          <div className="text-center">

            <h2 className="text-3xl font-bold text-green-700">
              Score: {score} / {questions.length}
            </h2>

            <p className="text-xl mt-3">
              Percentage: {Math.round((score / questions.length) * 100)}%
            </p>

            <h3
              className={`mt-4 text-2xl font-bold ${
                score >= questions.length * 0.6
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {score >= questions.length * 0.6
                ? "🎉 Passed"
                : "❌ Try Again"}
            </h3>

            <button
              onClick={resetQuiz}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl"
            >
              Try Again
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

export default Quiz;