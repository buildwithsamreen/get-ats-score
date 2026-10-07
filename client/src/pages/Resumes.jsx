import {useEffect, useRef, useState} from 'react'
import {Link, useNavigate, useSearchParams} from 'react-router-dom'
import {Container, Button, Card, Row, Col, Form, Alert, Dropdown, Spinner} from 'react-bootstrap'
import {ArrowRight, Copy, FilePlus, FileText, Mail, MoreHorizontal, Trash2} from 'lucide-react'
import {ResumeStore} from '../storage/resumes'
import {LetterStore} from '../storage/letters'
import {AtsAPI} from '../api/ats'
import {errorMessage} from '../api/http'
import usePageMeta from '../hooks/usePageMeta'
import {PAGES} from '../content/seo'
import FileDropZone from '../components/FileDropZone'
import {Delta} from '../components/ScoreHistory'
import {comparableHistory} from '../content/scoreHistory'
import {track} from '../analytics'

function LatestScore({history}) {
  const points = comparableHistory(history)
  const latest = points[points.length - 1]
  if (!latest) return null
  const prev = points[points.length - 2]
  const tone = latest.score >= 80 ? 'success' : latest.score >= 65 ? 'warning' : 'danger'
  return (
    <div className='small mb-1 d-flex align-items-center gap-2'>
      <span className={`badge bg-${tone}-subtle text-${tone}-emphasis`}>ATS {latest.score}/100</span>
      {prev && <Delta value={latest.score - prev.score} suffix=' vs last check' />}
    </div>
  )
}

