import {useCallback, useEffect, useState} from 'react'
import {Link, useLocation, useNavigate, useParams} from 'react-router-dom'
import {Container, Row, Col, Form, Button, Card, Accordion, Tabs, Tab, Alert, Spinner} from 'react-bootstrap'
import {CircleCheck, FileDown, FileText, Mail, Palette, Redo2, TriangleAlert, Undo2} from 'lucide-react'
import {ResumeStore, emptyEducation, emptyExperience, emptyProject} from '../storage/resumes'
import {LetterStore} from '../storage/letters'
import {AtsAPI} from '../api/ats'
import {errorMessage} from '../api/http'
import usePageMeta from '../hooks/usePageMeta'
import ScoreReport from '../components/ScoreReport'
import ScoreHistory from '../components/ScoreHistory'
import {addScoreEntry} from '../content/scoreHistory'
import Field from '../components/Field'
import {BulletsField, SummaryTemplatePicker} from '../components/WritingHelpers'
import RolePicker from '../components/RolePicker'
import {useRoles, guessRole} from '../content/roles'
import {templateFor, PAGE} from '../content/templates'
import ResumePreview from '../components/ResumePreview'
import ScaledPage from '../components/ScaledPage'
import MobileViewSwitch from '../components/MobileViewSwitch'
import TemplatePicker from '../components/TemplatePicker'
import {track, scoreBucket} from '../analytics'

const linesToArray = (text) => text.split('\n')
const clean = (arr) => (arr || []).map((s) => s.trim()).filter(Boolean)

// Editable list of repeated entries (experience, education, projects).
function ListEditor({items, onChange, makeEmpty, addLabel, renderItem, itemTitle}) {
  const update = (i, patch) => onChange(items.map((it, j) => (j === i ? {...it, ...patch} : it)))
  const remove = (i) => onChange(items.filter((_, j) => j !== i))
  const move = (i, dir) => {
    const next = [...items]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <>
      {items.map((it, i) => (
        <Card key={i} className='mb-3 border'>
          <Card.Header className='d-flex justify-content-between align-items-center bg-body-tertiary py-2'>
            <span className='small fw-semibold text-truncate'>{itemTitle(it) || `Entry ${i + 1}`}</span>
            <span className='d-flex gap-1'>
              <Button size='sm' variant='outline-secondary' onClick={() => move(i, -1)} disabled={i === 0} aria-label='Move up'>↑</Button>
              <Button size='sm' variant='outline-secondary' onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label='Move down'>↓</Button>
              <Button size='sm' variant='outline-danger' onClick={() => remove(i)}>Remove</Button>
            </span>
          </Card.Header>
          <Card.Body className='d-grid gap-2'>{renderItem(it, (patch) => update(i, patch), i)}</Card.Body>
        </Card>
      ))}
      <Button variant='outline-primary' size='sm' onClick={() => onChange([...items, makeEmpty()])}>
        + {addLabel}
      </Button>
    </>
  )
}

const UNDO_GROUP_MS = 1000 // edits closer together than this undo as one step
const UNDO_LIMIT = 100
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const MOD = isMac ? '⌘' : 'Ctrl'

export default function Builder() {
  const {id} = useParams()
  const initial = ResumeStore.get(id)
  usePageMeta({title: initial?.title || 'Resume builder', noindex: true})
  if (!initial) {
    return (
      <Container className='py-5'>
        <Alert variant='warning'>
          This resume wasn't found in this browser. <Link to='/resumes'>Back to My Resumes</Link>
        </Alert>
      </Container>
    )
  }
  return <BuilderEditor initial={initial} />
}

