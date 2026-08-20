import { useNavigate, useParams } from "react-router-dom";

function LanguageSelection() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center">

        <h1 className="text-3xl font-bold text-green-700 mb-8">
          Choose Language
        </h1>

        <button
          onClick={() => navigate(`/lessons/${courseId}/English`)}
          className="bg-green-600 text-white px-8 py-3 rounded-xl m-3"
        >
          🇬🇧 English
        </button>

        <button
          onClick={() => navigate(`/lessons/${courseId}/Hindi`)}
          className="bg-orange-500 text-white px-8 py-3 rounded-xl m-3"
        >
          🇮🇳 हिन्दी
        </button>

      </div>
    </div>
  );
}

export default LanguageSelection;