import { useEffect, useState } from "react";
import API from "../services/api";
import { getUnsyncedProgress } from "../services/offlineStorage";

function Progress() {
  const [progress, setProgress] = useState([]);
  const [offlineProgress, setOfflineProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProgress();

    const handleOnline = () => {
      fetchProgress();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
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

      const pending = await getUnsyncedProgress();
      setOfflineProgress(pending);
    } catch (err) {
      console.error("Progress Error:", err);

      try {
        const pending = await getUnsyncedProgress();
        setOfflineProgress(pending);
      } catch (offlineError) {
        console.log("Offline Progress Error:", offlineError);
      }

      setError("Unable to load progress");
    } finally {
      setLoading(false);
    }
  };

  const allProgress = [
    ...progress,
    ...offlineProgress.map((item) => ({
      ...item,
      offline: true,
    })),
  ];

  const totalLessons = allProgress.length;

  const completedLessons = allProgress.filter((item) => {
    const percentage = Number(item.percentage || 0);

    return item.offline
      ? percentage >= 60
      : item.completed;
  }).length;

  const averageScore =
    totalLessons > 0
      ? Math.round(
          allProgress.reduce(
            (sum, item) =>
              sum + Number(item.percentage || 0),
            0
          ) / totalLessons
        )
      : 0;

  const completionPercentage =
    totalLessons > 0
      ? Math.round(
          (completedLessons / totalLessons) * 100
        )
      : 0;

  const strongLessons = allProgress.filter(
    (item) => Number(item.percentage || 0) >= 80
  );

  const weakLessons = allProgress.filter(
    (item) => Number(item.percentage || 0) < 60
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <h1 className="text-2xl font-semibold text-green-700">
          Loading Progress...
        </h1>
      </div>
    );
  }

  if (
    error &&
    progress.length === 0 &&
    offlineProgress.length === 0
  ) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <h1 className="text-2xl font-semibold text-red-500">
          {error}
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <h1 className="text-4xl font-bold text-green-700">
          📊 My Progress
        </h1>

        <p className="text-gray-600 mt-2">
          Track your latest learning progress and quiz performance.
        </p>

        {/* Offline Warning */}
        {offlineProgress.length > 0 && (
          <div className="mt-6 bg-orange-100 border border-orange-300 rounded-xl p-4">
            <p className="text-orange-700 font-semibold">
              🟠 {offlineProgress.length} offline result
              {offlineProgress.length > 1 ? "s" : ""} waiting to sync
            </p>

            <p className="text-orange-600 text-sm mt-1">
              Your results will automatically sync when internet connection returns.
            </p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">

          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Lessons Attempted
            </p>

            <h2 className="text-4xl font-bold text-green-600 mt-3">
              {totalLessons}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Lessons Completed
            </p>

            <h2 className="text-4xl font-bold text-blue-600 mt-3">
              {completedLessons}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Average Score
            </p>

            <h2 className="text-4xl font-bold text-purple-600 mt-3">
              {averageScore}%
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <p className="text-gray-500">
              Completion
            </p>

            <h2 className="text-4xl font-bold text-orange-500 mt-3">
              {completionPercentage}%
            </h2>
          </div>

        </div>

        {/* Performance Overview */}
        {allProgress.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md mt-10 p-6">

            <h2 className="text-2xl font-bold text-gray-800">
              📈 Performance Overview
            </h2>

            <div className="mt-6">

              <div className="flex justify-between mb-2">
                <span className="text-gray-600">
                  Overall Completion
                </span>

                <span className="font-bold text-green-600">
                  {completionPercentage}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all"
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

              {/* Strong Areas */}
              <div className="border border-green-200 bg-green-50 rounded-xl p-5">
                <h3 className="text-lg font-bold text-green-700">
                  🟢 Strong Areas
                </h3>

                {strongLessons.length === 0 ? (
                  <p className="text-gray-500 mt-3">
                    Keep practicing to build strong areas.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {strongLessons.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between bg-white rounded-lg p-3"
                      >
                        <span>
                          {item.offline
                            ? "Offline Lesson"
                            : item.lesson?.lessonName?.english ||
                              "Lesson"}
                        </span>

                        <span className="font-bold text-green-600">
                          {Number(item.percentage || 0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Weak Areas */}
              <div className="border border-red-200 bg-red-50 rounded-xl p-5">
                <h3 className="text-lg font-bold text-red-700">
                  🔴 Areas to Improve
                </h3>

                {weakLessons.length === 0 ? (
                  <p className="text-gray-500 mt-3">
                    Great job! No weak areas right now.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {weakLessons.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between bg-white rounded-lg p-3"
                      >
                        <span>
                          {item.offline
                            ? "Offline Lesson"
                            : item.lesson?.lessonName?.english ||
                              "Lesson"}
                        </span>

                        <span className="font-bold text-red-600">
                          {Number(item.percentage || 0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Lesson Progress */}
        <div className="bg-white rounded-2xl shadow-md mt-10 p-6">

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Lesson Progress
          </h2>

          {allProgress.length === 0 ? (
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

              {allProgress.map((item, index) => {

                const lessonName =
                  item.offline
                    ? "Offline Lesson"
                    : item.lesson?.lessonName?.english ||
                      item.lesson?.lessonName?.hindi ||
                      "Lesson";

                const percentage = Math.min(
                  Math.max(
                    Number(item.percentage || 0),
                    0
                  ),
                  100
                );

                const completed =
                  item.offline
                    ? percentage >= 60
                    : item.completed;

                return (
                  <div
                    key={
                      item.offline
                        ? item.id
                        : item.lesson?._id ||
                          item._id ||
                          index
                    }
                    className="border rounded-xl p-5 hover:shadow-md transition"
                  >

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                      <div>
                        <div className="flex items-center gap-3 flex-wrap">

                          <h3 className="text-xl font-semibold text-green-700">
                            {lessonName}
                          </h3>

                          {item.offline && (
                            <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                              🟠 Pending Sync
                            </span>
                          )}

                        </div>

                        <p className="text-gray-500 mt-1">
                          Score: {item.score} /{" "}
                          {item.totalQuestions}
                        </p>
                      </div>

                      <div className="text-right">

                        <p className="text-2xl font-bold text-purple-600">
                          {percentage}%
                        </p>

                        <p
                          className={
                            completed
                              ? "text-green-600 font-semibold"
                              : "text-red-500 font-semibold"
                          }
                        >
                          {completed
                            ? "Completed ✅"
                            : "Not Completed"}
                        </p>

                      </div>

                    </div>

                    <div className="mt-4">

                      <div className="w-full bg-gray-200 rounded-full h-3">

                        <div
                          className="bg-green-500 h-3 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
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