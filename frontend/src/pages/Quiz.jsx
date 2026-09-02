import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  saveQuizOffline,
  getOfflineQuiz,
  saveOfflineProgress,
} from "../services/offlineStorage";

function Quiz() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchQuiz();
  }, [lessonId]);

  const fetchQuiz = async () => {
    setLoading(true);

    // OFFLINE
    if (!navigator.onLine) {
      console.log("Internet unavailable. Loading offline quiz...");

      const offlineQuiz = await getOfflineQuiz(lessonId);

      if (offlineQuiz && offlineQuiz.length > 0) {
        setQuestions(offlineQuiz);
        setOffline(true);
      } else {
        setMessage(
          "This quiz has not been downloaded for offline use."
        );
      }

      setLoading(false);
      return;
    }

    // ONLINE
    try {
      const res = await API.get(`/quizzes/${lessonId}`);

      const quiz = res.data.quiz || [];

      setQuestions(quiz);

      // Save quiz locally for future offline use
      if (quiz.length > 0) {
        await saveQuizOffline(lessonId, quiz);
      }

      setOffline(false);
    } catch (error) {
      console.log(
        "Online quiz failed. Trying offline..."
      );

      const offlineQuiz = await getOfflineQuiz(lessonId);

      if (offlineQuiz && offlineQuiz.length > 0) {
        setQuestions(offlineQuiz);
        setOffline(true);
      } else {
        setMessage(
          "Unable to load quiz. Please connect to the internet first."
        );
      }
    } finally {
      setLoading(false);
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
    if (questions.length === 0) return;

    let marks = 0;

    console.log("QUESTIONS:", questions);
    console.log("ANSWERS:", answers);

    questions.forEach((q) => {
      console.log(
        "Question:",
        q.question,
        "Selected:",
        answers[q._id],
        "Correct:",
        q.correctAnswer
      );

      if (
        String(answers[q._id]).trim() ===
        String(q.correctAnswer).trim()
      ) {
        marks++;
      }
    });

    const percentage = Math.round(
      (marks / questions.length) * 100
    );
    console.log("FINAL MARKS:", marks);
console.log("FINAL PERCENTAGE:", percentage);
    setScore(marks);
    setSubmitted(true);

    const progressData = {
      lesson: lessonId,
      score: marks,
      totalQuestions: questions.length,
      percentage,
    };

    // ACTUALLY OFFLINE
    if (!navigator.onLine) {
      const saved = await saveOfflineProgress(progressData);

      if (saved) {
        setMessage(
          "💾 Result saved offline. It will sync when internet returns."
        );
      }

      return;
    }

    // ONLINE
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login again.");
        return;
      }

      await API.post(
        "/progress",
        progressData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        "✅ Progress saved successfully!"
      );
    } catch (error) {
      console.log(
        "Online progress failed:",
        error
      );

      // Save locally if server unavailable
      const saved = await saveOfflineProgress(
        progressData
      );

      if (saved) {
        setMessage(
          "💾 Server unavailable. Result saved offline for sync."
        );
      }
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setScore(0);
    setSubmitted(false);
    setMessage("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <h1 className="text-2xl font-semibold text-green-700">
          Loading Quiz...
        </h1>
      </div>
    );
  }

  if (message && questions.length === 0) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">

          <h1 className="text-2xl font-bold text-red-500">
            Quiz Unavailable
          </h1>

          <p className="text-gray-600 mt-3">
            {message}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl"
          >
            ← Go Back
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">

        <div className="flex justify-between items-center mb-8">

          <h1 className="text-3xl font-bold text-green-700">
            📝 Quiz
          </h1>

          {offline && (
            <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold">
              📥 Offline Mode
            </span>
          )}

        </div>

        {questions.map((q, index) => (
          <div
            key={q._id}
            className="mb-8"
          >

            <h2 className="font-semibold text-lg mb-4">
              {index + 1}. {q.question}
            </h2>

            {q.options.map((option) => (
              <label
                key={option}
                className={`block border rounded-lg p-3 mb-2 cursor-pointer ${
                  submitted
                    ? String(option).trim() ===
                      String(q.correctAnswer).trim()
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
                  checked={
                    answers[q._id] === option
                  }
                  disabled={submitted}
                  onChange={() =>
                    handleOption(
                      q._id,
                      option
                    )
                  }
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
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
          >
            Submit Quiz
          </button>
        ) : (
          <div className="text-center">

            <h2 className="text-3xl font-bold text-green-700">
              Score: {score} / {questions.length}
            </h2>

            <p className="text-xl mt-3">
              Percentage:{" "}
              {Math.round(
                (score / questions.length) * 100
              )}
              %
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

            {message && (
              <p className="text-blue-600 mt-4">
                {message}
              </p>
            )}

            <button
              onClick={resetQuiz}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
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