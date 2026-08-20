const express = require("express");

const router = express.Router();

const {
  createProgress,
  getProgress,
  getStudentProgress,
} = require("../controllers/progressController");

router.post("/", createProgress);

router.get("/", getProgress);

router.get("/:studentId", getStudentProgress);

module.exports = router;