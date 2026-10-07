import {Link, useParams} from 'react-router-dom'
import {Container, Row, Col, Button, Alert} from 'react-bootstrap'
import {ArrowRight, CircleCheck, Copy, KeyRound, ListChecks, Search} from 'lucide-react'
import {useState} from 'react'
import {ROLE_PAGES, roleCategories, rolePageBySlug} from '../content/roleKeywords'
import {PAGES} from '../content/seo'
import usePageMeta from '../hooks/usePageMeta'
import {track} from '../analytics'

const TONES = ['indigo', 'emerald', 'amber', 'sky', 'violet', 'rose']

function Chip({k}) {
  return (
    <span className='badge bg-body-tertiary text-body-emphasis border fw-semibold px-3 py-2' style={{fontSize: '0.85rem'}}>
      {k.name}
      {k.synonyms.length > 0 && <span className='text-secondary fw-normal ms-1'>({k.synonyms.join(', ')})</span>}
    </span>
  )
}

export function KeywordIndex() {
  usePageMeta(PAGES['/keywords'])
  return (
    <Container className='py-5' style={{maxWidth: 1040}}>
      <span className='eyebrow mb-3'>
        <KeyRound size={14} aria-hidden='true' /> {ROLE_PAGES.length} job roles
      </span>
      <h1 className='fw-bold h2 mt-3 mb-2'>Resume keywords by job role</h1>
      <p className='text-secondary mb-4' style={{maxWidth: 640}}>
        The skills and terms applicant tracking systems most often look for in each role, with synonyms, an example
        summary and example bullet points. Pick your role, then check your resume against it for free.
      </p>
      {roleCategories().map((cat, ci) => (
        <section key={cat} className='mb-4'>
          <h2 className='h6 fw-bold text-uppercase text-secondary mb-3' style={{letterSpacing: '0.06em'}}>
            {cat}
          </h2>
          <Row className='g-3'>
            {ROLE_PAGES.filter((r) => r.category === cat).map((r) => (
              <Col sm={6} lg={4} key={r.slug}>
                <Link
                  to={`/keywords/${r.slug}`}
                  className='surface-card card-hover d-flex align-items-center gap-3 p-3 h-100 text-reset text-decoration-none'
                >
                  <span className={`icon-tile icon-tile-sm tile-${TONES[ci % TONES.length]}`}>
                    <ListChecks size={16} aria-hidden='true' />
                  </span>
                  <span className='flex-grow-1'>
                    <span className='fw-semibold d-block'>{r.label}</span>
                    <span className='small text-secondary'>{r.keywords.length} keywords</span>
                  </span>
                  <ArrowRight size={16} className='text-secondary' aria-hidden='true' />
                </Link>
              </Col>
            ))}
          </Row>
        </section>
      ))}
    </Container>
  )
}

