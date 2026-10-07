// Cover letter PDF / DOCX export. Uses the resume template's font and accent
// so a letter and resume sent together look like a set.
const PDFDocument = require("pdfkit");
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require("docx");
const { templateFor } = require("./templates");

const clean = (arr) => (arr || []).map((s) => (s || "").trim()).filter(Boolean);

function buildLetter(letter) {
  const s = letter.sender || {};
  const r = letter.recipient || {};
  return {
    name: s.fullName || "Your Name",
    contact: [s.email, s.phone, s.location, ...clean(s.links)].filter(Boolean).join(" | "),
    date: (letter.date || "").trim(),
    recipient: clean([r.name, r.company, ...(r.address || "").split("\n")]),
    greeting: r.name?.trim() ? `Dear ${r.name.trim()},` : "Dear Hiring Manager,",
    paragraphs: clean(letter.paragraphs),
    signOff: (letter.signOff || "Sincerely,").trim(),
  };
}

function letterToPdf(letter) {
  const L = buildLetter(letter);
  const t = templateFor(letter.templateId);
  const [regular, bold] = t.pdfFonts;
  const doc = new PDFDocument({ size: "LETTER", margins: { top: 60, bottom: 60, left: 72, right: 72 } });
  const chunks = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  doc.font(bold).fontSize(18).fillColor(t.accent).text(L.name).fillColor("#000");
  if (L.contact) doc.font(regular).fontSize(9.5).fillColor("#333").text(L.contact).fillColor("#000");
  doc.moveDown(1.5);

  doc.font(regular).fontSize(11);
  if (L.date) doc.text(L.date).moveDown(1);
  if (L.recipient.length) {
    for (const line of L.recipient) doc.text(line);
    doc.moveDown(1);
  }
  doc.text(L.greeting).moveDown(0.8);
  for (const p of L.paragraphs) doc.text(p, { align: "left", lineGap: 2 }).moveDown(0.8);
  doc.moveDown(0.4).text(L.signOff).moveDown(1.5).font(bold).text(L.name);

  doc.end();
  return done;
}

function letterToDocx(letter) {
  const L = buildLetter(letter);
  const t = templateFor(letter.templateId);
  const font = t.docxFont;
  const para = (text, opts = {}) =>
    new Paragraph({ spacing: { after: opts.after ?? 0 }, alignment: AlignmentType.LEFT, children: [new TextRun({ text, size: opts.size || 22, bold: opts.bold, color: opts.color })] });

  const children = [para(L.name, { size: 34, bold: true, color: t.accent.replace("#", "") })];
  if (L.contact) children.push(para(L.contact, { size: 19, color: "333333", after: 360 }));
  if (L.date) children.push(para(L.date, { after: 240 }));
  L.recipient.forEach((line, i) => children.push(para(line, { after: i === L.recipient.length - 1 ? 240 : 0 })));
  children.push(para(L.greeting, { after: 200 }));
  for (const p of L.paragraphs) children.push(para(p, { after: 200 }));
  children.push(para(L.signOff, { after: 480 }), para(L.name, { bold: true }));

  return Packer.toBuffer(
    new Document({
      styles: { default: { document: { run: { font } } } },
      sections: [{ properties: { page: { margin: { top: 1080, bottom: 1080, left: 1440, right: 1440 } } }, children }],
    })
  );
}

module.exports = { letterToPdf, letterToDocx };
