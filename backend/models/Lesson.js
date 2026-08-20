const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    lessonName: {
      english: {
        type: String,
        required: true,
      },
      hindi: {
        type: String,
        required: true,
      },
    },

    notes: {
      english: String,
      hindi: String,
    },

    videoEnglish: {
      type: String,
      default: "",
    },

    videoHindi: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lesson", lessonSchema);