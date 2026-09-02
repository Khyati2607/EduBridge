const Enrollment = require("../models/Enrollment");

// =====================================================
// ENROLL STUDENT IN COURSE
// =====================================================
const enrollCourse = async (req, res) => {
  try {
    const { course } = req.body;

    // Student comes from JWT
    const student = req.user.id;

    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course is required",
      });
    }

    const existing = await Enrollment.findOne({
      student,
      course,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    const enrollment = await Enrollment.create({
      student,
      course,
    });

    res.status(201).json({
      success: true,
      message: "Course enrolled successfully",
      enrollment,
    });
  } catch (error) {
    console.error("Enrollment Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// =====================================================
// GET MY COURSES
// =====================================================
const getMyCourses = async (req, res) => {
  try {
    // Student comes from JWT
    const student = req.user.id;

    const enrollments = await Enrollment.find({
      student,
    }).populate("course");

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    console.error("Get Courses Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  enrollCourse,
  getMyCourses,
};