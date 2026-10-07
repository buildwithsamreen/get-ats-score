// Resumes are stored in this browser's localStorage — no account or database needed.
import {LetterStore} from './letters'

const KEY = 'ats.resumes.v1'

const newId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`

export const emptyExperience = () => ({
  company: '', role: '', location: '', startDate: '', endDate: '', isCurrent: false, bullets: [],
})
export const emptyEducation = () => ({school: '', degree: '', field: '', startYear: '', endYear: ''})
export const emptyProject = () => ({name: '', link: '', description: '', bullets: []})

export function blankResume(title) {
  const now = new Date().toISOString()
  return {
    id: newId(),
    title: title?.trim() || 'Untitled Resume',
    templateId: 'ats_classic',
    basics: {fullName: '', email: '', phone: '', location: '', links: []},
    summary: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    scoreHistory: [],
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

function writeAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

const sortByUpdated = (list) => [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

export const ResumeStore = {
  list: () => sortByUpdated(readAll()),

  get: (id) => readAll().find((r) => r.id === id) || null,

  create: (title) => {
    const resume = blankResume(title)
    writeAll([resume, ...readAll()])
    return resume
  },

  // Create from parsed/imported data, filling any missing fields with defaults.
  createFrom: (data, title) => {
    const base = blankResume(title)
    const resume = {
      ...base,
      basics: {...base.basics, ...data.basics},
      summary: data.summary || '',
      skills: data.skills || [],
      experience: (data.experience || []).map((e) => ({...emptyExperience(), ...e})),
      education: (data.education || []).map((e) => ({...emptyEducation(), ...e})),
      projects: (data.projects || []).map((p) => ({...emptyProject(), ...p})),
      certifications: data.certifications || [],
    }
    writeAll([resume, ...readAll()])
    return resume
  },

  save: (resume) => {
    const next = {...resume, updatedAt: new Date().toISOString()}
    writeAll(readAll().map((r) => (r.id === resume.id ? next : r)))
    return next
  },

  remove: (id) => writeAll(readAll().filter((r) => r.id !== id)),

  duplicate: (id) => {
    const src = readAll().find((r) => r.id === id)
    if (!src) return null
    const now = new Date().toISOString()
    const copy = {...structuredClone(src), id: newId(), title: `${src.title} (copy)`, scoreHistory: [], createdAt: now, updatedAt: now}
    writeAll([copy, ...readAll()])
    return copy
  },

  // Backup / restore as a JSON file so users can move resumes between browsers.
  exportBackup: () =>
    JSON.stringify({app: 'ats-resume-builder', version: 2, resumes: readAll(), letters: LetterStore.all()}, null, 2),

  // Returns the number of new resumes + cover letters added.
  importBackup: (json) => {
    const data = JSON.parse(json)
    const incoming = Array.isArray(data) ? data : data?.resumes
    if (!Array.isArray(incoming)) throw new Error('This file is not a resume backup.')
    const lettersAdded = Array.isArray(data?.letters) ? LetterStore.merge(data.letters) : 0
    const existing = readAll()
    const byId = new Map(existing.map((r) => [r.id, r]))
    let added = 0
    for (const r of incoming) {
      if (!r || typeof r !== 'object') continue
      const merged = {...blankResume(), ...r, id: r.id || newId()}
      if (!byId.has(merged.id)) added++
      byId.set(merged.id, merged)
    }
    writeAll([...byId.values()])
    return added + lettersAdded
  },
}
