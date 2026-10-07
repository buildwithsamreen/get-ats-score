// Resume/cover-letter templates. All are single-column with standard headings
// so they stay ATS-friendly; they differ in type, spacing, colour and order.
// Keep in sync with client/src/content/templates.js.

const STANDARD_ORDER = ["summary", "skills", "experience", "projects", "education", "certifications"];

const base = {
  pdfFonts: ["Helvetica", "Helvetica-Bold"],
  docxFont: "Arial",
  size: 10, // body font size in pt
  nameSize: 20,
  nameAlign: "center",
  accent: "#000000",
  margins: { top: 50, bottom: 50, left: 56, right: 56 },
  spacing: 1, // multiplier for vertical gaps
  order: STANDARD_ORDER,
};

const TEMPLATES = {
  ats_classic: base,
  ats_serif: { ...base, pdfFonts: ["Times-Roman", "Times-Bold"], docxFont: "Times New Roman", size: 10.5 },
  ats_compact: {
    ...base,
    size: 9,
    nameSize: 16,
    nameAlign: "left",
    margins: { top: 34, bottom: 34, left: 42, right: 42 },
    spacing: 0.55,
  },
  ats_modern: { ...base, nameAlign: "left", nameSize: 22, accent: "#3730a3" },
  ats_skills_first: {
    ...base,
    order: ["summary", "skills", "projects", "experience", "education", "certifications"],
  },
};

const templateFor = (id) => TEMPLATES[id] || TEMPLATES.ats_classic;

module.exports = { templateFor };