function BuilderEditor({initial}) {
  const [resume, setResume] = useState(initial)
  const [history, setHistory] = useState({past: [], future: [], lastAt: 0})
  const [pageEstimate, setPageEstimate] = useState(1)
  const [mobileView, setMobileView] = useState('edit')
  const [skillsText, setSkillsText] = useState(() => (resume?.skills || []).join(', '))
  const [savedAt, setSavedAt] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const roles = useRoles()
  // A saved choice wins (including '' for "no role"); otherwise guess from the latest job title
  const targetRole = resume.targetRole ?? guessRole(roles, resume.experience?.[0]?.role || resume.title)
  const [scoring, setScoring] = useState(false)
  const [result, setResult] = useState(null)
  const [exporting, setExporting] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [pageNote, setPageNote] = useState(null)
  const [err, setErr] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const [importInfo, setImportInfo] = useState(() => (location.state?.imported ? location.state : null))

  const commit = useCallback((next) => {
    const saved = ResumeStore.save(next)
    setResume(saved)
    setSavedAt(new Date(saved.updatedAt))
    return saved
  }, [])

  // record: false for changes that shouldn't be undoable (e.g. saving a score)
  const update = (patch, {record = true} = {}) => {
    if (record) {
      const now = Date.now()
      setHistory((h) => ({
        past: now - h.lastAt < UNDO_GROUP_MS ? h.past : [...h.past, resume].slice(-UNDO_LIMIT),
        future: [],
        lastAt: now,
      }))
    }
    commit({...resume, ...patch})
  }

  // Score history isn't part of undo: keep the current one when restoring a snapshot.
  const restore = (snapshot) => {
    const saved = commit({...snapshot, scoreHistory: resume.scoreHistory})
    setSkillsText((saved.skills || []).join(', '))
  }
  const undo = () => {
    if (!history.past.length) return
    restore(history.past[history.past.length - 1])
    setHistory({past: history.past.slice(0, -1), future: [resume, ...history.future], lastAt: 0})
  }
  const redo = () => {
    if (!history.future.length) return
    restore(history.future[0])
    setHistory({past: [...history.past, resume], future: history.future.slice(1), lastAt: 0})
  }

  // ⌘/Ctrl+Z, ⌘/Ctrl+Shift+Z, Ctrl+Y. Re-subscribes each render so it sees current state.
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return
      if (e.target.closest?.('[data-native-undo]')) return
      const key = e.key.toLowerCase()
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((key === 'z' && e.shiftKey) || (key === 'y' && !isMac)) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  const setBasics = (patch) => update({basics: {...resume.basics, ...patch}})

  const runScore = async () => {
    setErr('')
    setScoring(true)
    try {
      const res = await AtsAPI.scoreResume(resume, {jobDescription, role: targetRole})
      setResult(res)
      track('Resume scored', {source: 'builder', keywords: res.keywords?.mode || 'none', score: scoreBucket(res.score)})
      // Re-read from storage so edits made while the check was running aren't lost
      const latest = ResumeStore.get(resume.id) || resume
      update({...latest, targetRole, scoreHistory: addScoreEntry(latest.scoreHistory, res)}, {record: false})
    } catch (e) {
      setErr(errorMessage(e, 'Scoring failed'))
    } finally {
      setScoring(false)
    }
  }

  const download = async (format) => {
    setErr('')
    setExporting(format)
    try {
      const pages = await AtsAPI.exportResume(resume, format)
      track('Exported', {doc: 'resume', format, template: resume.templateId})
      setPageNote(format === 'pdf' && pages > 1 ? pages : null)
    } catch (e) {
      setErr(errorMessage(e, 'Export failed'))
    } finally {
      setExporting('')
    }
  }

  return (
    <Container fluid='xl' className='py-4'>
      <div className='d-flex flex-wrap align-items-center gap-2 mb-3'>
        <Link to='/resumes' className='text-decoration-none small'>← My Resumes</Link>
        <Form.Control
          className='fw-bold fs-5 border-0 bg-transparent'
          style={{maxWidth: 380}}
          value={resume.title}
          onChange={(e) => update({title: e.target.value})}
          aria-label='Resume title'
        />
        <small className='text-secondary'>{savedAt ? `Saved ${savedAt.toLocaleTimeString()}` : 'All changes save automatically'}</small>
        <div className='ms-auto d-flex gap-2 align-items-center flex-wrap'>
          <div className='btn-group' role='group' aria-label='Undo and redo'>
            <Button size='sm' variant='outline-secondary' onClick={undo} disabled={!history.past.length} title={`Undo (${MOD}+Z)`} aria-label='Undo'>
              <Undo2 size={16} aria-hidden='true' />
            </Button>
            <Button size='sm' variant='outline-secondary' onClick={redo} disabled={!history.future.length} title={`Redo (${MOD}+Shift+Z)`} aria-label='Redo'>
              <Redo2 size={16} aria-hidden='true' />
            </Button>
          </div>
          <Button size='sm' variant='outline-secondary' onClick={() => setShowTemplates(true)}>
            <Palette size={15} aria-hidden='true' />
            <span>
              Template: <strong>{templateFor(resume.templateId).label}</strong>
            </span>
          </Button>
          <Button size='sm' variant='primary' onClick={() => download('pdf')} disabled={!!exporting} aria-label='Download PDF' title='Download PDF'>
            {exporting === 'pdf' ? <Spinner size='sm' /> : <><FileDown size={15} aria-hidden='true' /> PDF</>}
          </Button>
          <Button size='sm' variant='outline-primary' onClick={() => download('docx')} disabled={!!exporting} aria-label='Download DOCX' title='Download DOCX'>
            {exporting === 'docx' ? <Spinner size='sm' /> : <><FileText size={15} aria-hidden='true' /> DOCX</>}
          </Button>
          <Button
            size='sm'
            variant='outline-primary'
            onClick={() => navigate(`/letters/${LetterStore.create(resume).id}`)}
          >
            <Mail size={15} aria-hidden='true' /> Cover letter
          </Button>
        </div>
      </div>

      {err && <Alert variant='danger' dismissible onClose={() => setErr('')}>{err}</Alert>}
      {pageNote && (
        <Alert variant='warning' dismissible onClose={() => setPageNote(null)}>
          Your PDF is <strong>{pageNote} pages</strong>. Most recruiters prefer one page for under ~8 years of
          experience.{' '}
          {resume.templateId === 'ats_compact' ? (
            'Try trimming older or less relevant bullets.'
          ) : (
            <>
              Try the{' '}
              <Button
                variant='link'
                className='p-0 align-baseline'
                onClick={() => {
                  update({templateId: 'ats_compact'})
                  setPageNote(null)
                }}
              >
                Compact template
              </Button>{' '}
              or trim older bullets.
            </>
          )}
        </Alert>
      )}
      <TemplatePicker
        show={showTemplates}
        onHide={() => setShowTemplates(false)}
        resume={resume}
        value={resume.templateId}
        onChange={(templateId) => {
          update({templateId})
          track('Template changed', {template: templateId})
          setPageNote(null)
        }}
      />
      {importInfo && (
        <Alert variant='info' dismissible onClose={() => setImportInfo(null)}>
          <strong>Imported!</strong> We filled in the builder from your file. Automatic import isn't perfect, so
          please review each section, especially job titles, companies and dates.
          {importInfo.warnings?.map((w) => <div key={w} className='mt-1 d-flex gap-1 align-items-start'><TriangleAlert size={15} className='mt-1 flex-shrink-0' aria-hidden='true' /> {w}</div>)}
        </Alert>
      )}

      <MobileViewSwitch value={mobileView} onChange={setMobileView} previewLabel='Preview & ATS check' />
      <Row className='g-4'>
        <Col lg={6} className={mobileView === 'preview' ? 'mobile-hide' : ''}>
          <Accordion defaultActiveKey={['basics']} alwaysOpen>
            <Accordion.Item eventKey='basics'>
              <Accordion.Header>Contact details</Accordion.Header>
              <Accordion.Body className='d-grid gap-2'>
                <Field label='Full name' value={resume.basics.fullName} onChange={(e) => setBasics({fullName: e.target.value})} />
                <Row className='g-2'>
                  <Col sm={6}><Field label='Email' type='email' value={resume.basics.email} onChange={(e) => setBasics({email: e.target.value})} /></Col>
                  <Col sm={6}><Field label='Phone' value={resume.basics.phone} onChange={(e) => setBasics({phone: e.target.value})} /></Col>
                </Row>
                <Field label='Location' placeholder='City, Country' value={resume.basics.location} onChange={(e) => setBasics({location: e.target.value})} />
                <Field
                  label='Links (one per line — LinkedIn, GitHub, portfolio)'
                  as='textarea'
                  rows={2}
                  value={(resume.basics.links || []).join('\n')}
                  onChange={(e) => setBasics({links: linesToArray(e.target.value)})}
                />
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey='summary'>
              <Accordion.Header>Summary</Accordion.Header>
              <Accordion.Body>
                <div className='d-flex justify-content-end mb-n1'>
                  <SummaryTemplatePicker value={resume.summary} onChange={(summary) => update({summary})} />
                </div>
                <Field
                  label='2–4 sentences on who you are and the value you bring'
                  as='textarea'
                  rows={5}
                  value={resume.summary}
                  onChange={(e) => update({summary: e.target.value})}
                />
                {/\[[^\]]+\]/.test(resume.summary) && (
                  <Form.Text className='text-warning-emphasis'>
                    Replace every [bracketed] part with your own details before exporting.
                  </Form.Text>
                )}
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey='skills'>
              <Accordion.Header>Skills</Accordion.Header>
              <Accordion.Body>
                <Field
                  label='Comma separated'
                  placeholder='React, Node.js, MongoDB, ...'
                  value={skillsText}
                  onChange={(e) => {
                    setSkillsText(e.target.value)
                    update({skills: clean(e.target.value.split(','))})
                  }}
                />
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey='experience'>
              <Accordion.Header>Experience ({resume.experience.length})</Accordion.Header>
              <Accordion.Body>
                <ListEditor
                  items={resume.experience}
                  onChange={(experience) => update({experience})}
                  makeEmpty={emptyExperience}
                  addLabel='Add experience'
                  itemTitle={(e) => [e.role, e.company].filter(Boolean).join(' @ ')}
                  renderItem={(e, set, i) => (
                    <>
                      <Row className='g-2'>
                        <Col sm={6}><Field label='Job title' value={e.role} onChange={(ev) => set({role: ev.target.value})} /></Col>
                        <Col sm={6}><Field label='Company' value={e.company} onChange={(ev) => set({company: ev.target.value})} /></Col>
                      </Row>
                      <Row className='g-2'>
                        <Col sm={4}><Field label='Location' value={e.location} onChange={(ev) => set({location: ev.target.value})} /></Col>
                        <Col sm={4}><Field label='Start' placeholder='Jan 2022' value={e.startDate} onChange={(ev) => set({startDate: ev.target.value})} /></Col>
                        <Col sm={4}>
                          <Field label='End' placeholder='Dec 2023' value={e.endDate} disabled={e.isCurrent} onChange={(ev) => set({endDate: ev.target.value})} />
                        </Col>
                      </Row>
                      <Form.Check
                        type='checkbox'
                        id={`current-${i}`}
                        label='I currently work here'
                        className='small'
                        checked={e.isCurrent}
                        onChange={(ev) => set({isCurrent: ev.target.checked})}
                      />
                      <BulletsField
                        label='Achievements (one per line — start with an action verb, add numbers)'
                        bullets={e.bullets}
                        onChange={(bullets) => set({bullets})}
                      />
                    </>
                  )}
                />
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey='projects'>
              <Accordion.Header>Projects ({resume.projects.length})</Accordion.Header>
              <Accordion.Body>
                <ListEditor
                  items={resume.projects}
                  onChange={(projects) => update({projects})}
                  makeEmpty={emptyProject}
                  addLabel='Add project'
                  itemTitle={(p) => p.name}
                  renderItem={(p, set) => (
                    <>
                      <Row className='g-2'>
                        <Col sm={6}><Field label='Project name' value={p.name} onChange={(ev) => set({name: ev.target.value})} /></Col>
                        <Col sm={6}><Field label='Link' value={p.link} onChange={(ev) => set({link: ev.target.value})} /></Col>
                      </Row>
                      <Field label='One-line description' value={p.description} onChange={(ev) => set({description: ev.target.value})} />
                      <BulletsField
                        label='Highlights (one per line)'
                        rows={3}
                        bullets={p.bullets}
                        onChange={(bullets) => set({bullets})}
                      />
                    </>
                  )}
                />
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey='education'>
              <Accordion.Header>Education ({resume.education.length})</Accordion.Header>
              <Accordion.Body>
                <ListEditor
                  items={resume.education}
                  onChange={(education) => update({education})}
                  makeEmpty={emptyEducation}
                  addLabel='Add education'
                  itemTitle={(e) => e.school}
                  renderItem={(e, set) => (
                    <>
                      <Field label='School / University' value={e.school} onChange={(ev) => set({school: ev.target.value})} />
                      <Row className='g-2'>
                        <Col sm={6}><Field label='Degree' placeholder='B.Sc.' value={e.degree} onChange={(ev) => set({degree: ev.target.value})} /></Col>
                        <Col sm={6}><Field label='Field of study' value={e.field} onChange={(ev) => set({field: ev.target.value})} /></Col>
                      </Row>
                      <Row className='g-2'>
                        <Col sm={6}><Field label='Start year' value={e.startYear} onChange={(ev) => set({startYear: ev.target.value})} /></Col>
                        <Col sm={6}><Field label='End year' value={e.endYear} onChange={(ev) => set({endYear: ev.target.value})} /></Col>
                      </Row>
                    </>
                  )}
                />
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey='certs'>
              <Accordion.Header>Certifications</Accordion.Header>
              <Accordion.Body>
                <Field
                  label='One per line'
                  as='textarea'
                  rows={3}
                  value={resume.certifications.join('\n')}
                  onChange={(e) => update({certifications: linesToArray(e.target.value)})}
                />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>

        <Col lg={6} className={mobileView === 'edit' ? 'mobile-hide' : ''}>
          <div style={{position: 'sticky', top: 16}}>
            <Tabs defaultActiveKey='preview' className='mb-3'>
              <Tab eventKey='preview' title='Preview'>
                <div className='d-flex justify-content-between align-items-center mb-2 small'>
                  {pageEstimate > 1 ? (
                    <span className='text-warning-emphasis'>
                      <TriangleAlert size={14} className='me-1' aria-hidden='true' /> About {pageEstimate} pages. See the red line for where page 2 starts.
                    </span>
                  ) : (
                    <span className='text-success'>
                      <CircleCheck size={14} className='me-1' aria-hidden='true' /> Fits on one page
                    </span>
                  )}
                  <span className='text-secondary'>Preview is approximate</span>
                </div>
                <div className='bg-body-tertiary border rounded-2 p-2' style={{maxHeight: '80vh', overflowY: 'auto'}}>
                  <ScaledPage naturalWidth={(PAGE.width * 4) / 3} className='shadow-sm'>
                    <ResumePreview resume={resume} showPageBreaks onPageCount={setPageEstimate} />
                  </ScaledPage>
                </div>
              </Tab>
              <Tab eventKey='ats' title='ATS Check'>
                <Card className='border-0 shadow-sm'>
                  <Card.Body style={{maxHeight: '80vh', overflowY: 'auto'}}>
                    <div className='mb-2'>
                      <RolePicker
                        roles={roles}
                        value={targetRole}
                        onChange={(id) => update({targetRole: id}, {record: false})}
                        help={
                          resume.targetRole === undefined && targetRole
                            ? 'Guessed from your latest job title. Change it if needed.'
                            : 'Used for keyword matching when no job description is pasted.'
                        }
                      />
                    </div>
                    <Field
                      label='Job description (optional — paste it to check keyword match)'
                      data-native-undo
                      as='textarea'
                      rows={5}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                    <Button className='mt-2 mb-3' variant='primary' onClick={runScore} disabled={scoring}>
                      {scoring ? <Spinner size='sm' /> : result ? 'Re-check score' : 'Check ATS score'}
                    </Button>
                    <ScoreHistory
                      history={resume.scoreHistory}
                      onClear={() => update({scoreHistory: []}, {record: false})}
                    />
                    <ScoreReport result={result} />
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>
          </div>
        </Col>
      </Row>
    </Container>
  )
}
