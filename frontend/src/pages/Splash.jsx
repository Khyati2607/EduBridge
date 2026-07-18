import { Link } from "react-router-dom";

function Splash() {
  return (
    <div className="min-h-screen bg-green-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">

        <h1 className="text-5xl font-bold text-green-700">
          EduBridge
        </h1>

        <p className="mt-4 text-gray-600">
          Offline Smart Learning Platform
        </p>

        <p className="text-gray-500 mt-2">
          Empowering Rural Education Anywhere, Anytime
        </p>

        <Link to="/login">
          <button className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition">
            Get Started
          </button>
        </Link>

      </div>
    </div>
  );
}

export default Splash;