import {Link} from 'react-router-dom'
import {Container, Row, Col, Button, Accordion} from 'react-bootstrap'
import {ArrowRight, CircleCheck, CircleX, Gauge, LayoutTemplate, PenLine} from 'lucide-react'
import ResumePreview from './ResumePreview'
import ScaledPage from './ScaledPage'
import {PAGE} from '../content/templates'
import {SAMPLE_RESUME} from '../content/sampleResume'

// Illustrative numbers for the score breakdown mockup (not real user data).
const BREAKDOWN = [
  ['Contact information', 10, 10],
  ['Standard sections', 18, 20],
  ['Keyword match', 22, 30],
  ['Action verbs', 8, 10],
  ['Quantified results', 6, 10],
  ['Readability', 9, 10],
]
const barColor = (pct) => (pct >= 0.8 ? '#16a34a' : pct >= 0.65 ? '#f59e0b' : '#ef4444')

function Showcase(props) {
  const {tone, eyebrow, title, text, points, cta, visual, flip} = props
  return (
    <Row className={`g-4 g-lg-5 align-items-center py-4 ${flip ? 'flex-lg-row-reverse' : ''}`}>
      <Col lg={6}>
        <span className={`icon-tile tile-${tone} mb-3`}>
          <props.icon size={20} aria-hidden='true' />
        </span>
        <div className='small fw-semibold text-secondary text-uppercase mb-1' style={{letterSpacing: '0.06em'}}>
          {eyebrow}
        </div>
        <h2 className='h3 fw-bold mb-3'>{title}</h2>
        <p className='text-secondary mb-3'>{text}</p>
        <ul className='check-list mb-4'>
          {points.map((p) => (
            <li key={p}>
              <CircleCheck size={18} className='text-success flex-shrink-0 mt-1' aria-hidden='true' />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <Button as={Link} to={cta[1]} variant='outline-primary'>
          {cta[0]} <ArrowRight size={15} aria-hidden='true' />
        </Button>
      </Col>
      <Col lg={6}>{visual}</Col>
    </Row>
  )
}

function ScoreVisual() {
  return (
    <div className='surface-card p-4' aria-hidden='true'>
      <div className='d-flex align-items-end justify-content-between mb-3'>
        <div>
          <div className='small text-secondary fw-semibold'>ATS score</div>
          <div className='stat-number'>
            73<span className='fs-6 text-secondary fw-semibold'>/100</span>
          </div>
        </div>
        <span className='badge bg-warning-subtle text-warning-emphasis'>A few fixes will help</span>
      </div>
      <div className='d-grid gap-3'>
        {BREAKDOWN.map(([label, s, max]) => (
          <div key={label}>
            <div className='d-flex justify-content-between small mb-1'>
              <span>{label}</span>
              <span className='text-secondary'>
                {s}/{max}
              </span>
            </div>
            <div className='mock-bar'>
              <span style={{width: `${(s / max) * 100}%`, background: barColor(s / max)}} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BulletVisual() {
  return (
    <div className='d-grid gap-3' aria-hidden='true'>
      <div className='surface-card p-4' style={{borderColor: 'rgba(239,68,68,0.35)'}}>
        <div className='d-flex align-items-center gap-2 small fw-semibold text-danger mb-2'>
          <CircleX size={16} /> Before
        </div>
        <p className='mb-2'>Responsible for the company website and helped with updates</p>
        <div className='d-flex flex-wrap gap-2'>
          <span className='badge bg-danger-subtle text-danger-emphasis'>Weak opener</span>
          <span className='badge bg-danger-subtle text-danger-emphasis'>No numbers</span>
        </div>
      </div>
      <div className='surface-card p-4' style={{borderColor: 'rgba(22,163,74,0.4)'}}>
        <div className='d-flex align-items-center gap-2 small fw-semibold text-success mb-2'>
          <CircleCheck size={16} /> After
        </div>
        <p className='mb-2'>
          <strong>Redesigned</strong> the company website, raising sign-ups by <strong>25%</strong> in three months
        </p>
        <div className='d-flex flex-wrap gap-2'>
          <span className='badge bg-success-subtle text-success-emphasis'>Action verb</span>
          <span className='badge bg-success-subtle text-success-emphasis'>Measurable result</span>
        </div>
      </div>
    </div>
  )
}

function TemplateFan() {
  return (
    <div className='template-fan' aria-hidden='true'>
      {['ats_modern', 'ats_classic', 'ats_skills_first'].map((id) => (
        <div className='fan-card' key={id}>
          <ScaledPage naturalWidth={(PAGE.width * 4) / 3} aspectRatio='8.5 / 11'>
            <ResumePreview resume={SAMPLE_RESUME} templateId={id} />
          </ScaledPage>
        </div>
      ))}
    </div>
  )
}

export function Showcases() {
  return (
    <section className='band py-5' aria-label='Product tour'>
      <Container>
        <Showcase
          icon={Gauge}
          tone='indigo'
          eyebrow='ATS check'
          title='Know your score, and exactly why'
          text='Every check breaks your resume down into the things applicant tracking systems and recruiters look for, then tells you what to fix first.'
          points={[
            'Score out of 100 across six categories',
            'Matched and missing keywords for a job post or role',
            'Prioritised suggestions with examples',
          ]}
          cta={['Check my resume', '/']}
          visual={<ScoreVisual />}
        />
        <Showcase
          flip
          icon={PenLine}
          tone='emerald'
          eyebrow='Writing help'
          title='Turn duties into achievements'
          text='The builder checks every bullet as you type and nudges you toward strong, measurable statements.'
          points={['Flags weak openers like “Responsible for”', 'Reminds you to add numbers', 'One-click action verbs and summary templates']}
          cta={['Try the builder', '/resumes?new=1']}
          visual={<BulletVisual />}
        />
        <Showcase
          icon={LayoutTemplate}
          tone='violet'
          eyebrow='Templates'
          title='Clean templates that parse perfectly'
          text='Five single-column layouts with standard headings. Pick one, see where page two starts, and download PDF or DOCX.'
          points={['Classic, Traditional, Compact, Modern and Skills-first', 'Live page-break preview', 'Matching cover letters']}
          cta={['Choose a template', '/resumes?new=1']}
          visual={<TemplateFan />}
        />
      </Container>
    </section>
  )
}

const FAQ = [
  ['Is it really free?', 'Yes. Checking, building, cover letters and exports are all free, with no account and no watermark.'],
  [
    'Where is my resume stored?',
    'Resumes and cover letters you build are saved only in your browser on this device. Files you upload for scoring are processed in memory and never stored on our server. Use “Download backup” to move your work to another device.',
  ],
  [
    'How accurate is the ATS score?',
    'It is a rule-based estimate built on what applicant tracking systems commonly need: readable text, standard sections, relevant keywords and clear formatting. Real systems differ, so treat it as a guide to improvement rather than a guarantee.',
  ],
  ['Which file types can I upload?', 'Text-based PDF, DOCX and TXT files up to 5 MB. Scanned PDFs and old .doc files can’t be read.'],
  [
    'Should I paste the job description?',
    'If you have it, yes. It gives the most accurate keyword match. Without it, pick a target role to check against common keywords for that job.',
  ],
]

export function Faq() {
  return (
    <section className='py-5' aria-labelledby='faq-heading'>
      <Row className='g-4'>
        <Col lg={4}>
          <h2 id='faq-heading' className='h3 fw-bold mb-2'>
            Questions, answered
          </h2>
          <p className='text-secondary'>
            Something else? <Link to='/contact'>Get in touch</Link> or read our <Link to='/guides'>guides</Link>.
          </p>
        </Col>
        <Col lg={8}>
          <Accordion flush className='surface-card overflow-hidden'>
            {FAQ.map(([q, a], i) => (
              <Accordion.Item eventKey={String(i)} key={q}>
                <Accordion.Header>{q}</Accordion.Header>
                <Accordion.Body className='text-secondary'>{a}</Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>
    </section>
  )
}
