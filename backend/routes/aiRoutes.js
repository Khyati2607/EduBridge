const express = require("express");
const router = express.Router();

const protect = require("../middleware/protect");

const {
  askAI,
  getRecommendations,
} = require("../controllers/aiController");

router.post("/", protect, askAI);

router.get("/recommendations", protect, getRecommendations);

module.exports = router;