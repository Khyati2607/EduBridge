import { FaEnvelope, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">

      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8">

        <h2 className="text-3xl font-bold text-center text-green-700">
          Welcome Back 👋
        </h2>

        <p className="text-center text-gray-500 mt-2">
          Login to continue learning
        </p>

        {/* Email */}

        <div className="mt-8">

          <label className="font-semibold">
            Email
          </label>

          <div className="flex items-center border rounded-xl mt-2 px-3">

            <FaEnvelope className="text-gray-500" />

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 outline-none"
            />

          </div>

        </div>

        {/* Password */}

        <div className="mt-5">

          <label className="font-semibold">
            Password
          </label>

          <div className="flex items-center border rounded-xl mt-2 px-3">

            <FaLock className="text-gray-500" />

            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 outline-none"
            />

          </div>

        </div>

        {/* Login Button */}

        <button
          className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
        >
          Login
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