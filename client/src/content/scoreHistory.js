// Score history saved on each resume (resume.scoreHistory), newest last.
const MAX_ENTRIES = 30

export function addScoreEntry(history = [], result) {
  const entry = {
    at: new Date().toISOString(),
    score: result.score,
    mode: result.keywords?.mode || 'general',
    role: result.keywords?.role || null, // {id, label} when scored against a target role
    categories: Object.fromEntries((result.categories || []).map((c) => [c.key, c.score])),
  }
  return [...history, entry].slice(-MAX_ENTRIES)
}

// Scores against a job description, a target role, or general skills aren't
// comparable, so we only compare checks of the same kind as the latest one.
const kindOf = (h) => (h.mode === 'job' ? 'job' : h.mode === 'role' ? `role:${h.role?.id}` : 'general')

export function comparableHistory(history = []) {
  const latest = history[history.length - 1]
  if (!latest) return []
  return history.filter((h) => kindOf(h) === kindOf(latest))
}

export function describeKind(entry) {
  if (entry.mode === 'job') return 'with a job description'
  if (entry.mode === 'role') return `for ${entry.role?.label || 'a target role'}`
  return 'without a job description'
}
