// Templates shared by resumes and cover letters. All are single-column with
// standard headings so they stay ATS-friendly.
// Keep in sync with server/services/templates.js (which renders PDF/DOCX).

const SANS = 'Arial, Helvetica, sans-serif'
const SERIF = '"Times New Roman", Times, serif'
const STANDARD_ORDER = ['summary', 'skills', 'experience', 'projects', 'education', 'certifications']

const base = {
  font: SANS,
  size: 10, // pt
  nameSize: 20,
  nameAlign: 'center',
  accent: '#000000',
  margins: {top: 50, bottom: 50, left: 56, right: 56}, // pt, US Letter (612 × 792)
  spacing: 1,
  order: STANDARD_ORDER,
}

export const TEMPLATES = {
  ats_classic: {...base, label: 'Classic', description: 'Clean and centred. Works for almost any role.'},
  ats_serif: {...base, font: SERIF, size: 10.5, label: 'Traditional', description: 'Serif type, suited to law, finance and academia.'},
  ats_compact: {
    ...base,
    size: 9,
    nameSize: 16,
    nameAlign: 'left',
    margins: {top: 34, bottom: 34, left: 42, right: 42},
    spacing: 0.55,
    label: 'Compact',
    description: 'Smaller type and tighter spacing to fit more on one page.',
  },
  ats_modern: {
    ...base,
    nameAlign: 'left',
    nameSize: 22,
    accent: '#3730a3',
    label: 'Modern',
    description: 'Left-aligned with a subtle accent colour.',
  },
  ats_skills_first: {
    ...base,
    order: ['summary', 'skills', 'projects', 'experience', 'education', 'certifications'],
    label: 'Skills-first',
    description: 'Skills and projects before experience. Great for students and career changers.',
  },
}

export const templateFor = (id) => TEMPLATES[id] || TEMPLATES.ats_classic
export const templateFont = (id) => templateFor(id).font

export const PAGE = {width: 612, height: 792} // US Letter in pt