export function KeywordPage() {
  const {slug} = useParams()
  const role = rolePageBySlug(slug)
  const [copied, setCopied] = useState(false)
  usePageMeta(role ? {title: role.title, description: role.description} : {title: 'Role not found', noindex: true})

  if (!role) {
    return (
      <Container className='py-5'>
        <Alert variant='warning'>
          We don't have that role yet. <Link to='/keywords'>See all roles</Link>
        </Alert>
      </Container>
    )
  }

  const top = role.keywordList.slice(0, 8)
  const rest = role.keywordList.slice(8)
  const related = ROLE_PAGES.filter((r) => r.category === role.category && r.slug !== role.slug).slice(0, 6)
  const checkUrl = `/?role=${role.slug}`

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(role.keywordList.map((k) => k.name).join(', '))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable (e.g. insecure context): nothing else to do
    }
  }

  return (
    <Container className='py-5' style={{maxWidth: 860}}>
      <nav aria-label='Breadcrumb' className='small mb-3'>
        <Link to='/keywords'>Resume keywords</Link> <span className='text-secondary'>/ {role.category}</span>
      </nav>
      <h1 className='fw-bold h2 mb-2'>{role.label} resume keywords</h1>
      <p className='lead text-secondary mb-4'>
        These are the skills and terms applicant tracking systems most often look for on a {role.label.toLowerCase()}{' '}
        resume. Include the ones that genuinely describe your experience, using the same wording.
      </p>

      <div className='surface-card p-4 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3'>
        <div>
          <div className='fw-bold'>Does your resume include these keywords?</div>
          <div className='small text-secondary'>Upload it and see which ones you're missing in seconds. Free, no sign-up.</div>
        </div>
        <Button as={Link} to={checkUrl} variant='primary' onClick={() => track('Keyword page CTA', {role: role.slug})}>
          <Search size={16} aria-hidden='true' /> Check my resume
        </Button>
      </div>

      <section className='mb-4'>
        <div className='d-flex justify-content-between align-items-baseline mb-2'>
          <h2 className='h5 fw-bold mb-0'>Most important keywords</h2>
          <Button variant='link' size='sm' className='p-0' onClick={copyAll}>
            {copied ? <CircleCheck size={15} aria-hidden='true' /> : <Copy size={15} aria-hidden='true' />}
            {copied ? 'Copied' : 'Copy all keywords'}
          </Button>
        </div>
        <p className='small text-secondary'>Listed roughly by how often they appear in job postings for this role.</p>
        <div className='d-flex flex-wrap gap-2'>
          {top.map((k) => <Chip key={k.name} k={k} />)}
        </div>
      </section>

      {rest.length > 0 && (
        <section className='mb-4'>
          <h2 className='h5 fw-bold mb-2'>More keywords to consider</h2>
          <div className='d-flex flex-wrap gap-2'>
            {rest.map((k) => <Chip key={k.name} k={k} />)}
          </div>
        </section>
      )}

      <Alert variant='info' className='small'>
        Words in brackets are alternatives an ATS may also accept, e.g. an abbreviation. When the job posting uses a
        specific term, mirror that exact wording.
      </Alert>

      <section className='mb-4'>
        <h2 className='h5 fw-bold mb-2'>Example summary</h2>
        <div className='surface-card p-3 fst-italic'>{role.sampleSummary}</div>
      </section>

      <section className='mb-4'>
        <h2 className='h5 fw-bold mb-2'>Example bullet points</h2>
        <ul className='check-list'>
          {role.sampleBullets.map((b) => (
            <li key={b} className='surface-card p-3'>
              <CircleCheck size={18} className='text-success flex-shrink-0 mt-1' aria-hidden='true' />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <p className='small text-secondary mt-2'>
          Notice the pattern: an action verb, what you did with a keyword, and a measurable result. More in our guide on{' '}
          <Link to='/guides/resume-bullet-points'>writing bullet points that get results</Link>.
        </p>
      </section>

      <section className='mb-4'>
        <h2 className='h5 fw-bold mb-2'>How to use these keywords</h2>
        <ol className='mb-0'>
          <li className='mb-1'>Put tools and hard skills in your <strong>Skills</strong> section, spelled exactly as above.</li>
          <li className='mb-1'>Show the most important ones in action inside your <strong>experience bullets</strong>.</li>
          <li className='mb-1'>Name the role and 2–3 core skills in your <strong>summary</strong>.</li>
          <li className='mb-1'>
            Only include skills you really have, and{' '}
            <Link to='/guides/tailor-resume-to-job-description'>tailor them to each job description</Link>.
          </li>
        </ol>
      </section>

      <div
        className='rounded-4 p-4 text-white my-5 d-flex flex-wrap align-items-center justify-content-between gap-3'
        style={{background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 50%, #15803d 100%)'}}
      >
        <div>
          <div className='fw-bold fs-5'>Check your {role.label.toLowerCase()} resume</div>
          <div className='opacity-75 small'>Get your ATS score and see exactly which of these keywords you're missing.</div>
        </div>
        <Button as={Link} to={checkUrl} variant='light' className='fw-semibold text-primary'>
          Check my resume <ArrowRight size={16} aria-hidden='true' />
        </Button>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className='h6 fw-bold text-uppercase text-secondary' style={{letterSpacing: '0.06em'}}>
            Related roles
          </h2>
          <div className='d-flex flex-wrap gap-2'>
            {related.map((r) => (
              <Link key={r.slug} to={`/keywords/${r.slug}`} className='btn btn-sm btn-outline-secondary'>
                {r.label}
              </Link>
            ))}
            <Link to='/keywords' className='btn btn-sm btn-link'>
              All roles
            </Link>
          </div>
        </section>
      )}
    </Container>
  )
}
