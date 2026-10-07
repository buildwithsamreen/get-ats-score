import {http} from './http'

// Strip local-only fields before sending a resume to the server.
const payload = (resume) => {
  const copy = {...resume}
  delete copy.id
  delete copy.createdAt
  delete copy.updatedAt
  delete copy.scoreHistory
  delete copy.targetRole
  return copy
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

let rolesPromise = null

export const AtsAPI = {
  // onProgress(fraction 0–1) reports upload progress for large files.
  // Keyword source: jobDescription if given, else the target role id, else general skills.
  scoreFile: async (file, {jobDescription = '', role = ''} = {}, onProgress) => {
    const form = new FormData()
    form.append('resume', file)
    form.append('jobDescription', jobDescription)
    form.append('role', role)
    return (await http.post('/ats/score-file', form, {onUploadProgress: (e) => onProgress?.(e.progress ?? 0)})).data
  },

  parseFile: async (file, onProgress) => {
    const form = new FormData()
    form.append('resume', file)
    return (await http.post('/ats/parse-file', form, {onUploadProgress: (e) => onProgress?.(e.progress ?? 0)})).data
  },

  scoreResume: async (resume, {jobDescription = '', role = ''} = {}) =>
    (await http.post('/ats/score-resume', {resume: payload(resume), jobDescription, role})).data,

  // Cached for the session: the role list rarely changes.
  roles: () => {
    rolesPromise ||= http.get('/ats/roles').then((r) => r.data).catch((e) => {
      rolesPromise = null
      throw e
    })
    return rolesPromise
  },

  exportResume: async (resume, format) => {
    const res = await http.post(`/ats/export/${format}`, {resume: payload(resume)}, {responseType: 'blob'})
    const base = (resume.basics?.fullName || resume.title || 'resume').replace(/[^\w-]+/g, '_')
    saveBlob(res.data, `${base}.${format}`)
    return Number(res.headers['x-page-count']) || null // PDF only
  },

  exportLetter: async (letter, format) => {
    const body = payload(letter)
    delete body.jobDescription
    const res = await http.post(`/ats/export-letter/${format}`, {letter: body}, {responseType: 'blob'})
    const base = `${letter.sender?.fullName || 'cover'}_Cover_Letter`.replace(/[^\w-]+/g, '_')
    saveBlob(res.data, `${base}.${format}`)
  },

  saveBlob,
}
