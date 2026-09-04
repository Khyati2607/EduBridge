import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { getRecommendations } from "../services/recommendationService";
import { getOfflineProgress } from "../services/offlineStorage";

const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || payload._id || null;
  } catch {
    return null;
  }
};

const saveLocalProgress = (progress) => {
  localStorage.setItem(
    "dashboardProgress",
    JSON.stringify(progress)
  );
};

const getLocalProgress = () => {
  try {
    return JSON.parse(
      localStorage.getItem("dashboardProgress") || "[]"
    );
  } catch {
    return [];
  }
};

const getLocalEnrollments = () => {
  try {
    return JSON.parse(
      localStorage.getItem("dashboardEnrollments") || "[]"
    );
  } catch {
    return [];
  }
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: localStorage.getItem("userName") || "Student",
    email: localStorage.getItem("userEmail") || "",
  });

  const [enrollments, setEnrollments] = useState(
    getLocalEnrollments()
  );

  const [progress, setProgress] = useState(
    getLocalProgress()
  );

  const [recommendations, setRecommendations] = useState(null);
  const [recommendationLoading, setRecommendationLoading] =
    useState(false);

  const [offlineMode, setOfflineMode] = useState(
    !navigator.onLine
  );

  useEffect(() => {
    initializeDashboard();

    const handleOnline = () => {
      setOfflineMode(false);
      fetchOnlineData();
    };

    const handleOffline = () => {
      setOfflineMode(true);
      loadOfflineData();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const initializeDashboard = async () => {
    /*
      IMPORTANT:
      Restore userId before accessing IndexedDB.
    */

    let userId = localStorage.getItem("userId");

    if (!userId) {
      userId = getUserIdFromToken();

      if (userId) {
        localStorage.setItem("userId", userId);
      }
    }

    /*
      FIRST:
      Show cached/local data immediately.
    */
    await loadOfflineData();

    /*
      SECOND:
      If internet is available, update data from backend.
      Backend failure will NOT prevent dashboard loading.
    */
    if (navigator.onLine) {
      fetchOnlineData();
    } else {
      setOfflineMode(true);
    }
  };

  const loadOfflineData = async () => {
    try {
      // Load cached progress
      const localProgress = getLocalProgress();

      let offlineProgress = [];

      try {
        offlineProgress = await getOfflineProgress();
      } catch {
        offlineProgress = [];
      }

      const combined = [
        ...localProgress,
        ...offlineProgress,
      ];

      /*
        Remove duplicate progress records
        and keep the latest one for each lesson.
      */
      const progressMap = new Map();

      combined.forEach((item) => {
        const lessonId =
          item.lesson?._id ||
          item.lesson ||
          item.lessonId ||
          item._id;

        if (!lessonId) return;

        const key = String(lessonId);
        const existing = progressMap.get(key);

        const currentDate = new Date(
          item.updatedAt ||
            item.createdAt ||
            0
        );

        const existingDate = existing
          ? new Date(
              existing.updatedAt ||
                existing.createdAt ||
                0
            )
          : new Date(0);

        if (
          !existing ||
          currentDate >= existingDate
        ) {
          progressMap.set(key, item);
        }
      });

      const finalProgress =
        Array.from(progressMap.values());

      setProgress(finalProgress);

      saveLocalProgress(finalProgress);

      console.log(
        "📦 Offline dashboard data loaded:",
        finalProgress
      );
    } catch (error) {
      console.log(
        "Offline dashboard loading error:",
        error
      );
    }
  };

  const fetchOnlineData = async () => {
    try {
      const token = localStorage.getItem("token");

      /*
        No token means we stay offline.
      */
      if (!token) {
        setOfflineMode(true);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      };

      /*
        Backend requests happen AFTER local data
        has already been displayed.
      */
      const [
        profileRes,
        enrollmentRes,
        progressRes,
      ] = await Promise.all([
        API.get("/auth/profile", config),
        API.get("/enrollments/my", config),
        API.get("/progress/my", config),
      ]);

      // USER
      const profile =
        profileRes.data.user ||
        profileRes.data;

      const name =
        profile.name || "Student";

      const email =
        profile.email || "";

      setUser({
        name,
        email,
      });

      localStorage.setItem(
        "userName",
        name
      );

      localStorage.setItem(
        "userEmail",
        email
      );

      if (profile._id) {
        localStorage.setItem(
          "userId",
          profile._id
        );
      }

      // ENROLLMENTS
      const enrollmentData =
        enrollmentRes.data.enrollments ||
        enrollmentRes.data ||
        [];

      setEnrollments(enrollmentData);

      localStorage.setItem(
        "dashboardEnrollments",
        JSON.stringify(enrollmentData)
      );

      // PROGRESS
      const onlineProgress =
        progressRes.data.progress ||
        progressRes.data ||
        [];

      const progressMap = new Map();

      onlineProgress.forEach((item) => {
        const lessonId =
          item.lesson?._id ||
          item.lesson ||
          item.lessonId;

        if (!lessonId) return;

        const key = String(lessonId);
        const existing = progressMap.get(key);

        if (!existing) {
          progressMap.set(key, item);
          return;
        }

        const currentDate = new Date(
          item.updatedAt ||
            item.createdAt ||
            0
        );

        const existingDate = new Date(
          existing.updatedAt ||
            existing.createdAt ||
            0
        );

        if (
          currentDate >= existingDate
        ) {
          progressMap.set(key, item);
        }
      });

      const finalProgress =
        Array.from(progressMap.values());

      setProgress(finalProgress);

      saveLocalProgress(finalProgress);

      setOfflineMode(false);

      console.log(
        "🌐 Online dashboard data loaded"
      );

      fetchRecommendations();

    } catch (error) {
      /*
        Backend unavailable:
        KEEP the local data already displayed.
      */
      console.log(
        "📡 Backend unavailable. Staying in offline mode."
      );

      setOfflineMode(true);

      await loadOfflineData();
    }
  };

  const fetchRecommendations = async () => {
    try {
      setRecommendationLoading(true);

      const data =
        await getRecommendations();

      setRecommendations(data);

    } catch (error) {
      console.log(
        "Recommendation unavailable."
      );

      setRecommendations(null);

    } finally {
      setRecommendationLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    navigate("/login");
  };

  const handleSwitchAccount = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    navigate("/login");
  };

  const lessonsCompleted =
    progress.filter(
      (item) =>
        item.completed === true ||
        Number(item.percentage || 0) >= 60
    ).length;

  const averageScore =
    progress.length > 0
      ? Math.round(
          progress.reduce(
            (sum, item) =>
              sum +
              Number(
                item.percentage ??
                  item.score ??
                  0
              ),
            0
          ) / progress.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-green-50">

      {/* HEADER */}
      <header className="bg-white border-b px-4 py-4 flex justify-between items-center">

        <h1 className="text-2xl font-bold text-green-600">
          EduBridge
        </h1>

        <div className="flex gap-2">

          <button
            onClick={handleSwitchAccount}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
          >
            🔄 Switch Account
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
          >
            🚪 Logout
          </button>

        </div>

      </header>

      <main className="p-4 max-w-7xl mx-auto">

        {/* WELCOME */}
        <div className="mb-6">

          <h2 className="text-3xl font-bold text-green-700">
            Welcome, {user.name} 👋
          </h2>

          {offlineMode && (
            <p className="text-orange-600 mt-2 font-medium">
              📡 Offline Mode — showing your saved learning data
            </p>
          )}

        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="bg-white p-6 rounded-xl shadow">

            <p className="text-gray-500">
              Courses Enrolled
            </p>

            <p className="text-3xl font-bold text-green-600 mt-2">
              {enrollments.length}
            </p>

          </div>

          <div className="bg-white p-6 rounded-xl shadow">

            <p className="text-gray-500">
              Lessons Completed
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              {lessonsCompleted}
            </p>

          </div>

          <div className="bg-white p-6 rounded-xl shadow">

            <p className="text-gray-500">
              Average Quiz Score
            </p>

            <p className="text-3xl font-bold text-purple-600 mt-2">
              {averageScore}%
            </p>

          </div>

        </div>

        {/* AI ASSISTANT */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow mb-6 flex justify-between items-center">

          <div>

            <h2 className="text-2xl font-bold">
              🤖 EduBridge AI Learning Assistant
            </h2>

            <p className="mt-2">
              Ask questions, understand concepts, and learn with your AI assistant.
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/ai-assistant")
            }
            disabled={offlineMode}
            className={`px-6 py-3 rounded-lg font-bold ${
              offlineMode
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-white text-blue-600"
            }`}
          >
            Ask AI →
          </button>

        </div>

        {/* NAVIGATION */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">

          <button
            onClick={() =>
              navigate("/offline-lessons")
            }
            className="bg-orange-500 text-white p-4 rounded-xl font-bold"
          >
            📚 Offline Lessons
          </button>

          <button
            onClick={() =>
              navigate("/courses")
            }
            disabled={offlineMode}
            className={`p-4 rounded-xl font-bold text-white ${
              offlineMode
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600"
            }`}
          >
            📚 Browse Courses
          </button>

          <button
            onClick={() =>
              navigate("/progress")
            }
            className="bg-blue-600 text-white p-4 rounded-xl font-bold"
          >
            📊 My Progress
          </button>

          <button
            onClick={() =>
              navigate("/my-courses")
            }
            disabled={offlineMode}
            className={`p-4 rounded-xl font-bold text-white ${
              offlineMode
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600"
            }`}
          >
            🎓 My Courses
          </button>

        </div>

        {/* RECOMMENDATIONS */}
        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-2xl font-bold text-gray-800">
            🎯 Recommended For You
          </h2>

          {offlineMode ? (

            <p className="text-orange-600 mt-3">
              📡 AI recommendations are unavailable offline.
              Your saved learning data is still available.
            </p>

          ) : recommendationLoading ? (

            <p className="text-gray-500 mt-3">
              🤖 Analyzing your learning progress...
            </p>

          ) : recommendations ? (

            <div className="mt-4">

              {recommendations.summary && (
                <p className="text-gray-600 mb-4">
                  {recommendations.summary}
                </p>
              )}

              {recommendations.recommendations?.length > 0 && (

                <div className="space-y-3">

                  {recommendations.recommendations.map(
                    (recommendation, index) => (

                      <div
                        key={index}
                        className="p-4 bg-green-50 rounded-lg"
                      >

                        <p className="font-semibold text-green-700">
                          {recommendation}
                        </p>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          ) : (

            <p className="text-gray-500 mt-3">
              No recommendations available yet.
            </p>

          )}

        </div>

      </main>

    </div>
  );
};

export default Dashboard;