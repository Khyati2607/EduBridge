const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true,
    },

    

    subject: {
      type: String,
      required: true,
    },

   languages: {
  type: [String],
  default: ["English", "Hindi"],
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