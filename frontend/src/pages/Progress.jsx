import { useEffect, useState } from "react";
import API from "../services/api";

function Progress() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first");
        setLoading(false);
        return;
      }

      const response = await API.get("/progress/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data.progress || [];

      // Keep the most recently UPDATED attempt for each lesson
      const latestProgress = {};

      data.forEach((item) => {
        const lessonId =
          typeof item.lesson === "object"
            ? item.lesson?._id
            : item.lesson;

        if (!lessonId) return;

        const currentDate = new Date(
          item.updatedAt || item.createdAt || 0
        );

        const previousDate = latestProgress[lessonId]
          ? new Date(
              latestProgress[lessonId].updatedAt ||
                latestProgress[lessonId].createdAt ||
                0
            )
          : null;

        if (
          !latestProgress[lessonId] ||
          currentDate > previousDate
        ) {
          latestProgress[lessonId] = item;
        }
      });

      setProgress(Object.values(latestProgress));
    } catch (err) {
      console.error("Progress Error:", err);
      setError("Unable to load progress");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalLessons = progress.length;

  const completedLessons = progress.filter(
    (item) => item.completed
  ).length;

  const averageScore =
    totalLessons > 0
      ? Math.round(
          progress.reduce(
            (sum, item) =>
              sum + Number(item.percentage || 0),
            0
          ) / totalLessons
        )
      : 0;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <h1 className="text-2xl font-semibold text-green-700">
          Loading Progress...
        </h1>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <h1 className="text-2xl font-semibold text-red-500">
          {error}
        </h1>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <h1 className="text-4xl font-bold text-green-700">
          📊 My Progress
        </h1>

        <p className="text-gray-600 mt-2">
          Track your latest learning progress and quiz performance.
        </p>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

          {/* Attempted */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Lessons Attempted
            </p>

            <h2 className="text-4xl font-bold text-green-600 mt-3">
              {totalLessons}
            </h2>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Lessons Completed
            </p>

            <h2 className="text-4xl font-bold text-blue-600 mt-3">
              {completedLessons}
            </h2>
          </div>

          {/* Average */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Average Score
            </p>

            <h2 className="text-4xl font-bold text-purple-600 mt-3">
              {averageScore}%
            </h2>
          </div>

        </div>

        {/* Progress List */}
        <div className="bg-white rounded-2xl shadow-md mt-10 p-6">

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Lesson Progress
          </h2>

          {progress.length === 0 ? (
            <div className="text-center py-10">

              <p className="text-gray-500 text-lg">
                No progress available yet.
              </p>

              <p className="text-gray-400 mt-2">
                Complete a quiz to see your progress here.
              </p>

            </div>
          ) : (
            <div className="space-y-5">

              {progress.map((item) => {

                const lessonName =
                  item.lesson?.lessonName?.english ||
                  item.lesson?.lessonName?.hindi ||
                  "Lesson";

                return (
                  <div
                    key={item.lesson?._id || item._id}
                    className="border rounded-xl p-5 hover:shadow-md transition"
                  >

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                      {/* Lesson */}
                      <div>
                        <h3 className="text-xl font-semibold text-green-700">
                          {lessonName}
                        </h3>

                        <p className="text-gray-500 mt-1">
                          Score: {item.score} /{" "}
                          {item.totalQuestions}
                        </p>
                      </div>

                      {/* Score */}
                      <div className="text-right">

                        <p className="text-2xl font-bold text-purple-600">
                          {item.percentage}%
                        </p>

                        <p
                          className={
                            item.completed
                              ? "text-green-600 font-semibold"
                              : "text-red-500 font-semibold"
                          }
                        >
                          {item.completed
                            ? "Completed ✅"
                            : "Not Completed"}
                        </p>

                      </div>

                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">

                        <div
                          className="bg-green-500 h-3 rounded-full"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                Number(item.percentage || 0),
                                0
                              ),
                              100
                            )}%`,
                          }}
                        />

                      </div>
                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Progress;