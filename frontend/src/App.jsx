import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import AIAssistant from "./pages/AIAssistant";
import MyCourses from "./pages/MyCourses";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Lessons from "./pages/Lessons";
import Quiz from "./pages/Quiz";
import Progress from "./pages/Progress";
import Splash from "./pages/Splash";
import LanguageSelection from "./pages/LanguageSelection";
import OfflineLessons from "./pages/OfflineLessons";
import OfflineLesson from "./pages/OfflineLesson";
import OfflineIndicator from "./components/OfflineIndicator";

import { syncOfflineProgress } from "./services/syncService";

function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const hideBack = ["/", "/login", "/register"].includes(location.pathname);

  if (hideBack) return null;

  return (
    <div className="sticky top-0 z-40 bg-white border-b shadow-sm px-4 py-3 flex items-center gap-3">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
      >
        ← Back
      </button>

      <h1 className="text-lg font-bold text-green-600">
        EduBridge
      </h1>
    </div>
  );
}

function AppContent() {
  useEffect(() => {
    syncOfflineProgress();

    const handleOnline = () => {
      console.log("🌐 Internet restored. Starting sync...");
      syncOfflineProgress();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <>
      <OfflineIndicator />
      <NavigationBar />

      <Routes>
        <Route path="/" element={<Splash />} />

        <Route path="/my-courses" element={<MyCourses />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/courses" element={<Courses />} />

        <Route path="/offline-lessons" element={<OfflineLessons />} />

        <Route
          path="/offline-lesson/:lessonId"
          element={<OfflineLesson />}
        />

        <Route
          path="/language/:courseId"
          element={<LanguageSelection />}
        />

        <Route
          path="/lessons/:courseId/:language"
          element={<Lessons />}
        />

        <Route
          path="/quiz/:lessonId"
          element={<Quiz />}
        />

        <Route
          path="/ai-assistant"
          element={<AIAssistant />}
        />

        <Route
          path="/progress"
          element={<Progress />}
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;