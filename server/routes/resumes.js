const router = require("express").Router();
const auth = require("../middleware/auth");
const Resume = require("../models/Resume");

// CREATE resume
router.post("/", auth, async (req, res) => {
  try {
    const { title } = req.body || {};
    const resume = await Resume.create({
      userId: req.user.userId,
      title: title?.trim() || "Untitled Resume",
    });
    return res.status(201).json(resume);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

// LIST resumes for current user
router.get("/", auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.userId }).sort({ updatedAt: -1 });
    return res.json(resumes);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET one resume (must belong to user)
router.get("/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    return res.json(resume);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

// UPDATE resume (must belong to user)
router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Resume not found" });
    return res.json(updated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE resume (must belong to user)
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!deleted) return res.status(404).json({ message: "Resume not found" });
    return res.json({ message: "Deleted successfully" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
