import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
function Courses() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await API.get("/courses");
      setCourses(res.data.courses);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <h1 className="text-4xl font-bold text-green-700 mb-8">
        📚 Available Courses
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white rounded-2xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold text-green-700">
              {course.courseName}
            </h2>

            <p className="text-gray-600 mt-3">
              {course.description}
            </p>

            <button
  onClick={() => navigate(`/language/${course._id}`)}
  className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl"
>
  Open Course
</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;