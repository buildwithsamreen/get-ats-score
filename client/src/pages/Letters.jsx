import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {Container, Button, Card, Row, Col, Form, Dropdown} from 'react-bootstrap'
import {ArrowRight, Copy, Mail, MailPlus, MoreHorizontal, Trash2} from 'lucide-react'
import {LetterStore} from '../storage/letters'
import {ResumeStore} from '../storage/resumes'
import usePageMeta from '../hooks/usePageMeta'
import {PAGES} from '../content/seo'
import {track} from '../analytics'

export default function Letters() {
  usePageMeta(PAGES['/letters'])
  const navigate = useNavigate()
  const [letters, setLetters] = useState(() => LetterStore.list())
  const resumes = ResumeStore.list()
  const [resumeId, setResumeId] = useState(resumes[0]?.id || '')
  const [title, setTitle] = useState('')

  const refresh = () => setLetters(LetterStore.list())

  const create = (e) => {
    e.preventDefault()
    const letter = LetterStore.create(ResumeStore.get(resumeId), title)
    track('Cover letter created')
    navigate(`/letters/${letter.id}`)
  }

  const remove = (l) => {
    if (!window.confirm(`Delete "${l.title}"? This cannot be undone.`)) return
    LetterStore.remove(l.id)
    refresh()
  }

  return (
    <Container className='py-5'>
      <h1 className='fw-bold h2 mb-1'>Cover Letters</h1>
      <p className='text-secondary small mb-4'>
        Write a tailored letter for each application. Link it to a resume to reuse your details and generate a
        first draft. Saved in this browser and included in your backup.
      </p>

      <Card className='rounded-4 mb-4'>
        <Card.Body className='p-4'>
          <Form onSubmit={create} className='d-flex gap-2 flex-wrap align-items-center'>
            <Form.Control
              placeholder='Title, e.g. "Acme – Frontend Engineer"'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{maxWidth: 340}}
            />
            <Form.Select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              style={{maxWidth: 260}}
              aria-label='Based on resume'
            >
              <option value=''>Don't link a resume</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  Based on: {r.title}
                </option>
              ))}
            </Form.Select>
            <Button type='submit' variant='primary'>
              + New cover letter
            </Button>
          </Form>
          {resumes.length === 0 && (
            <Form.Text className='text-secondary'>
              Tip: <Link to='/resumes?new=1'>create a resume</Link> first and we can draft the letter from it.
            </Form.Text>
          )}
        </Card.Body>
      </Card>

      {letters.length === 0 ? (
        <div className='surface-card text-center p-5'>
          <span className='icon-tile mb-3'>
            <MailPlus size={20} aria-hidden='true' />
          </span>
          <h2 className='h6 fw-bold'>No cover letters yet</h2>
          <p className='text-secondary small mb-0'>Create one above. Link a resume to generate a first draft.</p>
        </div>
      ) : (
        <Row className='g-3'>
          {letters.map((l) => (
            <Col md={6} lg={4} key={l.id}>
              <Card className='h-100 rounded-4 card-hover'>
                <Card.Body className='p-4 d-flex flex-column'>
                  <div className='d-flex justify-content-between align-items-start gap-2 mb-2'>
                    <div className='d-flex gap-3 align-items-start min-w-0'>
                      <span className='icon-tile'>
                        <Mail size={20} aria-hidden='true' />
                      </span>
                      <h2 className='h6 fw-bold mb-0 mt-1 text-break'>{l.title}</h2>
                    </div>
                    <Dropdown align='end'>
                      <Dropdown.Toggle variant='outline-secondary' size='sm' className='border-0 no-caret' aria-label='More actions'>
                        <MoreHorizontal size={18} aria-hidden='true' />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => {
                            LetterStore.duplicate(l.id)
                            refresh()
                          }}
                        >
                          <Copy size={15} className='me-2' aria-hidden='true' />
                          Duplicate
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item className='text-danger' onClick={() => remove(l)}>
                          <Trash2 size={15} className='me-2' aria-hidden='true' />
                          Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                  <p className='text-secondary small mb-3'>
                    {[l.jobTitle, l.recipient?.company].filter(Boolean).join(' at ') || 'No job details yet'} ·
                    Updated {new Date(l.updatedAt).toLocaleString()}
                  </p>
                  <Button as={Link} to={`/letters/${l.id}`} variant='outline-primary' className='mt-auto'>
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
