const path = require("path");
const mammoth = require("mammoth");
const { PDFParse } = require("pdf-parse");

class UnsupportedFileError extends Error {}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };

function htmlToText(html) {
  return html
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<br\s*\/?>|<\/(p|li|h\d|tr|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, e) => ENTITIES[e])
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractText(file) {
  const ext = path.extname(file.originalname || "").toLowerCase();

  if (ext === ".pdf" || file.mimetype === "application/pdf") {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const result = await parser.getText();
      return result.text || "";
    } finally {
      await parser.destroy();
    }
  }

  if (ext === ".docx") {
    // Go via HTML so list items keep a bullet marker (raw text drops them).
    const { value } = await mammoth.convertToHtml({ buffer: file.buffer });
    return htmlToText(value || "");
  }

  if (ext === ".txt") return file.buffer.toString("utf8");

  if (ext === ".doc") {
    throw new UnsupportedFileError("Old .doc files aren't supported. Save it as .docx or PDF and try again.");
  }

  throw new UnsupportedFileError("Unsupported file type. Upload a PDF, DOCX or TXT file.");
}

module.exports = { extractText, UnsupportedFileError };
