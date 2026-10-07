import {Link, useParams} from 'react-router-dom'
import {Container, Row, Col, Card, Button, Alert} from 'react-bootstrap'
import {GUIDES, guideBySlug} from '../content/guides'
import {PAGES} from '../content/seo'
import usePageMeta from '../hooks/usePageMeta'
import {track} from '../analytics'

const fmtDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})

export function GuideList() {
  usePageMeta(PAGES['/guides'])
  return (
    <Container className='py-5' style={{maxWidth: 960}}>
      <h1 className='fw-bold h2 mb-2'>Resume Guides</h1>
      <p className='text-secondary mb-4'>Short, practical guides to getting your resume read by software and by people.</p>
      <Row className='g-3'>
        {GUIDES.map((g) => (
          <Col md={6} key={g.slug}>
            <Card className='h-100 rounded-4 card-hover'>
              <Card.Body className='p-4 d-flex flex-column'>
                <h2 className='h5 fw-bold'>
                  <Link to={`/guides/${g.slug}`} className='text-reset text-decoration-none stretched-link'>
                    {g.title}
                  </Link>
                </h2>
                <p className='text-secondary small mb-3'>{g.description}</p>
                <span className='small text-secondary mt-auto'>{g.minutes} min read</span>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  )
}

function Block({b, slug}) {
  switch (b.type) {
    case 'h2':
      return <h2 className='h4 fw-bold mt-4 mb-2'>{b.text}</h2>
    case 'ul':
      return <ul className='mb-3'>{b.items.map((t) => <li key={t} className='mb-1'>{t}</li>)}</ul>
    case 'ol':
      return <ol className='mb-3'>{b.items.map((t) => <li key={t} className='mb-1'>{t}</li>)}</ol>
    case 'tip':
      return (
        <Alert variant='info' className='my-3'>
          <strong>Tip:</strong> {b.text}
        </Alert>
      )
    case 'example':
      return (
        <div className='border rounded-3 p-3 my-3 bg-body-tertiary'>
          <div className='mb-1'>
            <span className='text-danger fw-semibold'>✗ Weak: </span>
            {b.weak}
          </div>
          <div>
            <span className='text-success fw-semibold'>✓ Strong: </span>
            {b.strong}
          </div>
        </div>
      )
    case 'cta':
      return (
        <Card className='border-0 shadow-sm rounded-4 my-4'>
          <Card.Body className='p-4 d-flex flex-wrap gap-3 align-items-center justify-content-between'>
            <span className='fw-semibold'>{b.text}</span>
            <Button as={Link} to={b.to} variant='primary' onClick={() => track('Guide CTA clicked', {guide: slug})}>
              {b.label} →
            </Button>
          </Card.Body>
        </Card>
      )
    default:
      return <p>{b.text}</p>
  }
}

export function Guide() {
  const {slug} = useParams()
  const guide = guideBySlug(slug)
  usePageMeta(guide ? {title: guide.title, description: guide.description} : {title: 'Guide not found', noindex: true})

  if (!guide) {
    return (
      <Container className='py-5'>
        <Alert variant='warning'>
          That guide doesn't exist. <Link to='/guides'>See all guides</Link>
        </Alert>
      </Container>
    )
  }

  const others = GUIDES.filter((g) => g.slug !== slug)
  return (
    <Container className='py-5' style={{maxWidth: 760}}>
      <nav aria-label='Breadcrumb' className='small mb-3'>
        <Link to='/guides'>Guides</Link> <span className='text-secondary'>/</span>
      </nav>
      <article>
        <h1 className='fw-bold h2 mb-2'>{guide.title}</h1>
        <p className='text-secondary small mb-4'>
          Updated {fmtDate(guide.updated)} · {guide.minutes} min read
        </p>
        <div style={{fontSize: '1.05rem', lineHeight: 1.65}}>
          {guide.body.map((b, i) => <Block key={i} b={b} slug={guide.slug} />)}
        </div>
      </article>
      <hr className='my-5' />
      <h2 className='h6 fw-bold text-uppercase text-secondary'>More guides</h2>
      <ul className='list-unstyled'>
        {others.map((g) => (
          <li key={g.slug} className='mb-2'>
            <Link to={`/guides/${g.slug}`}>{g.title}</Link>
          </li>
        ))}
      </ul>
    </Container>
  )
}
