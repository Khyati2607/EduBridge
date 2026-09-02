import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

function App() {
  useEffect(() => {
    // Try syncing when the app starts
    syncOfflineProgress();

    // Try syncing when internet comes back
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
    <BrowserRouter>

      {/* Online / Offline Indicator */}
      <OfflineIndicator />

      <Routes>

        <Route path="/" element={<Splash />} />

        <Route
          path="/my-courses"
          element={<MyCourses />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/courses"
          element={<Courses />}
        />

        <Route
          path="/offline-lessons"
          element={<OfflineLessons />}
        />

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
          path="/progress"
          element={<Progress />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;