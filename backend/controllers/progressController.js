const Progress = require("../models/Progress");

// Get all progress
const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find()
      .populate("student")
      .populate("course")
      .populate("lesson");

    res.status(200).json({
      success: true,
      count: progress.length,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
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
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getProgress,
  createProgress,
};