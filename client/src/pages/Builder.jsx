import {useEffect, useMemo, useRef, useState} from 'react'
import {useParams} from 'react-router-dom'
import {ResumesAPI} from '../api/resumes'

function ATSPreview({resume}) {
  const b = resume?.basics || {}
  return (
    <div style={{border: '1px solid #ddd', padding: 16}}>
      <h2 style={{margin: 0}}>{b.fullName || 'Your Name'}</h2>
      <p style={{marginTop: 6, marginBottom: 12}}>
        {b.email || ''} {b.phone ? ` • ${b.phone}` : ''} {b.location ? ` • ${b.location}` : ''}
      </p>

      <h3>Summary</h3>
      <p>{resume?.summary || ''}</p>

      <h3>Skills</h3>
      <p>{(resume?.skills || []).join(', ')}</p>
    </div>
  )
}

export default function Builder() {
  const {id} = useParams()
  const [resume, setResume] = useState(null)
  const [status, setStatus] = useState('Loading...')
  const [err, setErr] = useState('')

  const saveTimer = useRef(null)
  const dirtyRef = useRef(false)

  const load = async () => {
    setErr('')
    setStatus('Loading...')
    try {
      const data = await ResumesAPI.get(id)
      setResume(data)
      setStatus('Loaded')
      dirtyRef.current = false
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to load resume')
      setStatus('Error')
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const scheduleSave = (next) => {
    setResume(next)
    dirtyRef.current = true
    setStatus('Editing...')

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        await ResumesAPI.update(id, next)
        dirtyRef.current = false
        setStatus('Saved ✅')
      } catch (e) {
        setStatus('Save failed ❌')
        setErr(e?.response?.data?.message || 'Save failed')
      }
    }, 800)
  }

  const setBasics = (patch) => {
    const next = {
      ...resume,
      basics: {...(resume.basics || {}), ...patch},
    }
    scheduleSave(next)
  }

  const setSummary = (value) => scheduleSave({...resume, summary: value})

  const setSkillsFromText = (text) => {
    const skills = text
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    scheduleSave({...resume, skills})
  }

  const skillsText = useMemo(() => (resume?.skills || []).join(', '), [resume])

  if (!resume) return <div style={{padding: 20}}>{err ? err : 'Loading...'}</div>

  return (
    <div style={{padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
      <div>
        <h2>Resume Builder</h2>
        <p style={{opacity: 0.8}}>{status}</p>
        {err && <p style={{color: 'red'}}>{err}</p>}

        <h3>Basics</h3>
        <div style={{display: 'grid', gap: 8}}>
          <input
            placeholder='Full Name'
            value={resume.basics?.fullName || ''}
            onChange={(e) => setBasics({fullName: e.target.value})}
          />
          <input
            placeholder='Email'
            value={resume.basics?.email || ''}
            onChange={(e) => setBasics({email: e.target.value})}
          />
          <input
            placeholder='Phone'
            value={resume.basics?.phone || ''}
            onChange={(e) => setBasics({phone: e.target.value})}
          />
          <input
            placeholder='Location'
            value={resume.basics?.location || ''}
            onChange={(e) => setBasics({location: e.target.value})}
          />
        </div>

        <h3 style={{marginTop: 16}}>Summary</h3>
        <textarea
          rows={6}
          placeholder='Write a short ATS-friendly summary...'
          value={resume.summary || ''}
          onChange={(e) => setSummary(e.target.value)}
          style={{width: '100%'}}
        />

        <h3 style={{marginTop: 16}}>Skills (comma separated)</h3>
        <input
          placeholder='React, Node.js, MongoDB...'
          value={skillsText}
          onChange={(e) => setSkillsFromText(e.target.value)}
        />
      </div>

      <div>
        <h2>ATS Preview</h2>
        <ATSPreview resume={resume} />
      </div>
    </div>
  )
}
