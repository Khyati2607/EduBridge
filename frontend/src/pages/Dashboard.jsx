import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { getRecommendations } from "../services/recommendationService";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const [recommendations, setRecommendations] = useState(null);
  const [recommendationLoading, setRecommendationLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    loadRecommendations();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const profileRes = await API.get("/auth/profile", config);
      setUser(profileRes.data.user);

      const enrollmentRes = await API.get(
        "/enrollments/my",
        config
      );

      setEnrollments(
        enrollmentRes.data.enrollments || []
      );

      const progressRes = await API.get(
        "/progress/my",
        config
      );

      const data = progressRes.data.progress || [];
      const latestProgress = {};

      data.forEach((item) => {
        const lessonId = item.lesson?._id;

        if (!lessonId) return;

        if (
          !latestProgress[lessonId] ||
          new Date(item.createdAt) >
            new Date(latestProgress[lessonId].createdAt)
        ) {
          latestProgress[lessonId] = item;
        }
      });

      setProgress(Object.values(latestProgress));
    } catch (error) {
      console.log("Dashboard Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const data = await getRecommendations();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error("Recommendation Error:", error);
    } finally {
      setRecommendationLoading(false);
    }
  };

  const coursesEnrolled = enrollments.length;

  const lessonsCompleted = progress.filter(
    (item) => item.completed
  ).length;

  const averageScore =
    progress.length > 0
      ? Math.round(
          progress.reduce(
            (sum, item) =>
              sum + (item.percentage || 0),
            0
          ) / progress.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="max-w-6xl mx-auto">

        {/* Welcome Section */}
        <h1 className="text-4xl font-bold text-green-700">
          Welcome, {user ? user.name : "Loading..."} 👋
        </h1>

        <p className="text-gray-600 mt-2">
          {user ? user.email : ""}
        </p>

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-gray-500">
              Courses Enrolled
            </h2>

            <p className="text-4xl font-bold text-green-600 mt-3">
              {loading ? "..." : coursesEnrolled}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-gray-500">
              Lessons Completed
            </h2>

            <p className="text-4xl font-bold text-blue-600 mt-3">
              {loading ? "..." : lessonsCompleted}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-gray-500">
              Average Quiz Score
            </h2>

            <p className="text-4xl font-bold text-purple-600 mt-3">
              {loading ? "..." : `${averageScore}%`}
            </p>
          </div>

        </div>

        {/* AI Assistant */}
        <div className="mt-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-7 text-white">

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            <div>
              <h2 className="text-2xl font-bold">
                🤖 EduBridge AI Learning Assistant
              </h2>

              <p className="mt-2 text-blue-100">
                Ask questions, understand concepts,
                and learn with your AI assistant.
              </p>
            </div>

            <button
              onClick={() => navigate("/ai-assistant")}
              className="bg-white text-blue-700 px-7 py-3 rounded-xl font-bold shadow-md hover:bg-blue-50 transition"
            >
              Ask AI →
            </button>

          </div>

        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-10">

          <button
            onClick={() => navigate("/offline-lessons")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md"
          >
            📥 Offline Lessons
          </button>

          <button
            onClick={() => navigate("/courses")}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md"
          >
            📚 Browse Courses
          </button>

          <button
            onClick={() => navigate("/progress")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md"
          >
            📊 My Progress
          </button>

          <button
            onClick={() => navigate("/my-courses")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md"
          >
            🎓 My Courses
          </button>

        </div>

        {/* AI Personalized Recommendations */}
        <div className="mt-10 bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-2xl font-bold text-gray-800">
            🎯 Recommended For You
          </h2>

          {recommendationLoading ? (
            <p className="text-gray-500 mt-4">
              🤖 Analyzing your learning progress...
            </p>
          ) : !recommendations ? (
            <p className="text-gray-500 mt-4">
              Complete some quizzes to get personalized
              recommendations.
            </p>
          ) : (
            <>
              <p className="text-gray-600 mt-3">
                {recommendations.summary}
              </p>

              {/* Weak Areas */}
              {recommendations.weakAreas?.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-semibold text-red-600">
                    📌 Areas to Improve
                  </h3>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {recommendations.weakAreas.map(
                      (area, index) => (
                        <span
                          key={index}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded-full"
                        >
                          {area}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Strong Areas */}
              {recommendations.strongAreas?.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-semibold text-green-600">
                    ⭐ Your Strong Areas
                  </h3>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {recommendations.strongAreas.map(
                      (area, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-full"
                        >
                          {area}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="mt-6 space-y-4">

                {recommendations.recommendations?.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="border border-blue-100 bg-blue-50 rounded-xl p-4"
                    >
                      <h3 className="font-bold text-blue-700">
                        {item.title}
                      </h3>

                      <p className="text-gray-700 mt-2">
                        <strong>Why:</strong>{" "}
                        {item.reason}
                      </p>

                      <p className="text-gray-700 mt-1">
                        <strong>Next step:</strong>{" "}
                        {item.action}
                      </p>
                    </div>
                  )
                )}

              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}

export default Dashboard;