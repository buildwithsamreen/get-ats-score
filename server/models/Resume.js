const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, trim: true, default: "" },
    role: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    startDate: { type: String, trim: true, default: "" }, // keep string for MVP
    endDate: { type: String, trim: true, default: "" },
    isCurrent: { type: Boolean, default: false },
    bullets: { type: [String], default: [] },
  },
  { _id: false }
);

const educationSchema = new mongoose.Schema(
  {
    school: { type: String, trim: true, default: "" },
    degree: { type: String, trim: true, default: "" },
    field: { type: String, trim: true, default: "" },
    startYear: { type: String, trim: true, default: "" },
    endYear: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, trim: true, default: "Untitled Resume" },

    basics: {
      fullName: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      location: { type: String, trim: true, default: "" },
      links: { type: [String], default: [] }, // portfolio, linkedin, etc.
    },

    summary: { type: String, trim: true, default: "" },

    skills: { type: [String], default: [] },

    experience: { type: [experienceSchema], default: [] },

    education: { type: [educationSchema], default: [] },

    templateId: { type: String, default: "ats_classic" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