export default function Resumes() {
  usePageMeta(PAGES['/resumes'])
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [resumes, setResumes] = useState(() => ResumeStore.list())
  const [title, setTitle] = useState('')
  const [msg, setMsg] = useState(null)
  const importRef = useRef(null)
  const titleRef = useRef(null)
  const [importing, setImporting] = useState(false)

  const refresh = () => setResumes(ResumeStore.list())

  useEffect(() => {
    if (params.get('new')) {
      titleRef.current?.focus()
      setParams({}, {replace: true})
    }
  }, [params, setParams])

  const create = (e) => {
    e.preventDefault()
    const r = ResumeStore.create(title)
    track('Resume created')
    navigate(`/builder/${r.id}`)
  }

  const importFile = async (file) => {
    setMsg(null)
    setImporting(true)
    try {
      const {resume, warnings} = await AtsAPI.parseFile(file)
      const name = title.trim() || file.name.replace(/\.[^.]+$/, '')
      const r = ResumeStore.createFrom(resume, name)
      track('Resume imported', {from: 'my-resumes'})
      navigate(`/builder/${r.id}`, {state: {imported: true, warnings}})
    } catch (err) {
      setMsg({variant: 'danger', text: errorMessage(err, 'Could not import this file.')})
    } finally {
      setImporting(false)
    }
  }

  const remove = (r) => {
    if (!window.confirm(`Delete "${r.title}"? This cannot be undone.`)) return
    ResumeStore.remove(r.id)
    refresh()
  }

  const duplicate = (r) => {
    ResumeStore.duplicate(r.id)
    refresh()
  }

  const backup = () => {
    const blob = new Blob([ResumeStore.exportBackup()], {type: 'application/json'})
    AtsAPI.saveBlob(blob, `resumes-backup-${new Date().toISOString().slice(0, 10)}.json`)
    track('Backup downloaded')
  }

  const restore = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const added = ResumeStore.importBackup(await file.text())
      track('Backup restored')
      setMsg({variant: 'success', text: `Backup restored (${added} new item${added === 1 ? '' : 's'}).`})
      refresh()
    } catch (err) {
      setMsg({variant: 'danger', text: err.message || 'Could not read the backup file.'})
    }
  }

  return (
    <Container className='py-5'>
      <div className='d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4'>
        <div>
          <h1 className='fw-bold h2 mb-1'>My Resumes</h1>
          <p className='text-secondary mb-0 small'>
            Saved privately in this browser. The backup includes your resumes and cover letters.
          </p>
        </div>
        <div className='d-flex gap-2'>
          <Button variant='outline-secondary' size='sm' onClick={backup} disabled={!resumes.length}>
            Download backup
          </Button>
          <Button variant='outline-secondary' size='sm' onClick={() => importRef.current?.click()}>
            Restore backup
          </Button>
          <input ref={importRef} type='file' accept='.json,application/json' hidden onChange={restore} />
        </div>
      </div>

      {msg && (
        <Alert variant={msg.variant} dismissible onClose={() => setMsg(null)}>
          {msg.text}
        </Alert>
      )}

      <Card className='rounded-4 mb-4'>
        <Card.Body className='p-4'>
          <Row className='g-4 align-items-stretch'>
            <Col md={6}>
              <h6 className='fw-bold'>Start from scratch</h6>
              <Form onSubmit={create} className='d-flex gap-2 flex-wrap'>
                <Form.Control
                  ref={titleRef}
                  placeholder='Resume title, e.g. "Frontend Developer – Acme"'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{maxWidth: 360}}
                />
                <Button type='submit' variant='primary'>
                  + New resume
                </Button>
              </Form>
              <Form.Text className='text-secondary'>
                The title is just for you. It won't appear on the resume.
              </Form.Text>
            </Col>
            <Col md={6}>
              <h6 className='fw-bold'>Import your existing resume</h6>
              <FileDropZone
                compact
                onFile={importFile}
                onError={(text) => setMsg({variant: 'danger', text})}
                disabled={importing}
                buttonVariant='outline-primary'
                buttonLabel={importing ? 'Importing…' : 'Choose a file'}
              >
                {importing ? (
                  <div className='small mb-2'>
                    <Spinner size='sm' className='me-2' />
                    Reading your resume…
                  </div>
                ) : (
                  <div className='small mb-2'>
                    Drop a PDF or DOCX here and we'll fill in the builder for you
                  </div>
                )}
              </FileDropZone>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {resumes.length === 0 ? (
        <div className='surface-card text-center p-5'>
          <span className='icon-tile mb-3'>
            <FilePlus size={20} aria-hidden='true' />
          </span>
          <h2 className='h6 fw-bold'>No resumes yet</h2>
          <p className='text-secondary small mb-0'>Start from scratch or import an existing resume above.</p>
        </div>
      ) : (
        <Row className='g-3'>
          {resumes.map((r) => (
            <Col md={6} lg={4} key={r.id}>
              <Card className='h-100 rounded-4 card-hover'>
                <Card.Body className='p-4 d-flex flex-column'>
                  <div className='d-flex justify-content-between align-items-start gap-2 mb-2'>
                    <div className='d-flex gap-3 align-items-start min-w-0'>
                      <span className='icon-tile'>
                        <FileText size={20} aria-hidden='true' />
                      </span>
                      <h2 className='h6 fw-bold mb-0 mt-1 text-break'>{r.title}</h2>
                    </div>
                    <Dropdown align='end'>
                      <Dropdown.Toggle variant='outline-secondary' size='sm' className='border-0 no-caret' aria-label='More actions'>
                        <MoreHorizontal size={18} aria-hidden='true' />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => navigate(`/letters/${LetterStore.create(r).id}`)}>
                          <Mail size={15} className='me-2' aria-hidden='true' />
                          Write cover letter
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => duplicate(r)}>
                          <Copy size={15} className='me-2' aria-hidden='true' />
                          Duplicate
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item className='text-danger' onClick={() => remove(r)}>
                          <Trash2 size={15} className='me-2' aria-hidden='true' />
                          Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                  <LatestScore history={r.scoreHistory} />
                  <p className='text-secondary small mb-3'>
                    {r.basics?.fullName || 'No name yet'} · Updated{' '}
                    {new Date(r.updatedAt).toLocaleString()}
                  </p>
                  <Button as={Link} to={`/builder/${r.id}`} variant='outline-primary' className='mt-auto'>
                    Open <ArrowRight size={15} aria-hidden='true' />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  )
}
