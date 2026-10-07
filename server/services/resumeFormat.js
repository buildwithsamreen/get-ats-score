// Converts a Resume document into plain text (for scoring) and into
// ATS-friendly PDF / DOCX files (single column, standard headings, no tables).
const PDFDocument = require("pdfkit");
const { templateFor } = require("./templates");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle,
} = require("docx");

const clean = (arr) => (arr || []).map((s) => (s || "").trim()).filter(Boolean);

function dateRange(start, end, isCurrent) {
  const to = isCurrent ? "Present" : end;
  return [start, to].filter(Boolean).join(" – ");
}

// Normalised section list shared by every output format.
function buildSections(resume, order) {
  const b = resume.basics || {};
  const sections = [];

  if (resume.summary?.trim()) sections.push({ title: "Summary", paragraphs: [resume.summary.trim()] });

  const skills = clean(resume.skills);
  if (skills.length) sections.push({ title: "Skills", paragraphs: [skills.join(", ")] });

  const experience = (resume.experience || []).filter((e) => e.company || e.role);
  if (experience.length) {
    sections.push({
      title: "Experience",
      entries: experience.map((e) => ({
        heading: [e.role, e.company].filter(Boolean).join(", "),
        meta: [e.location, dateRange(e.startDate, e.endDate, e.isCurrent)].filter(Boolean).join(" | "),
        bullets: clean(e.bullets),
      })),
    });
  }

  const projects = (resume.projects || []).filter((p) => p.name);
  if (projects.length) {
    sections.push({
      title: "Projects",
      entries: projects.map((p) => ({
        heading: p.name,
        meta: [p.link].filter(Boolean).join(""),
        bullets: [p.description, ...clean(p.bullets)].filter(Boolean),
      })),
    });
  }

  const education = (resume.education || []).filter((e) => e.school || e.degree);
  if (education.length) {
    sections.push({
      title: "Education",
      entries: education.map((e) => ({
        heading: [[e.degree, e.field].filter(Boolean).join(" in "), e.school].filter(Boolean).join(", "),
        meta: dateRange(e.startYear, e.endYear),
        bullets: [],
      })),
    });
  }

  const certs = clean(resume.certifications);
  if (certs.length) sections.push({ title: "Certifications", entries: certs.map((c) => ({ heading: "", meta: "", bullets: [c] })) });

  if (order) sections.sort((x, y) => order.indexOf(x.title.toLowerCase()) - order.indexOf(y.title.toLowerCase()));

  return {
    name: b.fullName || "Your Name",
    contact: [b.email, b.phone, b.location, ...clean(b.links)].filter(Boolean).join(" | "),
    sections,
  };
}

function resumeToText(resume) {
  const { name, contact, sections } = buildSections(resume);
  const out = [name, contact, ""];
  for (const s of sections) {
    out.push(s.title.toUpperCase());
    for (const p of s.paragraphs || []) out.push(p);
    for (const e of s.entries || []) {
      if (e.heading) out.push(e.heading);
      if (e.meta) out.push(e.meta);
      for (const bl of e.bullets) out.push(`• ${bl}`);
    }
    out.push("");
  }
  return out.join("\n");
}

// Lays out each section; `t` is a template from ./templates.js.
function resumeToPdf(resume) {
  const t = templateFor(resume.templateId);
  const { name, contact, sections } = buildSections(resume, t.order);
  const [regular, bold] = t.pdfFonts;
  const sp = t.spacing;
  const doc = new PDFDocument({ size: "LETTER", margins: t.margins });
  const chunks = [];
  let pages = 1;
  doc.on("pageAdded", () => pages++);
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise((resolve) => doc.on("end", () => resolve({ buffer: Buffer.concat(chunks), pages })));
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  doc.font(bold).fontSize(t.nameSize).fillColor(t.accent).text(name, { align: t.nameAlign });
  if (contact) doc.font(regular).fontSize(t.size - 0.5).fillColor("#333").text(contact, { align: t.nameAlign });
  doc.fillColor("#000");

  for (const s of sections) {
    doc.moveDown(0.8 * sp);
    doc.font(bold).fontSize(t.size + 1.5).fillColor(t.accent).text(s.title.toUpperCase(), { characterSpacing: 0.5 });
    const y = doc.y + 1;
    doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.margins.left + width, y).lineWidth(0.7).strokeColor(t.accent).stroke();
    // Fixed gap under the rule so text never touches it, even in compact layouts
    doc.fillColor("#000").moveDown(0.4);

    for (const p of s.paragraphs || []) doc.font(regular).fontSize(t.size).text(p, { lineGap: 1.5 * sp });

    for (const e of s.entries || []) {
      if (e.heading) doc.font(bold).fontSize(t.size + 0.5).text(e.heading);
      if (e.meta) doc.font(regular).fontSize(t.size - 0.5).fillColor("#444").text(e.meta).fillColor("#000");
      // Hanging indent: wrapped lines align with the text, not the bullet
      const left = doc.page.margins.left;
      for (const bl of e.bullets) {
        doc.font(regular).fontSize(t.size);
        if (doc.y + doc.currentLineHeight(true) > doc.page.height - doc.page.margins.bottom) doc.addPage();
        const y = doc.y;
        doc.text("•", left + 4, y, { lineBreak: false });
        doc.text(bl, left + 14, y, { width: width - 14, lineGap: 1.5 * sp });
        doc.x = left;
      }
      doc.moveDown(0.4 * sp);
    }
  }

  doc.end();
  return done;
}

function resumeToDocx(resume) {
  const t = templateFor(resume.templateId);
  const { name, contact, sections } = buildSections(resume, t.order);
  const font = t.docxFont;
  const color = t.accent.replace("#", "");
  const align = t.nameAlign === "center" ? AlignmentType.CENTER : AlignmentType.LEFT;
  const half = (pt) => Math.round(pt * 2); // docx sizes are half-points
  const gap = (twips) => Math.round(twips * t.spacing);

  const children = [new Paragraph({ alignment: align, children: [new TextRun({ text: name, bold: true, size: half(t.nameSize - 2), color })] })];
  if (contact) {
    children.push(new Paragraph({ alignment: align, spacing: { after: gap(160) }, children: [new TextRun({ text: contact, size: half(t.size - 0.5) })] }));
  }

  for (const s of sections) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: gap(200), after: gap(80) },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color, space: 1 } },
        children: [new TextRun({ text: s.title.toUpperCase(), bold: true, size: half(t.size + 1.5), color, font })],
      })
    );
    for (const p of s.paragraphs || []) children.push(new Paragraph({ children: [new TextRun({ text: p, size: half(t.size) })] }));
    for (const e of s.entries || []) {
      if (e.heading) children.push(new Paragraph({ spacing: { before: gap(80) }, children: [new TextRun({ text: e.heading, bold: true, size: half(t.size + 0.5) })] }));
      if (e.meta) children.push(new Paragraph({ children: [new TextRun({ text: e.meta, size: half(t.size - 0.5), color: "444444" })] }));
      for (const bl of e.bullets) children.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text: bl, size: half(t.size) })] }));
    }
  }

  const m = t.margins;
  return Packer.toBuffer(
    new Document({
      styles: { default: { document: { run: { font } } } },
      sections: [{ properties: { page: { margin: { top: m.top * 20, bottom: m.bottom * 20, left: m.left * 20, right: m.right * 20 } } }, children }],
    })
  );
}

module.exports = { resumeToText, resumeToPdf, resumeToDocx };
