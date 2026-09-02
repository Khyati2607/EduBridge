const express = require("express");
const router = express.Router();

const protect = require("../middleware/protect");

const {
  createProgress,
  getProgress,
  getStudentProgress,
  getCourseProgress,
  getMyProgress,
} = require("../controllers/progressController");

// My progress
router.get("/my", protect, getMyProgress);

// My course-wise progress
router.get(
  "/my/course/:courseId",
  protect,
  getCourseProgress
);

// Student progress
router.get(
  "/:studentId",
  protect,
  getStudentProgress
);

// All progress
router.get("/", protect, getProgress);

// Create/update progress
router.post("/", protect, createProgress);

module.exports = router;