// Heuristic ATS scorer. Works on plain text so it can score uploaded files
// and resumes built in the app with the same rules.

const STOPWORDS = new Set(
  `a about above after again against all also am an and any are as at be because been before being
  below between both but by can could did do does doing down during each etc few for from further had has
  have having he her here hers herself him himself his how i if in into is it its itself just let me more
  most my myself no nor not of off on once only or other our ours ourselves out over own per same she should
  so some such than that the their theirs them themselves then there these they this those through to too
  under until up very was we were what when where which while who whom why will with would you your yours
  yourself yourselves within across via using use used able must may might well including include includes
  strong good great excellent ability work working works job role candidate candidates team teams company
  years year experience experienced plus preferred required requirements requirement responsibilities
  responsibility skills skill knowledge looking join new help ensure etc e.g i.e like make makes making
  based related relevant across day days opportunity opportunities position apply applicants applicant
  understanding familiarity proficiency proficient hands-on minimum least one two three four five`.split(/\s+/)
)

// Known multi-word / punctuated skills that simple tokenizing would break apart.
const PHRASES = [
  'machine learning', 'deep learning', 'data analysis', 'data science', 'data structures',
  'project management', 'product management', 'unit testing', 'test automation', 'ci/cd',
  'rest api', 'restful api', 'react native', 'node.js', 'next.js', 'vue.js', 'express.js',
  'spring boot', 'google cloud', 'power bi', 'customer service', 'stakeholder management',
  'agile', 'scrum', 'object oriented', 'system design', 'user experience', 'user interface',
  'natural language processing', 'computer vision', 'cross-functional', 'problem solving',
  'c++', 'c#', '.net', 'asp.net', 'tailwind css', 'material ui', 'sql server', 'big data',
]

const COMMON_SKILLS = new Set([
  ...PHRASES,
  'javascript', 'typescript', 'python', 'java', 'go', 'golang', 'rust', 'ruby', 'php', 'kotlin',
  'swift', 'scala', 'sql', 'nosql', 'html', 'css', 'sass', 'react', 'angular', 'vue', 'redux',
  'node', 'express', 'django', 'flask', 'fastapi', 'rails', 'laravel', 'graphql', 'mongodb',
  'mysql', 'postgresql', 'postgres', 'redis', 'elasticsearch', 'kafka', 'aws', 'azure', 'gcp',
  'docker', 'kubernetes', 'terraform', 'jenkins', 'git', 'github', 'gitlab', 'linux', 'bash',
  'jest', 'cypress', 'selenium', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'excel', 'tableau',
  'figma', 'jira', 'bootstrap', 'webpack', 'vite', 'microservices', 'serverless', 'firebase',
  'communication', 'leadership', 'analytics', 'seo', 'marketing', 'sales', 'budgeting',
  'accounting', 'negotiation', 'mentoring', 'testing', 'debugging', 'security', 'devops',
])

// Keep in sync with ACTION_VERBS in client/src/content/writingTips.js
const ACTION_VERBS = new Set(
  `achieved accelerated administered analyzed architected automated boosted built championed collaborated
  completed conducted consolidated coordinated created cut decreased delivered deployed designed developed
  directed drove eliminated enabled engineered enhanced established executed expanded facilitated founded
  generated grew guided implemented improved increased initiated integrated introduced launched led
  maintained managed mentored migrated modernized negotiated optimized orchestrated organized oversaw
  partnered pioneered planned produced programmed published reduced redesigned refactored resolved
  restructured revamped saved scaled secured shipped simplified spearheaded streamlined strengthened
  supervised supported trained transformed tested upgraded wrote`.split(/\s+/)
)

