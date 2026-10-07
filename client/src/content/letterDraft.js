// Builds a first-draft cover letter from a resume using templates (no AI).
// The goal is a solid starting point the user then personalises.

const clean = (arr) => (arr || []).map((s) => (s || '').trim()).filter(Boolean)
const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1)
const stripPeriod = (s) => s.replace(/[.\s]+$/, '')

function joinList(items) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function yearsOfExperience(experience) {
  const years = experience
    .map((e) => parseInt((e.startDate || '').match(/(19|20)\d{2}/)?.[0], 10))
    .filter(Boolean)
  if (!years.length) return 0
  return new Date().getFullYear() - Math.min(...years)
}

const containsSkill = (text, skill) =>
  new RegExp(`(^|[^a-z0-9])${skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9])`).test(text)

export function generateLetterDraft({resume, jobTitle, company, jobDescription}) {
  const role = jobTitle?.trim() || 'this position'
  const org = company?.trim() || 'your company'
  const experience = (resume?.experience || []).filter((e) => e.role || e.company)
  const latest = experience[0]
  const years = yearsOfExperience(experience)
  const skills = clean(resume?.skills)
  const jd = (jobDescription || '').toLowerCase()

  // Opening
  let opening = `I'm excited to apply for the ${role} position at ${org}.`
  if (latest?.role) {
    opening += years >= 2
      ? ` With ${years} years of experience, most recently as ${/^[aeiou]/i.test(latest.role) ? 'an' : 'a'} ${latest.role}${latest.company ? ` at ${latest.company}` : ''}, I've learned how to turn ideas into measurable results.`
      : ` As ${/^[aeiou]/i.test(latest.role) ? 'an' : 'a'} ${latest.role}${latest.company ? ` at ${latest.company}` : ''}, I've been building the skills this role calls for.`
  } else if (resume?.summary?.trim()) {
    opening += ` ${resume.summary.trim().split(/(?<=\.)\s/)[0]}`
  }

  // Achievements: prefer measurable results (%, $, big numbers) from the most recent roles
  const impact = (b) =>
    (b.match(/\d[\d,.]*/g) || []).length + (/%|[$€£₹]/.test(b) ? 2 : 0) + Math.min(b.split(/\s+/).length, 25) / 25
  const achievements = experience
    .slice(0, 2)
    .flatMap((e) => clean(e.bullets).map((b) => ({b, e})))
    .sort((x, y) => impact(y.b) - impact(x.b))
    .slice(0, 2)
  let body1 = ''
  if (achievements.length) {
    const [a1, a2] = achievements
    body1 = `${a1.e.company ? `At ${a1.e.company}, I` : 'In my recent work, I'} ${lowerFirst(stripPeriod(a1.b))}.`
    if (a2) body1 += ` I also ${lowerFirst(stripPeriod(a2.b))}${a2.e !== a1.e && a2.e.company ? ` at ${a2.e.company}` : ''}.`
    body1 += ` I'd bring the same focus on impact to ${org}.`
  }

  // Skills: the ones the job description mentions first
  const matched = jd ? skills.filter((s) => containsSkill(jd, s)) : []
  const featured = (matched.length ? matched : skills).slice(0, 5)
  let body2 = ''
  if (featured.length) {
    body2 = matched.length
      ? `Your posting highlights ${joinList(matched.slice(0, 5))}, and these are areas where I have hands-on experience.`
      : `My toolkit includes ${joinList(featured)}.`
    body2 += ` I'm comfortable working with cross-functional teams and enjoy learning whatever a project needs.`
  }

  const closing = `I'd welcome the chance to discuss how I can contribute to ${org}. Thank you for your time and consideration. I look forward to hearing from you.`

  return [opening, body1, body2, closing].filter(Boolean)
}
