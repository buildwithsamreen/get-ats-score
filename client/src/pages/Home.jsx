import {useRef, useState} from 'react'
import {Link, useNavigate, useSearchParams} from 'react-router-dom'
import {Container, Button, Row, Col, Modal, ProgressBar, Form, Alert, Spinner} from 'react-bootstrap'
import {ArrowRight, BookOpen, Clock, Download, FileCheck, FileUp, Gauge, LayoutTemplate, Lock, Mail, Plus, Search, ShieldCheck, Sparkles, Target, Upload, Wand2, Zap} from 'lucide-react'
import {AtsAPI} from '../api/ats'
import {errorMessage} from '../api/http'
import ScoreReport from '../components/ScoreReport'
import FileDropZone from '../components/FileDropZone'
import HeroIllustration from '../components/HeroIllustration'
import {Showcases, Faq} from '../components/LandingSections'
import {ACCEPTED_EXTENSIONS, uploadErrorCode, validateUpload} from '../content/uploads'
import {ResumeStore} from '../storage/resumes'
import usePageMeta from '../hooks/usePageMeta'
import {PAGES} from '../content/seo'
import {GUIDES} from '../content/guides'
import RolePicker from '../components/RolePicker'
import {useRoles} from '../content/roles'
import {track, scoreBucket} from '../analytics'

