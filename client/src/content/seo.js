// Page titles/descriptions. Plain data (no JSX) because vite.config.js also
// imports it at build time to write per-route HTML with the right meta tags.
import {GUIDES} from './guides.js'

export const SITE_NAME = 'ATS Score'
export const DEFAULT_DESCRIPTION =
  'Free ATS resume checker and builder. Get an instant ATS score, see missing keywords from the job description, and export ATS-friendly PDF or DOCX resumes and cover letters.'

export const fullTitle = (title) => (title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} – Free ATS Resume Checker & Builder`)

// Public, indexable pages.
export const PAGES = {
  '/': {
    title: '',
    description: DEFAULT_DESCRIPTION,
  },
  '/resumes': {
    title: 'Free ATS-Friendly Resume Builder',
    description:
      'Build an ATS-friendly resume for free, or import your existing PDF/DOCX. Five clean templates, live score checks and PDF/DOCX export. No sign-up.',
  },
  '/letters': {
    title: 'Free Cover Letter Builder',
    description:
      'Write a tailored cover letter in minutes. Generate a first draft from your resume, edit it, and download it as PDF or DOCX. Free, no sign-up.',
  },
  '/guides': {
    title: 'Resume Guides',
    description:
      'Practical guides to beating applicant tracking systems: how an ATS reads your resume, a formatting checklist, tailoring to a job description and writing strong bullet points.',
  },
  '/privacy': {title: 'Privacy Policy', description: 'How ATS Score handles your data: resumes stay in your browser and uploads are never stored.'},
  '/terms': {title: 'Terms of Use', description: 'Terms of use for the ATS Score resume checker and builder.'},
  '/contact': {title: 'Contact', description: 'Questions or feedback about ATS Score? Get in touch.'},
}

for (const g of GUIDES) {
  PAGES[`/guides/${g.slug}`] = {title: g.title, description: g.description, article: g}
}
