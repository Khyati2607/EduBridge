import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, []);

  // =====================================================
  // GET ALL COURSES
  // =====================================================
  const fetchCourses = async () => {
    try {
      const res = await API.get("/courses");

      setCourses(res.data.courses || []);
    } catch (error) {
      console.log("Courses Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GET MY ENROLLED COURSES
  // =====================================================
  const fetchEnrolledCourses = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await API.get("/enrollments/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const enrollments = res.data.enrollments || [];

      const ids = enrollments
        .map((item) => item.course?._id)
        .filter(Boolean);

      setEnrolledCourses(ids);
    } catch (error) {
      console.log("Enrollment Fetch Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  // =====================================================
  // ENROLL IN COURSE
  // =====================================================
  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      await API.post(
        "/enrollments",
        {
          course: courseId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Course enrolled successfully! 🎉");

      setEnrolledCourses((prev) => {
        if (prev.includes(courseId)) {
          return prev;
        }

        return [...prev, courseId];
      });
    } catch (error) {
      console.log("Enroll Error:", error);

      // Course already exists in database
      if (
        error.response?.status === 400 &&
        error.response?.data?.message ===
          "Already enrolled in this course"
      ) {
        setEnrolledCourses((prev) => {
          if (prev.includes(courseId)) {
            return prev;
          }

          return [...prev, courseId];
        });

        alert(
          "You are already enrolled in this course. You can open it now."
        );

        return;
      }

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");

        localStorage.removeItem("token");
        navigate("/login");

        return;
      }

      alert(
        error.response?.data?.message ||
          "Unable to enroll in course"
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <h1 className="text-2xl font-semibold text-green-700">
          Loading Courses...
        </h1>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold text-green-700 mb-8">
          📚 Available Courses
        </h1>

        {courses.length === 0 ? (
          <p className="text-center text-gray-600">
            No courses available.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {courses.map((course) => {

              const isEnrolled =
                enrolledCourses.includes(course._id);

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

                  {/* Button */}
                  {isEnrolled ? (
                    <button
                      onClick={() =>
                        navigate(
                          `/language/${course._id}`
                        )
                      }
                      className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl"
                    >
                      📖 Open Course
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleEnroll(course._id)
                      }
                      className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl"
                    >
                      🎓 Enroll Course
                    </button>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default Courses;