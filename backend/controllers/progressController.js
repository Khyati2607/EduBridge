const Progress = require("../models/Progress");

// Get all progress
const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find()
      .populate("student")
      .populate("lesson");

    res.status(200).json({
      success: true,
      count: progress.length,
      progress,
    });
  } catch (error) {
    console.error("Get Progress Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get progress of one student
const getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;

    const progress = await Progress.find({
      student: studentId,
    })
      .populate("student")
      .populate("lesson");

    res.status(200).json({
      success: true,
      count: progress.length,
      progress,
    });
  } catch (error) {
    console.error("Get Student Progress Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Create progress
const createProgress = async (req, res) => {
  try {
    const progress = await Progress.create(req.body);

    res.status(201).json({
      success: true,
      message: "Progress Created Successfully",
      progress,
    });
  } catch (error) {
    console.error("Create Progress Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getProgress,
  getStudentProgress,
  createProgress,
};