const SECTION_PATTERNS = {
  summary: /^(professional\s+)?(summary|profile|objective|about me)\b/im,
  experience: /^(work\s+|professional\s+)?(experience|employment|work history)\b/im,
  education: /^(education|academic background|qualifications)\b/im,
  skills: /^(technical\s+|core\s+|key\s+)?(skills|competencies|technologies|tech stack)\b/im,
  projects: /^(projects|personal projects|key projects)\b/im,
  certifications: /^(certifications?|licenses|courses)\b/im,
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function containsTerm(lowerText, term) {
  // Word-ish boundaries that tolerate symbols like c++, node.js, ci/cd
  const re = new RegExp(`(^|[^a-z0-9+#.])${escapeRe(term)}(?=$|[^a-z0-9+#])`, 'i')
  return re.test(lowerText)
}

function extractKeywords(jobDescription, limit = 30) {
  const lower = jobDescription.toLowerCase()
  const counts = new Map()

  const phraseWords = new Set()
  for (const phrase of PHRASES) {
    if (!containsTerm(lower, phrase)) continue
    counts.set(phrase, (counts.get(phrase) || 0) + 3)
    if (phrase.includes(' ')) phrase.split(' ').forEach((w) => phraseWords.add(w))
  }

  const tokens = lower.match(/[a-z][a-z0-9+#./-]*[a-z0-9+#]|[a-z]/g) || []
  for (let tok of tokens) {
    tok = tok.replace(/[./-]+$/, '')
    if (tok.length < 2 || STOPWORDS.has(tok) || /^\d+$/.test(tok)) continue
    if (phraseWords.has(tok)) continue
    const bonus = COMMON_SKILLS.has(tok) ? 3 : 1
    counts.set(tok, (counts.get(tok) || 0) + bonus)
  }

  return [...counts.entries()]
    .filter(([term, n]) => n >= 2 || COMMON_SKILLS.has(term))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term)
}

const clamp = (n, max) => Math.max(0, Math.min(max, Math.round(n)))

// "a|b" keyword alternatives: matched if any alternative appears; shown as the first.
const matchesAny = (lower, keyword) => keyword.split('|').some((alt) => containsTerm(lower, alt.trim()))
const displayKeyword = (keyword) => keyword.split('|')[0]

// Keyword source priority: job description > target role > general skills list.
function scoreResume(rawText, jobDescription = '', { source = 'file', role = null } = {}) {
  const text = (rawText || '').replace(/\r/g, '').trim()
  const lower = text.toLowerCase()
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const words = text.split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const categories = []
  const suggestions = []

  if (wordCount < 50) {
    return {
      score: Math.min(10, wordCount),
      wordCount,
      categories: [],
      keywords: { mode: 'none', matched: [], missing: [] },
      suggestions: [
        source === 'builder'
          ? 'Your resume is too short to score yet. Fill in your summary, skills and experience, then check again.'
          : 'Very little text could be read from this file. If it is a scanned PDF or an image, ATS systems cannot read it either — export a text-based PDF or DOCX instead.',
      ],
    }
  }

  // 1. Contact information (10)
  {
    const hasEmail = /[\w.+-]+@[\w-]+\.[\w.]+/.test(text)
    const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(text)
    const hasLink = /(linkedin\.com|github\.com|https?:\/\/|www\.)/i.test(text)
    const tips = []
    if (!hasEmail) tips.push('Add a professional email address.')
    if (!hasPhone) tips.push('Add a phone number.')
    if (!hasLink) tips.push('Add a LinkedIn, GitHub or portfolio link.')
    categories.push({ key: 'contact', label: 'Contact information', score: (hasEmail ? 4 : 0) + (hasPhone ? 3 : 0) + (hasLink ? 3 : 0), max: 10, tips })
  }

  // 2. Standard sections (20)
  {
    const found = Object.entries(SECTION_PATTERNS).filter(([, re]) => re.test(text)).map(([k]) => k)
    const core = ['experience', 'education', 'skills', 'summary']
    const coreFound = core.filter((s) => found.includes(s))
    const extra = found.filter((s) => !core.includes(s)).length
    const tips = core
      .filter((s) => !found.includes(s))
      .map((s) => `Add a clearly labelled "${s[0].toUpperCase() + s.slice(1)}" section heading.`)
    categories.push({ key: 'sections', label: 'Standard sections', score: clamp(coreFound.length * 4.5 + extra * 1, 20), max: 20, tips, found })
  }

  // 3. Keywords (30)
  let keywords
  if (jobDescription && jobDescription.trim().length > 20) {
    const jdKeywords = extractKeywords(jobDescription)
    const matched = jdKeywords.filter((k) => containsTerm(lower, k))
    const missing = jdKeywords.filter((k) => !containsTerm(lower, k))
    const ratio = jdKeywords.length ? matched.length / jdKeywords.length : 0
    keywords = { mode: 'job', matched, missing }
    const tips = []
    if (missing.length) tips.push(`Work these job-description keywords into your resume where they honestly apply: ${missing.slice(0, 10).join(', ')}.`)
    categories.push({ key: 'keywords', label: 'Job keyword match', score: clamp(ratio * 30 / 0.8, 30), max: 30, tips })
  } else if (role) {
    const matched = role.keywords.filter((k) => matchesAny(lower, k)).map(displayKeyword)
    const missing = role.keywords.filter((k) => !matchesAny(lower, k)).map(displayKeyword)
    // Role lists are broad, so matching ~60% of them earns full marks
    const ratio = matched.length / role.keywords.length
    keywords = { mode: 'role', role: { id: role.id, label: role.label }, matched, missing }
    const tips = []
    if (missing.length) {
      tips.push(`Common ${role.label} keywords you could add where they honestly apply: ${missing.slice(0, 10).join(', ')}.`)
    }
    tips.push('For the most accurate match, paste the actual job description.')
    categories.push({ key: 'keywords', label: `${role.label} keywords`, score: clamp((ratio * 30) / 0.6, 30), max: 30, tips })
  } else {
    const matched = [...COMMON_SKILLS].filter((k) => containsTerm(lower, k))
    keywords = { mode: 'general', matched, missing: [] }
    const tips = []
    if (matched.length < 10) tips.push('List more concrete, industry-standard skills and tools by name.')
    tips.push('Pick a target role or paste a job description to see which keywords you are missing.')
    categories.push({ key: 'keywords', label: 'Skill keywords', score: clamp((matched.length / 12) * 30, 30), max: 30, tips })
  }

  // 4. Action verbs (10)
  {
    const starts = lines.map((l) => l.replace(/^[•\-*–·▪●◦\d.)\s]+/, '').split(/\s+/)[0]?.toLowerCase() || '')
    const verbLines = starts.filter((w) => ACTION_VERBS.has(w)).length
    const tips = verbLines < 6 ? ['Start bullet points with strong action verbs (e.g. Led, Built, Reduced, Launched).'] : []
    categories.push({ key: 'verbs', label: 'Action verbs', score: clamp((verbLines / 8) * 10, 10), max: 10, tips })
  }

  // 5. Quantified achievements (10)
  {
    const metrics = (text.match(/(\d+(\.\d+)?\s?%|[$€£₹]\s?\d[\d,.]*\s?[kmb]?|\b\d+(\.\d+)?\s?(x|k|m|\+)(?![a-z])|\b\d{2,}[\d,]*\b(?!\s?(19|20)\d\d))/gi) || []).length
    const tips = metrics < 5 ? ['Quantify results with numbers — percentages, revenue, time saved, users, team size.'] : []
    categories.push({ key: 'metrics', label: 'Quantified results', score: clamp((metrics / 6) * 10, 10), max: 10, tips })
  }

  // 6. Length (10)
  {
    let s, tip
    if (wordCount < 200) { s = 3; tip = `Your resume is short (${wordCount} words). Aim for 400–800 words with more detail on impact.` }
    else if (wordCount < 350) { s = 7; tip = `Consider adding a little more detail (${wordCount} words; 400–800 is typical).` }
    else if (wordCount <= 900) { s = 10 }
    else if (wordCount <= 1200) { s = 7; tip = `Your resume is long (${wordCount} words). Trim older or less relevant points.` }
    else { s = 4; tip = `Your resume is very long (${wordCount} words). Keep it to 1–2 pages.` }
    categories.push({ key: 'length', label: 'Length', score: s, max: 10, tips: tip ? [tip] : [] })
  }

  // 7. Readability / formatting (10)
  {
    let s = 10
    const tips = []
    const pronouns = (lower.match(/\b(i|me|my|myself)\b/g) || []).length
    if (pronouns > 3) { s -= 3; tips.push('Avoid first-person pronouns ("I", "my") — write bullets in implied first person.') }
    const longLines = lines.filter((l) => l.split(/\s+/).length > 45).length
    if (longLines > 2) { s -= 3; tips.push('Break long paragraphs into concise bullet points.') }
    const bullets = lines.filter((l) => /^[•\-*–·▪●◦]/.test(l)).length
    if (bullets < 4) { s -= 2; tips.push('Use bullet points to describe responsibilities and achievements.') }
    if (/[^\x00-\x7F -ɏ‐-‧•▪●◦€£₹]{3,}/.test(text)) { s -= 2; tips.push('Remove unusual symbols, icons or emojis — ATS parsers may garble them.') }
    categories.push({ key: 'format', label: 'Readability', score: clamp(s, 10), max: 10, tips })
  }

  const score = categories.reduce((sum, c) => sum + c.score, 0)
  for (const c of [...categories].sort((a, b) => a.score / a.max - b.score / b.max)) {
    suggestions.push(...c.tips)
  }

  return { score, wordCount, categories, keywords, suggestions: [...new Set(suggestions)] }
}

module.exports = { scoreResume, extractKeywords }
