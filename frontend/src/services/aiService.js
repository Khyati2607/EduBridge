import axios from "axios";

const API_URL = "http://localhost:5000/api/ai";

export const askAI = async (question) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    API_URL,
    { question },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};