export default function Home() {
  usePageMeta(PAGES['/'])
  const fileRef = useRef(null)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')
  const [fileName, setFileName] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [showJd, setShowJd] = useState(false)
  // ?role=<id> pre-selects a target role (used by the keyword pages)
  const [searchParams] = useSearchParams()
  const [role, setRole] = useState(() => searchParams.get('role') || '')
  const roles = useRoles()
  const [lastFile, setLastFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const navigate = useNavigate()

  const importIntoBuilder = async () => {
    setErr('')
    setImporting(true)
    try {
      const {resume, warnings} = await AtsAPI.parseFile(lastFile)
      const r = ResumeStore.createFrom(resume, lastFile.name.replace(/\.[^.]+$/, ''))
      if (role) ResumeStore.save({...r, targetRole: role}) // keep the role they scored against
      track('Resume imported', {from: 'score-results'})
      navigate(`/builder/${r.id}`, {state: {imported: true, warnings}})
    } catch (e) {
      setErr(errorMessage(e, 'Could not import this file'))
    } finally {
      setImporting(false)
    }
  }

  const openPicker = () => fileRef.current?.click()

  const showError = (message) => {
    track('Upload rejected', {reason: uploadErrorCode(message)})
    setResult(null)
    setErr(message)
    setShow(true)
  }

  const scoreFile = async (file) => {
    setFileName(file.name)
    setLastFile(file)
    setShow(true)
    setLoading(true)
    setUploadPct(0)
    setResult(null)
    setErr('')

    try {
      const res = await AtsAPI.scoreFile(file, {jobDescription, role}, setUploadPct)
      setResult(res)
      track('Resume scored', {source: 'upload', keywords: res.keywords?.mode || 'none', score: scoreBucket(res.score)})
    } catch (e) {
      setErr(errorMessage(e, 'Could not score this resume'))
    } finally {
      setLoading(false)
    }
  }

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const problem = validateUpload(file)
    if (problem) showError(problem)
    else scoreFile(file)
  }

  const features = [
    {icon: Gauge, title: 'Instant ATS score', desc: 'A score out of 100 with a breakdown of contact info, sections, keywords, impact and readability.', cta: ['Upload a resume', openPicker]},
    {icon: Target, title: 'Keyword match', desc: 'Paste a job description or pick a target role to see exactly which keywords you are missing.', cta: ['Add a job description', () => setShowJd(true)]},
    {icon: LayoutTemplate, title: 'ATS-friendly builder', desc: 'Five clean templates, live bullet feedback and a page-break preview. Export to PDF or DOCX.', to: ['Open the builder', '/resumes?new=1']},
    {icon: FileUp, title: 'Import what you have', desc: 'Drop in your existing PDF or DOCX and we fill in the builder for you, no retyping.', to: ['Import a resume', '/resumes']},
    {icon: Mail, title: 'Cover letters', desc: 'Generate a tailored first draft from your resume, then polish it and download.', to: ['Write a cover letter', '/letters']},
    {icon: Lock, title: 'Private by design', desc: 'No account, no database. Your resumes stay in your browser, and uploads are never stored.', to: ['Read our privacy policy', '/privacy']},
  ]

  const steps = [
    {icon: Upload, title: 'Upload your resume', desc: 'PDF, DOCX or TXT. Optionally add the job description or a target role.'},
    {icon: Search, title: 'See what the ATS sees', desc: 'Get your score, missing keywords and specific, prioritised fixes.'},
    {icon: Download, title: 'Fix it and export', desc: 'Open it in the builder, apply the fixes and download an ATS-friendly PDF.'},
  ]

  return (
    <>
      <div className='position-relative overflow-hidden hero-bg'>
        <div
          aria-hidden='true'
          className='position-absolute'
          style={{top: -260, left: -220, width: 720, height: 720, borderRadius: 9999, background: 'radial-gradient(circle, var(--app-glow-indigo), transparent 62%)'}}
        />
        <div
          aria-hidden='true'
          className='position-absolute'
          style={{top: 120, right: -260, width: 680, height: 680, borderRadius: 9999, background: 'radial-gradient(circle, var(--app-glow-green), transparent 62%)'}}
        />

        <Container className='pt-5 pb-4 position-relative'>
          <Row className='align-items-center g-4 g-lg-5'>
            <Col lg={6}>
              <span className='eyebrow'>
                <Sparkles size={14} aria-hidden='true' /> Free · No sign-up · Private
              </span>
              <h1 className='display-4 fw-bold mt-3 mb-3' style={{lineHeight: 1.05}}>
                Get past the ATS.
                <br />
                <span className='text-gradient'>Land the interview.</span>
              </h1>
              <p className='lead text-secondary mb-4' style={{maxWidth: 540}}>
                See exactly how applicant tracking systems read your resume, which keywords you're missing, and what
                to fix, in seconds.
              </p>

              <div className='surface-card p-3 p-md-4' style={{maxWidth: 580}}>
                <Row className='g-2 align-items-end mb-3'>
                  <Col sm={7}>
                    <RolePicker
                      roles={roles}
                      value={role}
                      onChange={setRole}
                      label='Target role (optional)'
                    />
                  </Col>
                  <Col sm={5} className='text-sm-end'>
                    {!showJd && (
                      <Button variant='link' size='sm' className='px-0' onClick={() => setShowJd(true)}>
                        <Plus size={15} aria-hidden='true' /> Add job description
                      </Button>
                    )}
                  </Col>
                </Row>
                {showJd && (
                  <Form.Group className='mb-3' controlId='home-jd'>
                    <Form.Label className='small text-secondary mb-1'>
                      Job description <span className='fw-normal'>(takes priority over the role)</span>
                    </Form.Label>
                    <Form.Control
                      as='textarea'
                      rows={4}
                      placeholder='Paste the job posting here to check keyword match…'
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </Form.Group>
                )}
                <FileDropZone onFile={scoreFile} onError={showError} disabled={loading} buttonLabel='Get my ATS score' />
                <input ref={fileRef} type='file' accept={ACCEPTED_EXTENSIONS.join(',')} hidden onChange={onFileChange} />
              </div>

              <div className='mt-3 d-flex gap-4 align-items-center text-secondary small flex-wrap'>
                <span className='d-inline-flex align-items-center gap-1'>
                  <ShieldCheck size={16} className='text-success' aria-hidden='true' /> Files never stored
                </span>
                <span className='d-inline-flex align-items-center gap-1'>
                  <Zap size={16} className='text-success' aria-hidden='true' /> Results in seconds
                </span>
                <span className='d-inline-flex align-items-center gap-1'>
                  <FileCheck size={16} className='text-success' aria-hidden='true' /> PDF, DOCX & TXT
                </span>
              </div>
            </Col>

            <Col lg={6} className='d-none d-lg-block'>
              <HeroIllustration />
            </Col>
          </Row>
        </Container>
      </div>

      <Container className='position-relative'>
        <div className='surface-card px-3 py-4 mt-2'>
          <Row className='g-3 text-center'>
            {[
              ['100%', 'free, no sign-up', 'text-gradient'],
              ['23', 'job roles with keyword lists', 'text-primary'],
              ['5', 'ATS-safe resume templates', 'text-success'],
              ['0', 'files stored on our servers', 'text-gradient'],
            ].map(([n, label, tone]) => (
              <Col xs={6} md={3} key={label}>
                <div className={`stat-number ${tone}`}>{n}</div>
                <div className='small text-secondary mt-1'>{label}</div>
              </Col>
            ))}
          </Row>
        </div>
      </Container>

      <Container>
        <section className='py-5' aria-labelledby='how-heading'>
          <h2 id='how-heading' className='h3 fw-bold text-center mb-2'>How it works</h2>
          <p className='text-secondary text-center mb-4'>From upload to an improved resume in three steps.</p>
          <Row className='g-3'>
            {steps.map((s, i) => (
              <Col md={4} key={s.title}>
                <div className='surface-card h-100 p-4'>
                  <div className='d-flex align-items-center gap-3 mb-3'>
                    <span className='icon-tile'>
                      <s.icon size={20} aria-hidden='true' />
                    </span>
                    <span className='small fw-semibold text-secondary'>Step {i + 1}</span>
                  </div>
                  <h3 className='h6 fw-bold mb-1'>{s.title}</h3>
                  <p className='text-secondary small mb-0'>{s.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </section>

        <section className='py-4' aria-labelledby='features-heading'>
          <h2 id='features-heading' className='h3 fw-bold text-center mb-2'>Everything you need to apply with confidence</h2>
          <p className='text-secondary text-center mb-4'>All free. No account required.</p>
          <Row className='g-3'>
            {features.map((f, i) => (
              <Col md={6} lg={4} key={f.title}>
                <div className='surface-card card-hover h-100 p-4 d-flex flex-column'>
                  <span className={`icon-tile mb-3 tile-${['indigo', 'emerald', 'amber', 'sky', 'violet', 'rose'][i % 6]}`}>
                    <f.icon size={20} aria-hidden='true' />
                  </span>
                  <h3 className='h6 fw-bold mb-1'>{f.title}</h3>
                  <p className='text-secondary small mb-3'>{f.desc}</p>
                  <div className='mt-auto small fw-semibold'>
                    {f.cta ? (
                      <Button variant='link' size='sm' className='p-0 fw-semibold' onClick={f.cta[1]}>
                        {f.cta[0]} <ArrowRight size={14} aria-hidden='true' />
                      </Button>
                    ) : (
                      <Link to={f.to[1]} className='d-inline-flex align-items-center gap-1'>
                        {f.to[0]} <ArrowRight size={14} aria-hidden='true' />
                      </Link>
                    )}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </section>
      </Container>

      <div className='mt-5'>
        <Showcases />
      </div>

      <Container>
        <section className='py-5' aria-labelledby='guides-heading'>
          <div className='d-flex justify-content-between align-items-baseline mb-3'>
            <h2 id='guides-heading' className='h4 fw-bold mb-0'>Resume guides</h2>
            <Link to='/guides' className='small fw-semibold d-inline-flex align-items-center gap-1'>
              All guides <ArrowRight size={14} aria-hidden='true' />
            </Link>
          </div>
          <Row className='g-3'>
            {GUIDES.map((g) => (
              <Col md={6} lg={3} key={g.slug}>
                <Link
                  to={`/guides/${g.slug}`}
                  className='surface-card card-hover d-flex flex-column h-100 text-reset text-decoration-none p-3'
                >
                  <span className='icon-tile icon-tile-sm mb-2'>
                    <BookOpen size={16} aria-hidden='true' />
                  </span>
                  <span className='fw-semibold small mb-2'>{g.title}</span>
                  <span className='small text-secondary mt-auto d-inline-flex align-items-center gap-1'>
                    <Clock size={13} aria-hidden='true' /> {g.minutes} min read
                  </span>
                </Link>
              </Col>
            ))}
          </Row>
        </section>

        <section className='pb-4' aria-labelledby='kw-heading'>
          <div className='surface-card p-4 d-flex flex-wrap align-items-center justify-content-between gap-3'>
            <div>
              <h2 id='kw-heading' className='h5 fw-bold mb-1'>Resume keywords for your role</h2>
              <p className='text-secondary small mb-0'>
                See the skills ATS systems look for in 23 jobs, from software engineer to nurse.
              </p>
            </div>
            <Link to='/keywords' className='btn btn-outline-primary'>
              Browse keywords <ArrowRight size={15} aria-hidden='true' />
            </Link>
          </div>
        </section>

        <Faq />

        <section
          className='rounded-4 p-4 p-md-5 text-center text-white mb-2 position-relative overflow-hidden'
          style={{background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 45%, #15803d 100%)'}}
        >
          <div className='position-absolute top-0 start-0 w-100 h-100 cta-pattern' aria-hidden='true' />
          <div className='position-relative'>
          <h2 className='h3 fw-bold mb-2 text-white'>Ready to build a resume that gets read?</h2>
          <p className='mb-4 opacity-75'>Start from scratch or import your current resume. It takes a few minutes.</p>
          <div className='d-flex gap-2 justify-content-center flex-wrap'>
            <Button as={Link} to='/resumes?new=1' variant='light' size='lg' className='fw-semibold text-primary'>
              <Plus size={18} aria-hidden='true' /> Build my resume
            </Button>
            <Button variant='outline-light' size='lg' onClick={openPicker}>
              <Upload size={18} aria-hidden='true' /> Check an existing one
            </Button>
          </div>
          </div>
        </section>
      </Container>

      <Modal show={show} onHide={() => setShow(false)} centered size='lg' scrollable fullscreen='sm-down'>
        <Modal.Header closeButton>
          <Modal.Title>ATS Score</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className='text-secondary mb-3 text-break'>
            File: <span className='fw-semibold'>{fileName}</span>
            {jobDescription.trim()
              ? ' · compared with your job description'
              : role && ` · checked for ${roles.find((r) => r.id === role)?.label || 'your target role'}`}
          </p>

          {loading && (
            <>
              {uploadPct < 1 ? (
                <>
                  <p className='mb-2'>Uploading… {Math.round(uploadPct * 100)}%</p>
                  <ProgressBar now={Math.max(uploadPct * 100, 3)} label={`${Math.round(uploadPct * 100)}%`} visuallyHidden />
                </>
              ) : (
                <>
                  <p className='mb-2'>Analyzing your resume…</p>
                  <ProgressBar animated striped now={100} />
                </>
              )}
            </>
          )}
          {err && <Alert variant='danger' className='mb-0'>{err}</Alert>}
          {!loading && <ScoreReport result={result} />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='outline-secondary' onClick={openPicker}>
            Score another file
          </Button>
          {result && lastFile ? (
            <Button variant='primary' onClick={importIntoBuilder} disabled={importing}>
              {importing ? <Spinner size='sm' /> : <><Wand2 size={16} aria-hidden='true' /> Fix it in the builder</>}
            </Button>
          ) : (
            <Button as={Link} to='/resumes?new=1' variant='primary'>
              Build a resume
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  )
}
