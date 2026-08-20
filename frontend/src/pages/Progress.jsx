import { useEffect, useState } from "react";
import API from "../services/api";

function Progress() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await API.get("/progress");
        setProgress(response.data.progress || []);
      } catch (err) {
        console.error("Progress Error:", err);
        setError("Unable to load progress");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (loading) {
    return (
      <h1 className="text-2xl text-center mt-20">
        Loading Progress...
      </h1>
    );
  }

  if (error) {
    return (
      <h1 className="text-2xl text-center mt-20 text-red-500">
        {error}
      </h1>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        My Progress
      </h1>

      {progress.length === 0 ? (
        <p className="text-center">
          No progress available yet.
        </p>
      ) : (
        <div className="space-y-4">
          {progress.map((item) => (
            <div
              key={item._id}
              className="border rounded-lg p-5 shadow"
            >
              <h2 className="text-xl font-semibold">
                {item.lesson?.title || "Lesson"}
              </h2>

              <p>Score: {item.score}/{item.totalQuestions}</p>

              <p>Percentage: {item.percentage}%</p>

              <p>
                Status:{" "}
                {item.completed ? "Completed ✅" : "Not Completed"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Progress;