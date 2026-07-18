const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    chapterNumber: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    pdfUrl: {
      type: String,
      default: "",
    },

    videoUrl: {
      type: String,
      default: "",
    },

    audioUrl: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      default: 0,
    },

    offlineAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lesson", lessonSchema);