const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["Student", "Professional"],
      default: "Student",
    },

    targetRole: {
      type: String,
      enum: [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Data Scientist",
        "AI/ML Engineer",
        "HR",
        "DevOps Engineer",
      ],
      required: true,
    },

    experience: {
      type: String,
      enum: ["Fresher", "0-2 Years", "2-5 Years", "5+ Years"],
      default: "Fresher",
    },

    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);