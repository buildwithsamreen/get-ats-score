import {useState} from 'react'
import {Link, useParams} from 'react-router-dom'
import {Container, Row, Col, Form, Button, Card, Alert, Spinner} from 'react-bootstrap'
import {FileDown, FileText, WandSparkles} from 'lucide-react'
import {LetterStore, senderFromResume} from '../storage/letters'
import {ResumeStore} from '../storage/resumes'
import {AtsAPI} from '../api/ats'
import {errorMessage} from '../api/http'
import usePageMeta from '../hooks/usePageMeta'
import Field from '../components/Field'
import MobileViewSwitch from '../components/MobileViewSwitch'
import {TEMPLATES, templateFor} from '../content/templates'
import {generateLetterDraft} from '../content/letterDraft'
import {track} from '../analytics'

const clean = (arr) => (arr || []).map((s) => (s || '').trim()).filter(Boolean)
const wordCount = (paragraphs) => clean(paragraphs).join(' ').split(/\s+/).filter(Boolean).length

function LetterPreview({letter}) {
  const s = letter.sender
  const r = letter.recipient
  const contact = [s.email, s.phone, s.location, ...clean(s.links)].filter(Boolean).join(' | ')
  const recipient = clean([r.name, r.company, ...(r.address || '').split('\n')])

  return (
    <div
      className='paper border shadow-sm p-4'
      style={{fontFamily: templateFor(letter.templateId).font, fontSize: 13.5, minHeight: 500}}
    >
      <h4 className='fw-bold mb-0' style={{color: templateFor(letter.templateId).accent}}>
        {s.fullName || 'Your Name'}
      </h4>
      {contact && <div className='text-secondary' style={{fontSize: 12}}>{contact}</div>}
      <div className='mt-4'>
        {letter.date && <p>{letter.date}</p>}
        {recipient.length > 0 && (
          <p>
            {recipient.map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </p>
        )}
        <p>{r.name?.trim() ? `Dear ${r.name.trim()},` : 'Dear Hiring Manager,'}</p>
        {clean(letter.paragraphs).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <p className='mb-4'>{letter.signOff || 'Sincerely,'}</p>
        <p className='fw-bold'>{s.fullName || 'Your Name'}</p>
      </div>
    </div>
  )
}

function lengthHint(words) {
  if (words === 0) return {variant: 'secondary', text: 'Aim for 250–400 words.'}
  if (words < 150) return {variant: 'warning', text: `${words} words. A bit short, aim for 250–400.`}
  if (words <= 450) return {variant: 'success', text: `${words} words. A good length.`}
  return {variant: 'warning', text: `${words} words. Long, try to keep it under one page (~400).`}
}

export default function LetterEditor() {
  const {id} = useParams()
  const [letter, setLetter] = useState(() => LetterStore.get(id))
  const [savedAt, setSavedAt] = useState(null)
  const [mobileView, setMobileView] = useState('edit')
  usePageMeta({title: letter?.title || 'Cover letter', noindex: true})
  const [exporting, setExporting] = useState('')
  const [err, setErr] = useState('')
  const resumes = ResumeStore.list()

  if (!letter) {
    return (
      <Container className='py-5'>
        <Alert variant='warning'>
          This cover letter wasn't found in this browser. <Link to='/letters'>Back to Cover Letters</Link>
        </Alert>
      </Container>
    )
  }

  const linkedResume = letter.resumeId ? ResumeStore.get(letter.resumeId) : null

  const update = (patch) => {
    const saved = LetterStore.save({...letter, ...patch})
    setLetter(saved)
    setSavedAt(new Date(saved.updatedAt))
  }
  const setRecipient = (patch) => update({recipient: {...letter.recipient, ...patch}})
  const setSender = (patch) => update({sender: {...letter.sender, ...patch}})
  const setParagraph = (i, value) => update({paragraphs: letter.paragraphs.map((p, j) => (j === i ? value : p))})

  const linkResume = (resumeId) => {
    const resume = ResumeStore.get(resumeId)
    update({resumeId, ...(resume ? {sender: senderFromResume(resume), templateId: resume.templateId} : {})})
  }

  const generate = () => {
    if (clean(letter.paragraphs).length && !window.confirm('Replace your current letter text with a new draft?')) return
    track('Cover letter drafted', {linked: linkedResume ? 'yes' : 'no'})
    update({
      paragraphs: generateLetterDraft({
        resume: linkedResume,
        jobTitle: letter.jobTitle,
        company: letter.recipient.company,
        jobDescription: letter.jobDescription,
      }),
    })
  }

  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= letter.paragraphs.length) return
    const next = [...letter.paragraphs]
    ;[next[i], next[j]] = [next[j], next[i]]
    update({paragraphs: next})
  }

  const download = async (format) => {
    setErr('')
    setExporting(format)
    try {
      await AtsAPI.exportLetter(letter, format)
      track('Exported', {doc: 'letter', format})
    } catch (e) {
      setErr(errorMessage(e, 'Export failed'))
    } finally {
      setExporting('')
    }
  }

  const hint = lengthHint(wordCount(letter.paragraphs))
  const missingJob = !letter.jobTitle.trim() || !letter.recipient.company.trim()

  return (
    <Container fluid='xl' className='py-4'>
      <div className='d-flex flex-wrap align-items-center gap-2 mb-3'>
        <Link to='/letters' className='text-decoration-none small'>← Cover Letters</Link>
        <Form.Control
          className='fw-bold fs-5 border-0 bg-transparent'
          style={{maxWidth: 380}}
          value={letter.title}
          onChange={(e) => update({title: e.target.value})}
          aria-label='Cover letter title'
        />
        <small className='text-secondary'>
          {savedAt ? `Saved ${savedAt.toLocaleTimeString()}` : 'All changes save automatically'}
        </small>
        <div className='ms-auto d-flex gap-2 align-items-center flex-wrap'>
          <Form.Select
            size='sm'
            value={letter.templateId}
            onChange={(e) => update({templateId: e.target.value})}
            aria-label='Template'
            style={{width: 190}}
          >
            {Object.entries(TEMPLATES).map(([k, t]) => (
              <option key={k} value={k}>{t.label}</option>
            ))}
          </Form.Select>
          <Button size='sm' variant='primary' onClick={() => download('pdf')} disabled={!!exporting} aria-label='Download PDF' title='Download PDF'>
            {exporting === 'pdf' ? <Spinner size='sm' /> : <><FileDown size={15} aria-hidden='true' /> PDF</>}
          </Button>
          <Button size='sm' variant='outline-primary' onClick={() => download('docx')} disabled={!!exporting} aria-label='Download DOCX' title='Download DOCX'>
            {exporting === 'docx' ? <Spinner size='sm' /> : <><FileText size={15} aria-hidden='true' /> DOCX</>}
          </Button>
        </div>
      </div>

      {err && <Alert variant='danger' dismissible onClose={() => setErr('')}>{err}</Alert>}

      <MobileViewSwitch value={mobileView} onChange={setMobileView} />
      <Row className='g-4'>
        <Col lg={6} className={`d-grid gap-3 align-content-start ${mobileView === 'preview' ? 'mobile-hide' : ''}`}>
          <Card className='border-0 shadow-sm'>
            <Card.Body className='d-grid gap-2'>
              <h6 className='fw-bold mb-0'>The job</h6>
              <Row className='g-2'>
                <Col sm={6}>
                  <Field label='Job title' value={letter.jobTitle} onChange={(e) => update({jobTitle: e.target.value})} />
                </Col>
                <Col sm={6}>
                  <Field label='Company' value={letter.recipient.company} onChange={(e) => setRecipient({company: e.target.value})} />
                </Col>
              </Row>
              <Row className='g-2'>
                <Col sm={6}>
                  <Field
                    label='Hiring manager (optional)'
                    placeholder='e.g. Ms. Alex Chen'
                    value={letter.recipient.name}
                    onChange={(e) => setRecipient({name: e.target.value})}
                  />
                </Col>
                <Col sm={6}>
                  <Field label='Date' value={letter.date} onChange={(e) => update({date: e.target.value})} />
                </Col>
              </Row>
              <Field
                label='Company address (optional)'
                as='textarea'
                rows={2}
                value={letter.recipient.address}
                onChange={(e) => setRecipient({address: e.target.value})}
              />
              <Field
                label='Job description (optional, used to pick which skills to highlight)'
                as='textarea'
                rows={3}
                value={letter.jobDescription}
                onChange={(e) => update({jobDescription: e.target.value})}
              />
            </Card.Body>
          </Card>

          <Card className='border-0 shadow-sm'>
            <Card.Body className='d-grid gap-2'>
              <div className='d-flex justify-content-between align-items-center'>
                <h6 className='fw-bold mb-0'>Your details</h6>
                {linkedResume && (
                  <Button size='sm' variant='link' className='p-0 small' onClick={() => linkResume(linkedResume.id)}>
                    Refresh from resume
                  </Button>
                )}
              </div>
              <Form.Select
                size='sm'
                value={letter.resumeId}
                onChange={(e) => linkResume(e.target.value)}
                aria-label='Linked resume'
              >
                <option value=''>Not linked to a resume</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>Linked to: {r.title}</option>
                ))}
              </Form.Select>
              <Row className='g-2'>
                <Col sm={6}><Field label='Full name' value={letter.sender.fullName} onChange={(e) => setSender({fullName: e.target.value})} /></Col>
                <Col sm={6}><Field label='Email' value={letter.sender.email} onChange={(e) => setSender({email: e.target.value})} /></Col>
                <Col sm={6}><Field label='Phone' value={letter.sender.phone} onChange={(e) => setSender({phone: e.target.value})} /></Col>
                <Col sm={6}><Field label='Location' value={letter.sender.location} onChange={(e) => setSender({location: e.target.value})} /></Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className='border-0 shadow-sm'>
            <Card.Body className='d-grid gap-2'>
              <div className='d-flex justify-content-between align-items-center flex-wrap gap-2'>
                <h6 className='fw-bold mb-0'>Letter</h6>
                <Button size='sm' variant='primary' onClick={generate}>
                  <WandSparkles size={16} aria-hidden='true' /> Generate draft
                </Button>
              </div>
              {missingJob && (
                <Form.Text className='text-secondary mt-0'>
                  Fill in the job title and company first for a better draft
                  {!linkedResume && ', and link a resume to include your experience'}.
                </Form.Text>
              )}

              {letter.paragraphs.map((p, i) => (
                <div key={i}>
                  <div className='d-flex justify-content-between align-items-center'>
                    <span className='small text-secondary'>Paragraph {i + 1}</span>
                    <span className='d-flex gap-1'>
                      <Button size='sm' variant='outline-secondary' onClick={() => move(i, -1)} disabled={i === 0} aria-label='Move up'>↑</Button>
                      <Button size='sm' variant='outline-secondary' onClick={() => move(i, 1)} disabled={i === letter.paragraphs.length - 1} aria-label='Move down'>↓</Button>
                      <Button
                        size='sm'
                        variant='outline-danger'
                        onClick={() => update({paragraphs: letter.paragraphs.filter((_, j) => j !== i)})}
                      >
                        Remove
                      </Button>
                    </span>
                  </div>
                  <Form.Control
                    as='textarea'
                    size='sm'
                    rows={4}
                    value={p}
                    onChange={(e) => setParagraph(i, e.target.value)}
                    aria-label={`Paragraph ${i + 1}`}
                    className='mt-1'
                  />
                </div>
              ))}

              <div className='d-flex justify-content-between align-items-center flex-wrap gap-2'>
                <Button size='sm' variant='outline-primary' onClick={() => update({paragraphs: [...letter.paragraphs, '']})}>
                  + Add paragraph
                </Button>
                <small className={`text-${hint.variant === 'success' ? 'success' : hint.variant === 'warning' ? 'warning-emphasis' : 'secondary'}`}>
                  {hint.text}
                </small>
              </div>
              <Field label='Sign-off' value={letter.signOff} onChange={(e) => update({signOff: e.target.value})} />
              <Form.Text className='text-secondary mt-0'>
                Tips: name the role and company in the first line, back up claims with one or two numbers, and end
                with a clear next step. Personalise the draft, since generic letters are easy to spot.
              </Form.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className={mobileView === 'edit' ? 'mobile-hide' : ''}>
          <div style={{position: 'sticky', top: 16, maxHeight: '90vh', overflowY: 'auto'}}>
            <LetterPreview letter={letter} />
          </div>
        </Col>
      </Row>
    </Container>
  )
}
