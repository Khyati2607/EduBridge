const Progress = require("../models/Progress");
const Lesson = require("../models/Lesson");

// =====================================================
// GET ALL PROGRESS
// =====================================================
const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find()
      .populate("student", "-password")
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
      error: error.message,
    });
  }
};


// =====================================================
// GET PROGRESS OF LOGGED-IN STUDENT
// =====================================================
const getStudentProgress = async (req, res) => {
  try {
    const studentId = req.user.id;

    const progress = await Progress.find({
      student: studentId,
    })
      .populate("student", "-password")
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


// =====================================================
// GET MY PROGRESS
// =====================================================
const getMyProgress = async (req, res) => {
  try {
    const studentId = req.user.id;

    const progress = await Progress.find({
      student: studentId,
    })
      .populate("student", "-password")
      .populate("lesson")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: progress.length,
      progress,
    });
  } catch (error) {
    console.error("Get My Progress Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


// =====================================================
// CREATE OR UPDATE PROGRESS
// =====================================================
const createProgress = async (req, res) => {
  try {
    const {
      lesson,
      score,
      totalQuestions,
      percentage,
    } = req.body;

    // Student comes from JWT
    const student = req.user.id;

    // Validate
    if (
      !lesson ||
      score === undefined ||
      !totalQuestions ||
      percentage === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All progress fields are required",
      });
    }

    // Find latest record for this student + lesson
    const existingProgress = await Progress.findOne({
      student,
      lesson,
    }).sort({ updatedAt: -1 });

    let progress;

    // =================================================
    // UPDATE EXISTING
    // =================================================
    if (existingProgress) {
      existingProgress.score = score;
      existingProgress.totalQuestions = totalQuestions;
      existingProgress.percentage = percentage;

      // 60% or more = completed
      existingProgress.completed = percentage >= 60;

      progress = await existingProgress.save();

      return res.status(200).json({
        success: true,
        message: "Progress Updated Successfully",
        progress,
      });
    }

    // =================================================
    // CREATE NEW
    // =================================================
    progress = await Progress.create({
      student,
      lesson,
      score,
      totalQuestions,
      percentage,
      completed: percentage >= 60,
    });

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


// =====================================================
// GET COURSE-WISE PROGRESS
// =====================================================
const getCourseProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    // Get all lessons of course
    const lessons = await Lesson.find({
      courseId: courseId,
    }).sort({
      order: 1,
    });

    // Get student's progress
    const progress = await Progress.find({
      student: studentId,
    })
      .populate("lesson")
      .sort({ updatedAt: -1 });

    // Combine lessons with progress
    const courseProgress = lessons.map((lesson) => {

      // Find latest progress for this lesson
      const lessonProgress = progress.find(
        (item) =>
          item.lesson &&
          item.lesson._id.toString() ===
            lesson._id.toString()
      );

      return {
        lesson,

        completed: lessonProgress
          ? lessonProgress.completed
          : false,

        percentage: lessonProgress
          ? lessonProgress.percentage
          : 0,

        score: lessonProgress
          ? lessonProgress.score
          : 0,

        totalQuestions: lessonProgress
          ? lessonProgress.totalQuestions
          : 0,
      };
    });

    // Course statistics
    const totalLessons = lessons.length;

    const completedLessons = courseProgress.filter(
      (item) => item.completed
    ).length;

    const coursePercentage =
      totalLessons > 0
        ? Math.round(
            (completedLessons / totalLessons) * 100
          )
        : 0;

    res.status(200).json({
      success: true,
      totalLessons,
      completedLessons,
      coursePercentage,
      lessons: courseProgress,
    });

  } catch (error) {
    console.error("Course Progress Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


// =====================================================
// EXPORT
// =====================================================
module.exports = {
  getProgress,
  getStudentProgress,
  getMyProgress,
  createProgress,
  getCourseProgress,
};