import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllOfflineLessons,
  deleteOfflineLesson,
} from "../services/offlineStorage";

function OfflineLessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadOfflineLessons();
  }, []);

  const loadOfflineLessons = async () => {
    try {
      const data = await getAllOfflineLessons();
      setLessons(data);
    } catch (error) {
      console.log("Offline Lessons Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeLesson = async (lessonId) => {
    const success = await deleteOfflineLesson(lessonId);

    if (success) {
      setLessons((prev) =>
        prev.filter((lesson) => lesson._id !== lessonId)
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <h1 className="text-2xl font-semibold text-green-700">
          Loading Offline Lessons...
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-8">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-green-700">
          📥 Offline Lessons
        </h1>

        <p className="text-gray-600 mt-2">
          Access your saved lessons without an internet connection.
        </p>

        {lessons.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-10 mt-8 text-center">

            <p className="text-xl text-gray-500">
              No offline lessons available.
            </p>

            <p className="text-gray-400 mt-2">
              Save a lesson using the "Save Offline" button.
            </p>

          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mt-8">

            {lessons.map((lesson) => (

              <div
                key={lesson._id}
                className="bg-white rounded-2xl shadow-md p-6"
              >

                <h2 className="text-2xl font-bold text-green-700">
                  {lesson.lessonName?.english || "Lesson"}
                </h2>

                <p className="text-gray-600 mt-3">
                  {lesson.notes?.english ||
                    "No notes available."}
                </p>

                <div className="flex gap-3 mt-6">

                  <button
                    onClick={() =>
                      navigate(`/offline-lesson/${lesson._id}`)
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl"
                  >
                    📖 Open
                  </button>

                  <button
                    onClick={() =>
                      removeLesson(lesson._id)
                    }
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl"
                  >
                    🗑 Remove
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default OfflineLessons;