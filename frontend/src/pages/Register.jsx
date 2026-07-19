import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleRegister = async () => {
  try {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    await API.post("/auth/register", {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });

    alert("Registration Successful!");

    navigate("/login");

  } catch (error) {
    alert(
      error.response?.data?.message ||
      "Registration Failed"
    );
  }
};

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center text-green-700">
          Create Account
        </h2>

        <p className="text-center text-gray-500 mt-2">
          Join EduBridge and start learning
        </p>

        {/* Full Name */}
        <div className="mt-8">
          <label className="font-semibold">Full Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mt-2 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Email */}
        <div className="mt-5">
          <label className="font-semibold">Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mt-2 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Password */}
        <div className="mt-5">
          <label className="font-semibold">Password</label>

          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mt-2 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Confirm Password */}
        <div className="mt-5">
          <label className="font-semibold">Confirm Password</label>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full mt-2 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Role */}
        <div className="mt-5">
          <label className="font-semibold">Register As</label>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full mt-2 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
          </select>
        </div>

        {/* Register Button */}
        <button
  onClick={handleRegister}
  className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
>
  Register
</button>

        {/* Login Link */}
        <p className="text-center mt-6 text-gray-600">
          Already have an account?

          <Link
            to="/login"
            className="text-green-700 font-semibold ml-2"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;