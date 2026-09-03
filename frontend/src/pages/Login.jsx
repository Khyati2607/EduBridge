import { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      alert("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/login", formData);

      const user = res.data.user;
      const token = res.data.token;

      /* Current session */
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);

      /* Offline session */
      localStorage.setItem("offlineUser", "true");
      localStorage.setItem("offlineEmail", user.email);

      /* Remember account */
      const savedAccounts = JSON.parse(
        localStorage.getItem("eduBridgeAccounts") || "[]"
      );

      const account = {
        id: user._id,
        name: user.name,
        email: user.email,
        token: token,
      };

      const updatedAccounts = [
        account,
        ...savedAccounts.filter(
          (item) => item.id !== user._id
        ),
      ];

      localStorage.setItem(
        "eduBridgeAccounts",
        JSON.stringify(updatedAccounts)
      );

      localStorage.removeItem("selectedAccountId");

      alert("Login Successful!");

      navigate("/dashboard");
    } catch (err) {
      const isOffline =
        !navigator.onLine || !err.response;

      if (isOffline) {
        const offlineUser =
          localStorage.getItem("offlineUser");

        const userId =
          localStorage.getItem("userId");

        const userName =
          localStorage.getItem("userName");

        if (offlineUser === "true" && userId) {
          alert(
            `Offline Mode: Welcome back ${
              userName || "Student"
            }!`
          );

          navigate("/offline-lessons");
          return;
        }

        alert(
          "You must login once while online before using EduBridge offline."
        );

        return;
      }

      alert(
        err.response?.data?.message ||
          "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8">

        <h2 className="text-3xl font-bold text-center text-green-700">
          Welcome Back 👋
        </h2>

        <p className="text-center text-gray-500 mt-2">
          Login to continue learning
        </p>

        <div className="mt-8">
          <label className="font-semibold">
            Email
          </label>

          <div className="flex items-center border rounded-xl mt-2 px-3">
            <FaEnvelope className="text-gray-500" />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full p-3 outline-none"
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="font-semibold">
            Password
          </label>

          <div className="flex items-center border rounded-xl mt-2 px-3">
            <FaLock className="text-gray-500" />

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full p-3 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?

          <Link
            to="/register"
            className="text-green-700 font-semibold ml-2"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;