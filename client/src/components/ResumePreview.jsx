import {useEffect, useRef, useState} from 'react'
import {templateFor, PAGE} from '../content/templates'

const clean = (arr) => (arr || []).map((s) => s.trim()).filter(Boolean)
const range = (a, b) => [a, b].filter(Boolean).join(' – ')
const PT_TO_PX = 4 / 3
const ASCENT = 1.157 // Helvetica/Arial line height relative to font size, as PDFKit uses

// Measurements in pt mirror server/services/resumeFormat.js so the preview
// wraps and breaks pages close to how the PDF will.
function metrics(t) {
  const bodyLine = ASCENT * t.size + 1.5 * t.spacing
  const headingLine = ASCENT * (t.size + 1.5)
  return {
    body: {fontSize: `${t.size}pt`, lineHeight: `${bodyLine}pt`},
    heading: {
      fontSize: `${t.size + 1.5}pt`,
      lineHeight: `${headingLine}pt`,
      letterSpacing: '0.5pt',
      color: t.accent,
      borderBottom: `0.7pt solid ${t.accent}`,
      paddingBottom: '1pt',
      marginBottom: `${0.4 * headingLine}pt`,
      marginTop: `${0.8 * t.spacing * bodyLine}pt`,
    },
    entryHead: {fontSize: `${t.size + 0.5}pt`, lineHeight: `${ASCENT * (t.size + 0.5)}pt`},
    meta: {fontSize: `${t.size - 0.5}pt`, lineHeight: `${ASCENT * (t.size - 0.5)}pt`, color: '#444'},
    entryGap: {marginBottom: `${0.4 * t.spacing * bodyLine}pt`},
    list: {paddingLeft: '14pt', margin: 0},
  }
}

function Section({title, m, children}) {
  return (
    <section>
      <div className='fw-bold text-uppercase' style={m.heading}>
        {title}
      </div>
      {children}
    </section>
  )
}

/**
 * Page-sized preview of the resume for a template (US Letter, rendered in pt).
 * With `showPageBreaks`, draws a marker where each new PDF page would start and
 * reports the page estimate via onPageCount.
 */
export default function ResumePreview({resume, templateId = resume.templateId, showPageBreaks, onPageCount, style}) {
  const t = templateFor(templateId)
  const m = metrics(t)
  const contentRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (!showPageBreaks || !contentRef.current) return
    const ro = new ResizeObserver(([e]) => setContentHeight(e.contentRect.height))
    ro.observe(contentRef.current)
    return () => ro.disconnect()
  }, [showPageBreaks])

  const pageContentPx = (PAGE.height - t.margins.top - t.margins.bottom) * PT_TO_PX
  const pages = Math.max(1, Math.ceil((contentHeight - 1) / pageContentPx))
  useEffect(() => {
    if (showPageBreaks) onPageCount?.(pages)
  }, [pages, showPageBreaks, onPageCount])

  const b = resume.basics || {}
  const contact = [b.email, b.phone, b.location, ...clean(b.links)].filter(Boolean).join(' | ')
  const experience = (resume.experience || []).filter((e) => e.company || e.role)
  const education = (resume.education || []).filter((e) => e.school || e.degree)
  const projects = (resume.projects || []).filter((p) => p.name)
  const certs = clean(resume.certifications)
  const skills = clean(resume.skills)

  const sections = {
    summary: resume.summary?.trim() && (
      <Section key='summary' title='Summary' m={m}>
        <div style={{whiteSpace: 'pre-line'}}>{resume.summary}</div>
      </Section>
    ),
    skills: skills.length > 0 && (
      <Section key='skills' title='Skills' m={m}>
        <div>{skills.join(', ')}</div>
      </Section>
    ),
    experience: experience.length > 0 && (
      <Section key='experience' title='Experience' m={m}>
        {experience.map((e, i) => (
          <div key={i} style={m.entryGap}>
            <div className='fw-bold' style={m.entryHead}>{[e.role, e.company].filter(Boolean).join(', ')}</div>
            <div style={m.meta}>
              {[e.location, range(e.startDate, e.isCurrent ? 'Present' : e.endDate)].filter(Boolean).join(' | ')}
            </div>
            <ul style={m.list}>
              {clean(e.bullets).map((bl, j) => <li key={j}>{bl}</li>)}
            </ul>
          </div>
        ))}
      </Section>
    ),
    projects: projects.length > 0 && (
      <Section key='projects' title='Projects' m={m}>
        {projects.map((p, i) => (
          <div key={i} style={m.entryGap}>
            <div className='fw-bold' style={m.entryHead}>{p.name}</div>
            {p.link && <div style={m.meta}>{p.link}</div>}
            <ul style={m.list}>
              {[p.description, ...clean(p.bullets)].filter(Boolean).map((bl, j) => <li key={j}>{bl}</li>)}
            </ul>
          </div>
        ))}
      </Section>
    ),
    education: education.length > 0 && (
      <Section key='education' title='Education' m={m}>
        {education.map((e, i) => (
          <div key={i} style={m.entryGap}>
            <div className='fw-bold' style={m.entryHead}>
              {[[e.degree, e.field].filter(Boolean).join(' in '), e.school].filter(Boolean).join(', ')}
            </div>
            <div style={m.meta}>{range(e.startYear, e.endYear)}</div>
          </div>
        ))}
      </Section>
    ),
    certifications: certs.length > 0 && (
      <Section key='certifications' title='Certifications' m={m}>
        <ul style={m.list}>{certs.map((c, i) => <li key={i}>{c}</li>)}</ul>
      </Section>
    ),
  }

  const {top, right, bottom, left} = t.margins
  return (
    <div
      className='paper position-relative'
      style={{
        width: `${PAGE.width}pt`,
        minHeight: `${PAGE.height}pt`,
        padding: `${top}pt ${right}pt ${bottom}pt ${left}pt`,
        fontFamily: t.font,
        color: '#000',
        ...m.body,
        ...style,
      }}
    >
      <div ref={contentRef}>
        <div
          className='fw-bold'
          style={{fontSize: `${t.nameSize}pt`, lineHeight: `${ASCENT * t.nameSize}pt`, color: t.accent, textAlign: t.nameAlign}}
        >
          {b.fullName || 'Your Name'}
        </div>
        {contact && <div style={{...m.meta, color: '#333', textAlign: t.nameAlign}}>{contact}</div>}
        {t.order.map((key) => sections[key])}
      </div>

      {showPageBreaks &&
        Array.from({length: pages - 1}, (_, i) => (
          <div
            key={i}
            aria-hidden='true'
            className='position-absolute start-0 end-0 d-flex align-items-center'
            style={{top: `calc(${top}pt + ${(i + 1) * pageContentPx}px)`, pointerEvents: 'none'}}
          >
            <div className='flex-grow-1' style={{borderTop: '2px dashed #dc3545'}} />
            <span
              className='px-2 py-1 rounded-pill text-white fw-semibold'
              style={{background: '#dc3545', fontSize: '9pt', fontFamily: 'system-ui, sans-serif', marginRight: '8pt'}}
            >
              Page {i + 2} starts here
            </span>
          </div>
        ))}
    </div>
  )
}
