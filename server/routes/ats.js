const router = require("express").Router();
const multer = require("multer");
const { scoreResume } = require("../services/atsScorer");
const { ROLES, roleById } = require("../content/roles");
const { extractText, UnsupportedFileError } = require("../services/extractText");
const { resumeToText, resumeToPdf, resumeToDocx } = require("../services/resumeFormat");
const { parseResumeText } = require("../services/resumeParser");
const { letterToPdf, letterToDocx } = require("../services/letterFormat");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Score an uploaded resume file (PDF / DOCX / TXT), optionally against a job description.
router.post("/score-file", upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Please attach a resume file" });
  try {
    const text = await extractText(req.file);
    return res.json(scoreResume(text, req.body.jobDescription, { role: roleById(req.body.role) }));
  } catch (e) {
    if (e instanceof UnsupportedFileError) return res.status(400).json({ message: e.message });
    console.error(e);
    return res.status(422).json({ message: "Couldn't read this file. Make sure it isn't password-protected or corrupted." });
  }
});

// Target roles for keyword matching without a job description.
router.get("/roles", (req, res) => {
  res.set("Cache-Control", "public, max-age=3600");
  res.json(ROLES.map(({ id, label, category, aliases }) => ({ id, label, category, aliases })));
});

// Convert an uploaded resume file into builder data.
router.post("/parse-file", upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Please attach a resume file" });
  try {
    const text = await extractText(req.file);
    if (text.trim().split(/\s+/).length < 20) {
      return res.status(422).json({ message: "Very little text could be read from this file. Scanned PDFs and images can't be imported." });
    }
    return res.json(parseResumeText(text));
  } catch (e) {
    if (e instanceof UnsupportedFileError) return res.status(400).json({ message: e.message });
    console.error(e);
    return res.status(422).json({ message: "Couldn't read this file. Make sure it isn't password-protected or corrupted." });
  }
});

// Score a resume built in the app (sent as JSON).
router.post("/score-resume", (req, res) => {
  const { resume, jobDescription, role } = req.body || {};
  if (!resume) return res.status(400).json({ message: "Resume data is required" });
  return res.json(scoreResume(resumeToText(resume), jobDescription, { source: "builder", role: roleById(role) }));
});

// Export a resume (sent as JSON) to PDF or DOCX.
router.post("/export/:format", async (req, res) => {
  const { resume } = req.body || {};
  if (!resume) return res.status(400).json({ message: "Resume data is required" });

  const base = (resume.basics?.fullName || resume.title || "resume").replace(/[^\w-]+/g, "_");
  if (req.params.format === "pdf") {
    const { buffer, pages } = await resumeToPdf(resume);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${base}.pdf"`,
      "X-Page-Count": String(pages),
    });
    return res.send(buffer);
  }
  if (req.params.format === "docx") {
    const buf = await resumeToDocx(resume);
    res.set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${base}.docx"`,
    });
    return res.send(buf);
  }
  return res.status(400).json({ message: "Format must be pdf or docx" });
});

// Export a cover letter (sent as JSON) to PDF or DOCX.
router.post("/export-letter/:format", async (req, res) => {
  const { letter } = req.body || {};
  if (!letter) return res.status(400).json({ message: "Cover letter data is required" });

  const base = `${letter.sender?.fullName || "cover"}_Cover_Letter`.replace(/[^\w-]+/g, "_");
  if (req.params.format === "pdf") {
    const buf = await letterToPdf(letter);
    res.set({ "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${base}.pdf"` });
    return res.send(buf);
  }
  if (req.params.format === "docx") {
    const buf = await letterToDocx(letter);
    res.set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${base}.docx"`,
    });
    return res.send(buf);
  }
  return res.status(400).json({ message: "Format must be pdf or docx" });
});

module.exports = router;
