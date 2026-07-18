const Lesson = require("../models/Lesson");

// Get all lessons
const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find().populate("course");

    res.status(200).json({
      success: true,
      count: lessons.length,
      lessons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Create lesson
const createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);

    res.status(201).json({
      success: true,
      message: "Lesson Created",
      lesson,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getLessons,
  createLesson,
};