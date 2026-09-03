const express = require("express");
const router = express.Router();

const protect = require("../middleware/protect");
const { askAI } = require("../controllers/aiController");

router.post("/", protect, askAI);

module.exports = router;