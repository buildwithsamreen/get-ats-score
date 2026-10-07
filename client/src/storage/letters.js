// Cover letters live in localStorage next to resumes (see ./resumes.js).
const KEY = 'ats.letters.v1'

const newId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`

const today = () => new Date().toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})

export const senderFromResume = (resume) => {
  const b = resume?.basics || {}
  return {
    fullName: b.fullName || '',
    email: b.email || '',
    phone: b.phone || '',
    location: b.location || '',
    links: (b.links || []).filter((l) => l.trim()),
  }
}

export function blankLetter(resume, title) {
  const now = new Date().toISOString()
  return {
    id: newId(),
    title: title?.trim() || (resume ? `Cover letter – ${resume.title}` : 'Untitled Cover Letter'),
    resumeId: resume?.id || '',
    templateId: resume?.templateId || 'ats_classic',
    sender: senderFromResume(resume),
    recipient: {name: '', company: '', address: ''},
    jobTitle: '',
    jobDescription: '',
    date: today(),
    paragraphs: [],
    signOff: 'Sincerely,',
    createdAt: now,
    updatedAt: now,
  }
}

function readAll() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

const writeAll = (list) => localStorage.setItem(KEY, JSON.stringify(list))

export const LetterStore = {
  all: readAll,

  list: () => [...readAll()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),

  get: (id) => readAll().find((l) => l.id === id) || null,

  create: (resume, title) => {
    const letter = blankLetter(resume, title)
    writeAll([letter, ...readAll()])
    return letter
  },

  save: (letter) => {
    const next = {...letter, updatedAt: new Date().toISOString()}
    writeAll(readAll().map((l) => (l.id === letter.id ? next : l)))
    return next
  },

  remove: (id) => writeAll(readAll().filter((l) => l.id !== id)),

  duplicate: (id) => {
    const src = readAll().find((l) => l.id === id)
    if (!src) return null
    const now = new Date().toISOString()
    const copy = {...structuredClone(src), id: newId(), title: `${src.title} (copy)`, createdAt: now, updatedAt: now}
    writeAll([copy, ...readAll()])
    return copy
  },

  // Used by the backup restore in ./resumes.js; returns how many were new.
  merge: (incoming) => {
    const byId = new Map(readAll().map((l) => [l.id, l]))
    let added = 0
    for (const l of incoming || []) {
      if (!l || typeof l !== 'object') continue
      const merged = {...blankLetter(), ...l, id: l.id || newId()}
      if (!byId.has(merged.id)) added++
      byId.set(merged.id, merged)
    }
    writeAll([...byId.values()])
    return added
  },
}
