import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

import {
  saveLessonOffline,
  saveQuizOffline,
} from "../services/offlineStorage";

function Lessons() {
  const { courseId, language } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [offlineLessons, setOfflineLessons] = useState([]);
  const [lessonProgress, setLessonProgress] = useState({});
  const [coursePercentage, setCoursePercentage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  const fetchLessons = async () => {
    try {
      // Get lessons
      const lessonRes = await API.get(`/lessons/${courseId}`);

      const sortedLessons = (lessonRes.data.lessons || []).sort(
        (a, b) => a.order - b.order
      );

      setLessons(sortedLessons);

      // Get course progress
      try {
        const token = localStorage.getItem("token");

        if (token) {
          const progressRes = await API.get(
            `/progress/my/course/${courseId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = progressRes.data;

          setCoursePercentage(data.coursePercentage || 0);

          const progressMap = {};

          (data.lessons || []).forEach((item) => {
            if (item.lesson?._id) {
              progressMap[item.lesson._id] = item;
            }
          });

          setLessonProgress(progressMap);
        }
      } catch (progressError) {
        console.log(
          "Course Progress Error:",
          progressError
        );
      }
    } catch (error) {
      console.log("Lessons Error:", error);
      setError("Unable to load lessons");
    } finally {
      setLoading(false);
    }
  };

  // Save lesson + quiz for offline use
  const downloadLesson = async (lesson) => {
    try {
      // Save lesson
      const lessonSuccess = await saveLessonOffline(lesson);

      if (!lessonSuccess) {
        alert("Unable to save lesson offline.");
        return;
      }

      // Save quiz
      try {
        const quizRes = await API.get(
          `/quizzes/${lesson._id}`
        );

        const quiz = quizRes.data.quiz || [];

        if (quiz.length > 0) {
          const quizSuccess = await saveQuizOffline(
            lesson._id,
            quiz
          );

          if (!quizSuccess) {
            console.log(
              "Quiz could not be saved offline."
            );
          }
        }
      } catch (quizError) {
        console.log(
          "Offline Quiz Download Error:",
          quizError
        );
      }

      // Update button
      setOfflineLessons((prev) => {
        if (prev.includes(lesson._id)) {
          return prev;
        }

        return [...prev, lesson._id];
      });

      alert(
        "Lesson and quiz saved for offline use! 📥"
      );
    } catch (error) {
      console.log(
        "Download Lesson Error:",
        error
      );

      alert(
        "Unable to save lesson offline."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <h1 className="text-2xl font-semibold text-green-700">
          Loading Lessons...
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <h1 className="text-2xl font-semibold text-red-500">
          {error}
        </h1>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <h1 className="text-2xl text-gray-600">
          No lessons available for this course.
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="max-w-5xl mx-auto">

        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-700">
            📚 Course Lessons
          </h1>

          <p className="text-gray-600 mt-2">
            Language:{" "}
            <span className="font-semibold">
              {language}
            </span>
          </p>
        </div>

        {/* Course Progress */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">

            <h2 className="text-xl font-bold text-gray-700">
              📊 Course Progress
            </h2>

            <span className="text-xl font-bold text-green-600">
              {coursePercentage}%
            </span>

          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
            <div
              className="bg-green-500 h-4 rounded-full transition-all duration-500"
              style={{
                width: `${coursePercentage}%`,
              }}
            />
          </div>

          <p className="text-gray-500 mt-2">
            {
              Object.values(lessonProgress).filter(
                (item) => item.completed
              ).length
            }{" "}
            of {lessons.length} lessons completed
          </p>
        </div>

        {/* Lessons */}
        {lessons.map((lesson, index) => {

          const lessonTitle =
            language === "Hindi"
              ? lesson.lessonName?.hindi
              : lesson.lessonName?.english;

          const lessonNotes =
            language === "Hindi"
              ? lesson.notes?.hindi
              : lesson.notes?.english;

          const lessonVideo =
            language === "Hindi"
              ? lesson.videoHindi
              : lesson.videoEnglish;

          const previousLesson =
            lessons[index - 1];

          const nextLesson =
            lessons[index + 1];

          const progress =
            lessonProgress[lesson._id];

          const completed =
            progress?.completed || false;

          return (
            <div
              id={`lesson-${lesson._id}`}
              key={lesson._id}
              className="bg-white shadow-lg rounded-2xl p-8 mb-8"
            >

              {/* Lesson Header */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">

                <div>

                  <p className="text-sm font-semibold text-green-600">
                    Lesson {index + 1} of {lessons.length}
                  </p>

                  <h2 className="text-3xl font-bold text-green-700 mt-2">
                    {lessonTitle || "Lesson"}
                  </h2>

                </div>

                {/* Completion Status */}
                <div>

                  {completed ? (
                    <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                      ✅ Completed
                    </span>
                  ) : (
                    <span className="inline-block bg-gray-100 text-gray-500 px-4 py-2 rounded-full font-semibold">
                      ⭕ Not Completed
                    </span>
                  )}

                </div>

              </div>

              {/* Quiz Score */}
              {progress && (
                <div className="mt-4 bg-purple-50 rounded-xl p-4">

                  <p className="text-purple-700 font-semibold">
                    📝 Latest Quiz Score:{" "}
                    {progress.score}/
                    {progress.totalQuestions}
                  </p>

                  <p className="text-purple-600">
                    {progress.percentage}%
                  </p>

                </div>
              )}

              {/* Notes */}
              <div className="mt-8">

                <h3 className="text-xl font-semibold">
                  📖 Notes
                </h3>

                <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">
                  {lessonNotes ||
                    "No notes available."}
                </p>

              </div>

              {/* Video */}
              {lessonVideo && (
                <a
                  href={lessonVideo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-8 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl"
                >
                  ▶ Watch Video
                </a>
              )}

              {/* Buttons */}
              <div className="flex flex-wrap gap-4 mt-10">

                {/* Previous */}
                {previousLesson && (
                  <button
                    onClick={() =>
                      document
                        .getElementById(
                          `lesson-${previousLesson._id}`
                        )
                        ?.scrollIntoView({
                          behavior: "smooth",
                        })
                    }
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl"
                  >
                    ← Previous Lesson
                  </button>
                )}

                {/* Save Offline */}
                <button
                  onClick={() =>
                    downloadLesson(lesson)
                  }
                  disabled={offlineLessons.includes(
                    lesson._id
                  )}
                  className={`px-6 py-3 rounded-xl text-white ${
                    offlineLessons.includes(
                      lesson._id
                    )
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  {offlineLessons.includes(
                    lesson._id
                  )
                    ? "✅ Saved Offline"
                    : "📥 Save Offline"}
                </button>

                {/* Quiz */}
                <button
                  onClick={() =>
                    navigate(
                      `/quiz/${lesson._id}`
                    )
                  }
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold"
                >
                  📝 Take Quiz
                </button>

                {/* Next */}
                {nextLesson && (
                  <button
                    onClick={() =>
                      document
                        .getElementById(
                          `lesson-${nextLesson._id}`
                        )
                        ?.scrollIntoView({
                          behavior: "smooth",
                        })
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
                  >
                    Next Lesson →
                  </button>
                )}

              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}

export default Lessons;