import {useRef, useState} from 'react'
import {useAuth} from '../auth/AuthContext'
import {Container, Navbar, Nav, Button, Row, Col, Card, Modal, ProgressBar} from 'react-bootstrap'

export default function Home() {
  const fileRef = useRef(null)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(null)
  const [fileName, setFileName] = useState('')
  const {user, login, logout} = useAuth()

  const openPicker = () => fileRef.current?.click()

  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setShow(true)
    setLoading(true)
    setScore(null)

    // MVP: fake score (replace with API later)
    setTimeout(() => {
      const s = Math.floor(60 + Math.random() * 35)
      setScore(s)
      setLoading(false)
    }, 900)

    e.target.value = ''
  }

  return (
    <>
      {/* NAVBAR */}
      <Navbar bg='white' expand='lg' className='border-bottom py-3'>
        <Container>
          <Navbar.Brand className='fw-bold d-flex align-items-center gap-2'>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 6,
                background: 'linear-gradient(135deg,#16a34a,#4f46e5)',
              }}
            />
            ATS Score
          </Navbar.Brand>

          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className='ms-auto align-items-lg-center gap-2'>
              {user ? (
                <Button variant='outline-dark' className='px-3' onClick={logout}>
                  Logout
                </Button>
              ) : (
                <Button variant='outline-dark' className='px-3' onClick={login}>
                  Login
                </Button>
              )}

              <Button variant='success' className='px-3'>
                Get Started
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* HERO */}
      <div className='position-relative overflow-hidden'>
        <div
          className='position-absolute top-0 start-0 translate-middle'
          style={{
            width: 600,
            height: 600,
            borderRadius: 9999,
            background: 'radial-gradient(circle, rgba(79,70,229,0.18), transparent 60%)',
          }}
        />
        <div
          className='position-absolute bottom-0 end-0 translate-middle'
          style={{
            width: 650,
            height: 650,
            borderRadius: 9999,
            background: 'radial-gradient(circle, rgba(22,163,74,0.16), transparent 60%)',
          }}
        />

        <Container className='py-5 position-relative'>
          <Row className='align-items-center g-4'>
            <Col lg={7}>
              <h1 className='display-4 fw-bold lh-1'>
                Land more interviews with an <span className='text-primary'>ATS Resume Score</span>
              </h1>
              <p className='mt-3 text-secondary' style={{maxWidth: 520}}>
                Upload your resume and instantly get an ATS score. (MVP: one-click score after
                upload)
              </p>

              <div className='mt-4 d-flex gap-2 flex-wrap'>
                <Button variant='success' size='lg' className='fw-semibold' onClick={openPicker}>
                  Get ATS Score
                </Button>
                <input
                  ref={fileRef}
                  type='file'
                  accept='.pdf,.doc,.docx'
                  hidden
                  onChange={onFileChange}
                />
              </div>

              <div className='mt-4 d-flex gap-3 align-items-center text-secondary small'>
                <span>✅ ATS-friendly check</span>
                <span>✅ Fast score</span>
                <span>✅ PDF/DOCX supported</span>
              </div>
            </Col>

            {/* RIGHT MOCK CARD */}
            <Col lg={5}>
              <img src='/images/hero-banner.png' style={{width: '100%'}} />
            </Col>
          </Row>

          {/* FEATURES */}
          <Row className='mt-5 g-3'>
            {[
              {title: 'Instant ATS Score', desc: 'Upload your resume and get a quick score.'},
              {title: 'Keyword Insights', desc: 'See what’s missing (next step).'},
              {title: 'Export Ready', desc: 'PDF/DOCX export (next step).'},
            ].map((f) => (
              <Col md={4} key={f.title}>
                <Card className='h-100 border-0 shadow-sm rounded-4'>
                  <Card.Body className='p-4'>
                    <h5 className='fw-bold'>{f.title}</h5>
                    <p className='text-secondary mb-0'>{f.desc}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* FOOTER */}
      <div className='border-top py-4 bg-white'>
        <Container className='d-flex justify-content-between flex-wrap gap-2'>
          <small className='text-secondary'>© {new Date().getFullYear()} ATS Score</small>
          <small className='text-secondary'>Privacy • Terms • Contact</small>
        </Container>
      </div>

      {/* SCORE MODAL */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>ATS Score</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className='text-secondary mb-2'>
            File: <span className='fw-semibold'>{fileName}</span>
          </p>

          {loading && (
            <>
              <p className='mb-2'>Analyzing your resume...</p>
              <ProgressBar animated now={60} />
            </>
          )}

          {!loading && score !== null && (
            <>
              <h2 className='fw-bold mb-2'>{score}/100</h2>
              <ProgressBar
                now={score}
                variant={score >= 80 ? 'success' : score >= 65 ? 'warning' : 'danger'}
              />
              <p className='text-secondary mt-3 mb-0'>
                Next: show missing keywords + formatting suggestions.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='outline-secondary' onClick={() => setShow(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
