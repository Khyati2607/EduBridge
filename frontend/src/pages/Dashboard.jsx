import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { getRecommendations } from "../services/recommendationService";
import { getOfflineProgress } from "../services/offlineStorage";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const [recommendations, setRecommendations] =
    useState(null);

  const [recommendationLoading, setRecommendationLoading] =
    useState(true);

  const [offlineMode, setOfflineMode] =
    useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    loadRecommendations();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const profileRes = await API.get(
        "/auth/profile",
        config
      );

      const currentUser =
        profileRes.data.user;

      setUser(currentUser);

      localStorage.setItem(
        "userId",
        currentUser._id
      );

      localStorage.setItem(
        "userName",
        currentUser.name
      );

      localStorage.setItem(
        "userEmail",
        currentUser.email
      );

      /* Update remembered account token */

      const savedAccounts = JSON.parse(
        localStorage.getItem(
          "eduBridgeAccounts"
        ) || "[]"
      );

      const updatedAccounts =
        savedAccounts.map(
          (account) =>
            account.id ===
            currentUser._id
              ? {
                  ...account,
                  name: currentUser.name,
                  email: currentUser.email,
                  token,
                }
              : account
        );

      localStorage.setItem(
        "eduBridgeAccounts",
        JSON.stringify(
          updatedAccounts
        )
      );

      const enrollmentRes =
        await API.get(
          "/enrollments/my",
          config
        );

      setEnrollments(
        enrollmentRes.data
          .enrollments || []
      );

      const progressRes =
        await API.get(
          "/progress/my",
          config
        );

      const data =
        progressRes.data.progress || [];

      const latestProgress = {};

      data.forEach((item) => {
        const lessonId =
          item.lesson?._id;

        if (!lessonId) return;

        if (
          !latestProgress[
            lessonId
          ] ||
          new Date(
            item.updatedAt ||
              item.createdAt
          ) >
            new Date(
              latestProgress[
                lessonId
              ].updatedAt ||
                latestProgress[
                  lessonId
                ].createdAt
            )
        ) {
          latestProgress[
            lessonId
          ] = item;
        }
      });

      const finalProgress =
        Object.values(
          latestProgress
        );

      setProgress(finalProgress);

      saveLocalProgress(
        finalProgress
      );

      setOfflineMode(false);
    } catch (error) {
      console.log(
        "Online Dashboard unavailable. Loading offline data..."
      );

      setOfflineMode(true);

      const savedName =
        localStorage.getItem(
          "userName"
        );

      const savedEmail =
        localStorage.getItem(
          "userEmail"
        );

      setUser({
        name:
          savedName || "Student",
        email:
          savedEmail || "",
      });

      try {
        const offlineProgress =
          await getOfflineProgress();

        const latestProgress = {};

        offlineProgress.forEach(
          (item) => {
            const lessonId =
              item.lesson?._id ||
              item.lesson;

            if (!lessonId) return;

            if (
              !latestProgress[
                lessonId
              ] ||
              new Date(
                item.updatedAt ||
                  item.createdAt
              ) >
                new Date(
                  latestProgress[
                    lessonId
                  ].updatedAt ||
                    latestProgress[
                      lessonId
                    ].createdAt
                )
            ) {
              latestProgress[
                lessonId
              ] = item;
            }
          }
        );

        setProgress(
          Object.values(
            latestProgress
          )
        );
      } catch (offlineError) {
        console.log(
          "Offline Progress Error:",
          offlineError
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const saveLocalProgress = (
    progressData
  ) => {
    try {
      const userId =
        localStorage.getItem(
          "userId"
        );

      if (!userId) return;

      localStorage.setItem(
        `dashboardProgress_${userId}`,
        JSON.stringify(
          progressData
        )
      );
    } catch (error) {
      console.log(
        "Local Progress Save Error:",
        error
      );
    }
  };

  const loadRecommendations =
    async () => {
      try {
        if (!navigator.onLine) {
          setRecommendationLoading(
            false
          );
          return;
        }

        const data =
          await getRecommendations();

        setRecommendations(
          data.recommendations
        );
      } catch (error) {
        console.error(
          "Recommendation Error:",
          error
        );
      } finally {
        setRecommendationLoading(
          false
        );
      }
    };

  const handleLogout = () => {
    const confirmLogout =
      window.confirm(
        "Are you sure you want to logout?"
      );

    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("offlineUser");
    localStorage.removeItem("offlineEmail");

    /*
      Remembered accounts,
      offline lessons,
      quizzes and progress
      are NOT deleted.
    */

    navigate("/login", {
      replace: true,
    });
  };

  const coursesEnrolled =
    enrollments.length;

  const lessonsCompleted =
    progress.filter(
      (item) => item.completed
    ).length;

  const averageScore =
    progress.length > 0
      ? Math.round(
          progress.reduce(
            (sum, item) =>
              sum +
              (item.percentage ||
                0),
            0
          ) /
            progress.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-green-50 p-8">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>

            <h1 className="text-4xl font-bold text-green-700">
              Welcome,{" "}
              {user
                ? user.name
                : "Loading..."}{" "}
              👋
            </h1>

            <p className="text-gray-600 mt-2">
              {user
                ? user.email
                : ""}
            </p>

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() =>
                navigate(
                  "/switch-account"
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow-md transition"
            >
              🔄 Switch Account
            </button>

            <button
              onClick={
                handleLogout
              }
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold shadow-md transition"
            >
              🚪 Logout
            </button>

          </div>

        </div>

        {/* OFFLINE STATUS */}

        {offlineMode && (
          <div className="mb-6 bg-orange-100 border border-orange-300 rounded-xl p-4">

            <p className="font-semibold text-orange-700">
              📴 Offline Mode
            </p>

            <p className="text-orange-600 text-sm mt-1">
              Backend and internet are unavailable.
              Showing your saved learning data.
            </p>

          </div>
        )}

        {/* STATISTICS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-gray-500">
              Courses Enrolled
            </h2>

            <p className="text-4xl font-bold text-green-600 mt-3">
              {loading
                ? "..."
                : coursesEnrolled}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-gray-500">
              Lessons Completed
            </h2>

            <p className="text-4xl font-bold text-blue-600 mt-3">
              {loading
                ? "..."
                : lessonsCompleted}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-gray-500">
              Average Quiz Score
            </h2>

            <p className="text-4xl font-bold text-purple-600 mt-3">
              {loading
                ? "..."
                : `${averageScore}%`}
            </p>
          </div>

        </div>

        {/* AI ASSISTANT */}

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
              onClick={() =>
                navigate(
                  "/ai-assistant"
                )
              }
              disabled={offlineMode}
              className="bg-white text-blue-700 px-7 py-3 rounded-xl font-bold shadow-md hover:bg-blue-50 transition disabled:opacity-50"
            >
              {offlineMode
                ? "🌐 Requires Internet"
                : "Ask AI →"}
            </button>

          </div>

        </div>

        {/* NAVIGATION */}

        <div className="flex flex-wrap justify-center gap-4 mt-10">

          <button
            onClick={() =>
              navigate(
                "/offline-lessons"
              )
            }
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md"
          >
            📥 Offline Lessons
          </button>

          <button
            onClick={() =>
              navigate("/courses")
            }
            disabled={offlineMode}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md disabled:opacity-50"
          >
            📚 Browse Courses
          </button>

          <button
            onClick={() =>
              navigate("/progress")
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md"
          >
            📊 My Progress
          </button>

          <button
            onClick={() =>
              navigate(
                "/my-courses"
              )
            }
            disabled={offlineMode}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md disabled:opacity-50"
          >
            🎓 My Courses
          </button>

        </div>

        {/* RECOMMENDATIONS */}

        <div className="mt-10 bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-2xl font-bold text-gray-800">
            🎯 Recommended For You
          </h2>

          {offlineMode ? (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">

              <p className="text-orange-700 font-semibold">
                📴 AI Recommendations unavailable offline
              </p>

              <p className="text-orange-600 text-sm mt-1">
                Connect to the internet to generate
                personalized AI recommendations.
              </p>

            </div>
          ) : recommendationLoading ? (
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