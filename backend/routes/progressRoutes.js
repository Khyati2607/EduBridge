const express = require("express");
const router = express.Router();

const {
  getProgress,
  createProgress,
} = require("../controllers/progressController");

router.get("/", getProgress);
router.post("/", createProgress);

module.exports = router;