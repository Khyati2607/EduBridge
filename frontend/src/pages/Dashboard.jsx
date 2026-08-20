import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await API.get("/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-8">

      {/* Welcome Section */}
      <h1 className="text-4xl font-bold text-green-700">
        Welcome, {user ? user.name : "Loading..."} 👋
      </h1>

      <p className="text-gray-600 mt-2">
        {user ? user.email : ""}
      </p>

      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

        {/* Courses */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-gray-500">
            Courses Enrolled
          </h2>

          <p className="text-4xl font-bold text-green-600 mt-3">
            5
          </p>
        </div>

        {/* Lessons */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-gray-500">
            Lessons Completed
          </h2>

          <p className="text-4xl font-bold text-blue-600 mt-3">
            18
          </p>
        </div>

        {/* Quiz */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-gray-500">
            Quiz Score
          </h2>

          <p className="text-4xl font-bold text-purple-600 mt-3">
            92%
          </p>
        </div>

      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-10">

        {/* Courses Button */}
        <button
          onClick={() => navigate("/courses")}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md"
        >
          📚 Browse Courses
        </button>

        {/* Progress Button */}
        <button
          onClick={() => navigate("/progress")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md"
        >
          📊 My Progress
        </button>

      </div>

    </div>
  );
}

export default Dashboard;