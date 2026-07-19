function Dashboard() {
  return (
    <div className="min-h-screen bg-green-50 p-8">

      <h1 className="text-4xl font-bold text-green-700">
        Welcome, Khyati 👋
      </h1>

      <p className="text-gray-600 mt-2">
        Continue your learning journey with EduBridge.
      </p>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-gray-500">Courses Enrolled</h2>
          <p className="text-4xl font-bold text-green-600 mt-3">5</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-gray-500">Lessons Completed</h2>
          <p className="text-4xl font-bold text-blue-600 mt-3">18</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-gray-500">Quiz Score</h2>
          <p className="text-4xl font-bold text-purple-600 mt-3">92%</p>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;