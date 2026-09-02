import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      // Get enrolled courses
      const res = await API.get("/enrollments/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const enrolledCourses = (res.data.enrollments || [])
        .map((item) => item.course)
        .filter(Boolean);

      setCourses(enrolledCourses);

      // Get progress for every course
      const progressData = {};

      await Promise.all(
        enrolledCourses.map(async (course) => {
          try {
            const progressRes = await API.get(
              `/progress/my/course/${course._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            progressData[course._id] = progressRes.data;
          } catch (error) {
            console.log(
              `Progress Error for ${course.courseName}:`,
              error
            );

            progressData[course._id] = {
              totalLessons: 0,
              completedLessons: 0,
              coursePercentage: 0,
              lessons: [],
            };
          }
        })
      );

      setCourseProgress(progressData);
    } catch (error) {
      console.log("My Courses Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <h1 className="text-2xl font-semibold text-green-700">
          Loading My Courses...
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <h1 className="text-4xl font-bold text-green-700">
          🎓 My Courses
        </h1>

        <p className="text-gray-600 mt-2">
          Courses you are currently enrolled in.
        </p>

        {/* No courses */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-10 mt-8 text-center">

            <p className="text-xl text-gray-500">
              You haven't enrolled in any courses yet.
            </p>

            <button
              onClick={() => navigate("/courses")}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
            >
              📚 Browse Courses
            </button>

          </div>
        ) : (

          /* Course Cards */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">

            {courses.map((course) => {

              const progress =
                courseProgress[course._id] || {
                  totalLessons: 0,
                  completedLessons: 0,
                  coursePercentage: 0,
                  lessons: [],
                };

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl shadow-md p-6"
                >

                  {/* Course Name */}
                  <h2 className="text-2xl font-bold text-green-700">
                    {course.courseName}
                  </h2>

                  {/* Subject */}
                  <p className="text-sm text-gray-500 mt-2">
                    Subject: {course.subject}
                  </p>

                  {/* Description */}
                  <p className="text-gray-600 mt-3">
                    {course.description ||
                      "No description available."}
                  </p>

                  {/* Teacher */}
                  {course.teacher && (
                    <p className="text-gray-500 mt-3">
                      👨‍🏫 {course.teacher}
                    </p>
                  )}

                  {/* Course Progress */}
                  <div className="mt-6">

                    <div className="flex justify-between mb-2">

                      <span className="font-semibold text-gray-700">
                        Course Progress
                      </span>

                      <span className="font-bold text-green-600">
                        {progress.coursePercentage}%
                      </span>

                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3">

                      <div
                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              progress.coursePercentage || 0,
                              0
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                    <p className="text-sm text-gray-500 mt-2">
                      {progress.completedLessons} /{" "}
                      {progress.totalLessons} lessons completed
                    </p>

                  </div>

                  {/* Lesson Status */}
                  {progress.lessons &&
                    progress.lessons.length > 0 && (

                      <div className="mt-5">

                        <h3 className="font-semibold text-gray-700 mb-2">
                          Lesson Progress
                        </h3>

                        <div className="space-y-2">

                          {progress.lessons.map((item) => (

                            <div
                              key={item.lesson?._id}
                              className="flex justify-between items-center text-sm"
                            >

                              <span className="text-gray-600">
                                {item.lesson?.lessonName?.english ||
                                  "Lesson"}
                              </span>

                              <span>
                                {item.completed ? (
                                  <span className="text-green-600 font-semibold">
                                    ✅
                                  </span>
                                ) : (
                                  <span className="text-gray-400">
                                    ⭕
                                  </span>
                                )}
                              </span>

                            </div>

                          ))}

                        </div>

                      </div>
                    )}

                  {/* Continue Course */}
                  <button
                    onClick={() =>
                      navigate(`/language/${course._id}`)
                    }
                    className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
                  >
                    📖 Continue Course
                  </button>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default MyCourses;