// Best-effort conversion of plain resume text into the builder's structure.
// Resumes vary wildly, so this favours "put text somewhere sensible" over
// perfect accuracy — the user reviews the result in the builder.

const HEADINGS = [
  ['summary', /^(professional\s+|career\s+)?(summary|profile|objective|about( me)?)$/],
  ['experience', /^(work\s+|professional\s+|relevant\s+)?(experience|employment( history)?|work history|career history)$/],
  ['education', /^(education|academic background|academics|qualifications|education & training)$/],
  ['skills', /^(technical\s+|core\s+|key\s+)?(skills|competencies|technologies|tech stack|skills & tools|tools)$/],
  ['projects', /^(personal\s+|key\s+|selected\s+|academic\s+)?projects$/],
  ['certifications', /^(certifications?|licenses( & certifications)?|certificates|courses)$/],
]

const BULLET_RE = /^[•\-*–·▪●◦‣⁃]\s*/
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/
const PHONE_RE = /\+?\(?\d[\d\s().-]{7,}\d/
const LINK_RE = /((https?:\/\/)?(www\.)?(linkedin\.com|github\.com|gitlab\.com|behance\.net|dribbble\.com)\/[^\s|,]+|https?:\/\/[^\s|,]+)/gi

const hasLink = (s) => new RegExp(LINK_RE.source, 'i').test(s)

const MONTH = '(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?'
const DATE = `((${MONTH}\\s+)?\\d{4}|\\d{1,2}/\\d{4})`
const RANGE_RE = new RegExp(`${DATE}\\s*(–|—|-|to)\\s*(${DATE}|present|current|now)`, 'i')
const SINGLE_DATE_RE = new RegExp(`(${MONTH}\\s+)?\\b(19|20)\\d{2}\\b`, 'i')

const DEGREE_RE = /\b(b\.?\s?sc|b\.?\s?s\.?|b\.?\s?a\.?|b\.?\s?tech|b\.?\s?e\.?|bachelor'?s?|m\.?\s?sc|m\.?\s?s\.?|m\.?\s?a\.?|m\.?\s?tech|mba|master'?s?|ph\.?\s?d|doctorate|associate'?s?|diploma|certificate|high school)\b/i
const SCHOOL_RE = /\b(university|college|institute|school|academy|polytechnic)\b/i

function headingKey(line) {
  const norm = line.toLowerCase().replace(/[:\s]+$/, '').replace(/\s+/g, ' ').trim()
  if (norm.split(' ').length > 4) return null
  for (const [key, re] of HEADINGS) if (re.test(norm)) return key
  return null
}

const LOCATION_RE = /^[A-Za-z .'-]+,\s*[A-Za-z .'-]{2,}$/

// Split "Role | Company, City, ST" style lines. A later piece shaped like
// "City, ST" is kept whole as a location.
function splitParts(s, {strong = /\s*(?:\||•|·|\s[–—-]\s|\s@\s|\sat\s)\s*/} = {}) {
  return s
    .split(strong)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((p, i) => {
      // The first piece is a role/degree, never a location, so always split it
      if (!p.includes(',') || (i > 0 && LOCATION_RE.test(p))) return [p]
      const c = p.indexOf(',')
      return [p.slice(0, c).trim(), p.slice(c + 1).trim()].filter(Boolean)
    })
}

function takeRange(line) {
  const m = line.match(RANGE_RE)
  if (m) {
    const [start, , end] = m[0].split(/\s*(–|—|-|to)\s*/i)
    const isCurrent = /present|current|now/i.test(end)
    const rest = (line.slice(0, m.index) + line.slice(m.index + m[0].length)).replace(/[|,(–—-]\s*$|^\s*[|,)–—-]/g, '').trim()
    return { start: start.trim(), end: isCurrent ? '' : end.trim(), isCurrent, rest }
  }
  const single = line.match(SINGLE_DATE_RE)
  if (single && line.replace(single[0], '').trim().length < 4) {
    return { start: '', end: single[0].trim(), isCurrent: false, rest: '' }
  }
  return null
}

// Group section lines into entries: heading-ish lines followed by bullets.
function groupEntries(lines, {newEntryAfterDates = false} = {}) {
  const entries = []
  let cur = null
  const start = () => (cur = { head: [], dates: null, bullets: [] }) && entries.push(cur)

  for (const raw of lines) {
    const isBullet = BULLET_RE.test(raw)
    const line = raw.replace(BULLET_RE, '').trim()
    if (!line) continue

    if (isBullet) {
      if (!cur) start()
      cur.bullets.push(line)
      continue
    }

    // Wrapped continuation of the previous bullet
    if (cur?.bullets.length && /^[a-z(]/.test(line)) {
      cur.bullets[cur.bullets.length - 1] += ` ${line}`
      continue
    }

    // Long prose line without a bullet marker is still a bullet
    if (cur && line.split(/\s+/).length > 12 && !RANGE_RE.test(line)) {
      cur.bullets.push(line)
      continue
    }

    const range = takeRange(line)
    if (!cur || cur.bullets.length || (range && cur.dates) || (!range && (cur.head.length >= 3 || (newEntryAfterDates && cur.dates)))) start()
    if (range) {
      cur.dates = range
      if (range.rest) cur.head.push(range.rest)
    } else {
      cur.head.push(line)
    }
  }
  return entries
}

function parseExperience(lines) {
  return groupEntries(lines).map((e) => {
    const parts = e.head.flatMap(splitParts)
    let [role = '', company = '', location = ''] = parts
    // "Acme Corp" then "Engineer" is also common — prefer the line with a job-title word as role
    if (/\b(inc|llc|ltd|corp|corporation|company|gmbh|technologies|solutions|labs)\b/i.test(role) && company) {
      ;[role, company] = [company, role]
    }
    return {
      company, role, location,
      startDate: e.dates?.start || '',
      endDate: e.dates?.end || '',
      isCurrent: !!e.dates?.isCurrent,
      bullets: e.bullets,
    }
  })
}

function parseEducation(lines) {
  return groupEntries(lines, {newEntryAfterDates: true}).map((e) => {
    const parts = [...e.head.flatMap((h) => splitParts(h, {strong: /\s*(?:\||•|·|\s[–—-]\s)\s*/})), ...e.bullets]
    const degreeLine = parts.find((p) => DEGREE_RE.test(p) && !SCHOOL_RE.test(p)) || ''
    const school = parts.find((p) => SCHOOL_RE.test(p)) || parts.find((p) => p !== degreeLine) || ''
    let [degree, field = ''] = degreeLine.split(/\s+in\s+/)
    if (!DEGREE_RE.test(degree || '') && !field) [degree, field] = ['', degreeLine]
    return {
      school,
      degree: (degree || '').trim(),
      field: field.trim(),
      startYear: e.dates?.start || '',
      endYear: e.dates?.isCurrent ? 'Present' : e.dates?.end || '',
    }
  })
}

function parseProjects(lines) {
  return groupEntries(lines).map((e) => {
    const head = e.head.join(' | ')
    const link = (head.match(LINK_RE) || [])[0] || ''
    const parts = splitParts(head.replace(link, ''))
    return { name: parts[0] || head, link, description: parts.slice(1).join(', '), bullets: e.bullets }
  })
}

function parseSkills(lines) {
  const skills = lines
    .map((l) => l.replace(BULLET_RE, '').replace(/^[^:]{1,30}:\s*/, ''))
    .flatMap((l) => l.split(/\s*[,;|•·]\s*/))
    .map((s) => s.trim().replace(/\.$/, ''))
    .filter((s) => s && s.length <= 40)
  return [...new Set(skills)]
}

function parseHeader(lines, allText) {
  const email = (allText.match(EMAIL_RE) || [''])[0]
  const phone = ((lines.join(' ').match(PHONE_RE) || allText.match(PHONE_RE)) || [''])[0].trim()
  const links = [...new Set(lines.join(' ').match(LINK_RE) || [])]

  const fullName =
    lines.find((l) => !EMAIL_RE.test(l) && !PHONE_RE.test(l) && !hasLink(l) && /^[A-Za-z][A-Za-z.'\- ]{2,40}$/.test(l) && l.split(/\s+/).length <= 4) || ''

  const pieces = lines.flatMap((l) => l.split(/\s*[|•·]\s*/))
  const location =
    pieces.find((p) => p !== fullName && /^[A-Za-z .'-]+,\s*[A-Za-z .'-]+$/.test(p) && !EMAIL_RE.test(p)) || ''

  return { fullName, email, phone, location, links }
}

function parseResumeText(rawText) {
  const lines = (rawText || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.replace(/\t/g, ' ').replace(/\s{2,}/g, ' ').trim())
    .filter((l) => l && !/^--\s*\d+\s*of\s*\d+\s*--$/.test(l)) // pdf page markers

  const sections = { header: [] }
  let current = 'header'
  for (const line of lines) {
    const key = headingKey(line)
    if (key) {
      current = key
      sections[key] = sections[key] || []
    } else {
      sections[current].push(line)
    }
  }

  const warnings = []
  const found = Object.keys(sections).filter((k) => k !== 'header')
  if (!found.length) warnings.push("We couldn't find standard section headings, so most content may need to be filled in by hand.")

  const basics = parseHeader(sections.header.slice(0, 8), lines.join('\n'))
  // Header text that isn't contact info is usually a summary/tagline
  const headerExtra = sections.header.filter(
    (l) => l !== basics.fullName && !EMAIL_RE.test(l) && !PHONE_RE.test(l) && !l.includes(basics.location || '\u0000') && !hasLink(l)
  )

  const summary = (sections.summary || (headerExtra.join(' ').split(/\s+/).length > 15 ? headerExtra : [])).join(' ')

  return {
    resume: {
      basics,
      summary,
      skills: parseSkills(sections.skills || []),
      experience: parseExperience(sections.experience || []),
      education: parseEducation(sections.education || []),
      projects: parseProjects(sections.projects || []),
      certifications: (sections.certifications || []).map((l) => l.replace(BULLET_RE, '').trim()).filter(Boolean),
    },
    warnings,
  }
}

module.exports = { parseResumeText }
