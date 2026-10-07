import {useEffect, useState} from 'react'
import {AtsAPI} from '../api/ats'

// Loads the target-role list from the server (cached). Returns [] until loaded
// or if the server is unreachable, so callers can simply hide the picker.
export function useRoles() {
  const [roles, setRoles] = useState([])
  useEffect(() => {
    let alive = true
    AtsAPI.roles()
      .then((r) => alive && setRoles(r))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  return roles
}

// Best guess of a role id from a job title, e.g. "Senior Data Analyst" → data-analyst.
export function guessRole(roles, title) {
  const t = ` ${(title || '').toLowerCase().replace(/[^a-z0-9+/ -]/g, ' ')} `
  if (!t.trim()) return ''
  let best = {id: '', score: 0}
  for (const r of roles) {
    for (const name of [r.label.toLowerCase(), ...(r.aliases || [])]) {
      const n = name.split(/\s*\/\s*/)[0] // "UX / UI Designer" → "ux"
      if (t.includes(` ${name} `) || t.includes(` ${n} `)) {
        const score = name.length // prefer the most specific match
        if (score > best.score) best = {id: r.id, score}
      }
    }
  }
  return best.id
}
