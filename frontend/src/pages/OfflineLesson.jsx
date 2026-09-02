import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getOfflineLesson,
  getOfflineQuiz,
} from "../services/offlineStorage";

function OfflineLesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      const lessonData = await getOfflineLesson(lessonId);
      const quizData = await getOfflineQuiz(lessonId);

      setLesson(lessonData);
      setQuiz(quizData);
    } catch (error) {
      console.log("Offline Lesson Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <h1 className="text-2xl text-green-700">
          Loading Offline Lesson...
        </h1>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl text-red-500 font-semibold text-center">
          Lesson not found offline.
        </h1>

        <p className="text-gray-500 mt-2 text-center">
          Please save this lesson for offline use first.
        </p>

        <button
          onClick={() => navigate("/offline-lessons")}
          className="mt-5 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
        >
          ← Back to Offline Lessons
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-8">

      <div className="max-w-4xl mx-auto">

        {/* Offline indicator */}
        <div className="bg-orange-100 border border-orange-300 rounded-xl p-4 mb-6">
          <p className="text-orange-700 font-semibold">
            📥 Offline Mode
          </p>

          <p className="text-orange-600 text-sm mt-1">
            You are viewing a saved lesson. Internet connection is not required.
          </p>
        </div>

        {/* Lesson Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Lesson title */}
          <p className="text-sm font-semibold text-green-600">
            Saved Lesson
          </p>

          <h1 className="text-4xl font-bold text-green-700 mt-2">
            {lesson.lessonName?.english || "Lesson"}
          </h1>

          {/* English Notes */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold">
              📖 Notes
            </h2>

            <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">
              {lesson.notes?.english ||
                "No English notes available."}
            </p>
          </div>

          {/* Hindi Notes */}
          {lesson.notes?.hindi && (
            <div className="mt-10 border-t pt-8">
              <h2 className="text-2xl font-semibold">
                📖 हिंदी नोट्स
              </h2>

              <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">
                {lesson.notes.hindi}
              </p>
            </div>
          )}

          {/* Video information */}
          <div className="mt-8 bg-gray-50 rounded-xl p-5">
            <p className="text-gray-600 font-semibold">
              🎥 Video
            </p>

            <p className="text-gray-500 text-sm mt-2">
              Videos require an internet connection unless
              they have been separately downloaded to the device.
            </p>
          </div>

          {/* Offline Quiz */}
          {quiz && quiz.length > 0 && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-blue-700">
                📝 Offline Quiz
              </h2>

              <p className="text-gray-600 mt-2">
                This quiz is available without an internet connection.
              </p>

              <button
                onClick={() => navigate(`/quiz/${lessonId}`)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
              >
                📝 Take Quiz
              </button>
            </div>
          )}

          {/* No quiz available */}
          {(!quiz || quiz.length === 0) && (
            <div className="mt-8 bg-gray-50 rounded-xl p-5">
              <p className="text-gray-500">
                📝 Quiz has not been downloaded for this lesson.
              </p>
            </div>
          )}

          {/* Back button */}
          <button
            onClick={() => navigate("/offline-lessons")}
            className="mt-10 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl"
          >
            ← Back to Offline Lessons
          </button>

        </div>

      </div>

    </div>
  );
}

export default OfflineLesson;