const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true,
    },

    class: {
      type: String,
      required: true,
      enum: ["6", "7", "8", "9", "10"],
    },

    subject: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      enum: ["English", "Hindi"],
      default: "English",
    },

    description: {
      type: String,
      default: "",
    },

    thumbnail: {
      type: String,
      default: "",
    },

    teacher: {
      type: String,
      default: "",
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

module.exports = mongoose.model("Course", courseSchema);