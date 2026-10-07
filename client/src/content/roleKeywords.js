// Per-role keyword data, shared with the server's scorer (server/content/roles.json)
// so the keyword pages and the ATS check always agree. Plain data: vite.config.js
// also reads it at build time for the sitemap and per-page meta tags.
import ROLES from '../../../server/content/roles.json'

// "javascript|js" → {name: 'javascript', synonyms: ['js']}
const splitKeyword = (k) => {
  const [name, ...synonyms] = k.split('|')
  return {name, synonyms}
}

export const ROLE_PAGES = ROLES.map((r) => ({
  ...r,
  slug: r.id,
  keywordList: r.keywords.map(splitKeyword),
  title: `${r.label} Resume Keywords: ATS Skills to Include`,
  description: `The ${r.keywords.length} keywords applicant tracking systems look for on a ${r.label.toLowerCase()} resume, with synonyms, an example summary and bullet points. Check your resume for free.`,
}))

export const roleCategories = () => [...new Set(ROLE_PAGES.map((r) => r.category))]
export const rolePageBySlug = (slug) => ROLE_PAGES.find((r) => r.slug === slug)
