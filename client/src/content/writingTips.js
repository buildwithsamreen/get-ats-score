// Writing guidance shown in the score report and the builder.
// Verbs here must stay in sync with ACTION_VERBS in server/services/atsScorer.js
// so the live bullet checker agrees with the score.

export const VERB_GROUPS = {
  Leadership: ['Led', 'Directed', 'Spearheaded', 'Supervised', 'Mentored', 'Oversaw', 'Championed', 'Guided', 'Trained', 'Orchestrated'],
  Building: ['Built', 'Designed', 'Developed', 'Engineered', 'Architected', 'Launched', 'Created', 'Implemented', 'Shipped', 'Founded'],
  Improving: ['Improved', 'Optimized', 'Streamlined', 'Reduced', 'Increased', 'Accelerated', 'Enhanced', 'Modernized', 'Revamped', 'Simplified'],
  Results: ['Achieved', 'Delivered', 'Generated', 'Grew', 'Saved', 'Boosted', 'Expanded', 'Scaled', 'Secured', 'Eliminated'],
  Teamwork: ['Collaborated', 'Partnered', 'Coordinated', 'Facilitated', 'Negotiated', 'Analyzed', 'Resolved', 'Planned', 'Organized', 'Conducted'],
}

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

const WEAK_STARTS = [
  [/^(was\s+)?responsible for\b/i, 'Replace "Responsible for" with what you actually achieved.'],
  [/^(worked|working) on\b/i, 'Replace "Worked on" with a specific verb like Built, Designed or Improved.'],
  [/^(helped|assisted)( with| in)?\b/i, 'Say what you did yourself, e.g. "Implemented…" rather than "Helped with…".'],
  [/^(duties|tasks) included\b/i, 'List achievements, not duties.'],
]

// Live feedback for one achievement line in the builder.
export function checkBullet(line) {
  const text = line.trim()
  if (!text) return []
  const issues = []
  const weak = WEAK_STARTS.find(([re]) => re.test(text))
  const first = text.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '')
  if (weak) issues.push(weak[1])
  else if (!ACTION_VERBS.has(first)) issues.push('Start with an action verb (e.g. Led, Built, Reduced).')
  if (!/\d/.test(text)) issues.push('Add a number: %, $, time saved, users, team size.')
  if (/\b(i|me|my)\b/i.test(text)) issues.push('Drop "I"/"my". Bullets are written without a subject.')
  const words = text.split(/\s+/).length
  if (words > 35) issues.push(`Too long (${words} words). Aim for 1–2 lines.`)
  else if (words < 5) issues.push('Too short. Add what you did and the result.')
  return issues
}

// "How to fix" panels in the score report, keyed by scorer category.
export const CATEGORY_HELP = {
  contact: {
    text: 'Put your contact details as plain text at the top, not in a header/footer or image, where ATS parsers often skip them.',
    weak: 'Contact info inside a page header or as icons only',
    strong: 'Jane Doe · jane@email.com · (555) 123-4567 · Austin, TX · linkedin.com/in/janedoe',
  },
  sections: {
    text: 'Use standard headings ATS systems recognise. Creative names like "My Journey" may not be mapped to the right field.',
    weak: '"Where I\'ve Been", "What I Know", "My Story"',
    strong: '"Experience", "Skills", "Education", "Summary"',
  },
  keywords: {
    text: 'Mirror the exact wording from the job posting for skills you genuinely have. Spell out acronyms once, e.g. "Amazon Web Services (AWS)".',
    weak: 'Worked with cloud stuff and front-end frameworks',
    strong: 'Deployed React and TypeScript apps to AWS (Lambda, S3) using Docker',
  },
  verbs: {
    text: 'Start every bullet with a strong past-tense verb (present tense for your current role). Avoid "Responsible for" and "Helped".',
    weak: 'Responsible for the company website',
    strong: 'Redesigned the company website, raising sign-ups by 25%',
  },
  metrics: {
    text: 'Numbers make impact concrete. Estimate honestly if you don\'t have exact figures: scale, speed, money, people or frequency.',
    weak: 'Improved customer support process',
    strong: 'Cut average ticket response time from 24h to 6h for 3,000+ monthly customers',
  },
  length: {
    text: 'Aim for one page with under ~8 years of experience, two pages beyond that. Cut older, less relevant points before cutting results.',
    weak: 'Every task from every job since school',
    strong: '3–5 achievement bullets for recent roles, 1–2 for older ones',
  },
  format: {
    text: 'Keep a simple single-column layout with bullets, no tables, text boxes, icons or images. Write without "I" and "my".',
    weak: 'I was in charge of managing my team\'s weekly reports and I made them faster',
    strong: 'Automated weekly team reports, saving 5 hours per week',
  },
}

export const SUMMARY_TEMPLATES = {
  'Software Engineer':
    '[Role] with [X] years of experience building [type of products] using [top 3 technologies]. Shipped [notable achievement with a number]. Known for [strength, e.g. clean architecture / fast delivery], now looking to [goal] at [type of company].',
  'Data Analyst':
    'Data analyst with [X] years of experience turning [type of data] into decisions for [teams/industry]. Skilled in [SQL, Python, BI tool]. Built [dashboard/model] that [result with a number].',
  'Product / Project Manager':
    '[Role] with [X] years leading cross-functional teams of [size] to deliver [type of products/projects]. Launched [notable launch] that [result with a number]. Strong in [roadmapping, stakeholder management, Agile].',
  'Designer':
    '[UX/UI/Product] designer with [X] years of experience designing [type of products] for [audience]. Led [project] that improved [metric] by [number]. Skilled in [Figma, user research, design systems].',
  'Marketing':
    '[Role] with [X] years of experience growing [brand/product type] through [channels]. Drove [result, e.g. 40% increase in qualified leads] by [how]. Skilled in [SEO, paid social, analytics tools].',
  'Sales':
    '[Role] with [X] years of experience selling [product/service] to [customer type]. Consistently exceeded quota ([e.g. 120% of target in 2024]) and grew [territory/accounts] by [number].',
  'Customer Support':
    'Customer support specialist with [X] years of experience resolving [type of issues] for [customer base]. Maintained a [CSAT score]% satisfaction score while handling [volume] tickets per [period].',
  'Student / Fresher':
    '[Degree] student/graduate at [University] with hands-on experience in [skills] through [internships/projects]. Built [project] that [result]. Eager to contribute to [type of role] at [type of company].',
  'Career Changer':
    '[Previous role] transitioning into [new field], bringing [X] years of [transferable skills, e.g. client management, data analysis]. Completed [course/certification] and built [project] using [tools].',
}
