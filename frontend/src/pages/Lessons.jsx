import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function Lessons() {
  const { courseId, language } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await API.get(`/lessons/${courseId}`);
      console.log(res.data);
      setLessons(res.data.lessons);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-8">
      {lessons.map((lesson) => (
        <div
          key={lesson._id}
          className="bg-white shadow-lg rounded-2xl p-8 mb-8"
        >
          <h1 className="text-4xl font-bold text-green-700">
            {language === "Hindi"
              ? lesson.lessonName.hindi
              : lesson.lessonName.english}
          </h1>

          <h2 className="text-xl font-semibold mt-8">
            📖 Notes
          </h2>

          <p className="mt-3 text-gray-700">
            {language === "Hindi"
              ? lesson.notes.hindi
              : lesson.notes.english}
          </p>

          <a
            href={
              language === "Hindi"
                ? lesson.videoHindi
                : lesson.videoEnglish
            }
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-8 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl"
          >
            ▶ Watch Video
          </a>

          

          <button
            onClick={() => navigate(`/quiz/${lesson._id}`)}
            className="mt-10 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl"
          >
            Take Quiz
          </button>
        </div>
      ))}
    </div>
  );
}

export default Lessons;