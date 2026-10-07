import {useEffect} from 'react'
import {Link, NavLink, Outlet, useLocation} from 'react-router-dom'
import {Container, Navbar, Nav, Button, Row, Col} from 'react-bootstrap'
import {Check, Plus, ShieldCheck} from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import {initAnalytics, trackPageview} from '../analytics'

export function Brand() {
  return (
    <span className='fw-bold d-inline-flex align-items-center gap-2 text-body-emphasis' style={{letterSpacing: '-0.01em'}}>
      <span className='brand-mark' aria-hidden='true'>
        <Check size={16} strokeWidth={3} />
      </span>
      ATS Score
    </span>
  )
}

const FOOTER_LINKS = [
  {title: 'Product', links: [['ATS checker', '/'], ['Resume builder', '/resumes'], ['Cover letters', '/letters']]},
  {title: 'Resources', links: [['All guides', '/guides'], ['What is an ATS?', '/guides/what-is-an-ats'], ['ATS checklist', '/guides/ats-friendly-resume-checklist']]},
  {title: 'About', links: [['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']]},
]

export default function Layout() {
  const {pathname} = useLocation()
  useEffect(() => {
    initAnalytics()
    trackPageview(pathname)
  }, [pathname])

  return (
    <div className='d-flex flex-column min-vh-100'>
      <Navbar expand='lg' className='app-navbar py-2' collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to='/'>
            <Brand />
          </Navbar.Brand>
          <Navbar.Toggle aria-label='Menu' />
          <Navbar.Collapse>
            <Nav className='ms-auto align-items-lg-center gap-1 py-2 py-lg-0'>
              <Nav.Link as={NavLink} to='/' end eventKey='home'>
                ATS Check
              </Nav.Link>
              <Nav.Link as={NavLink} to='/resumes' eventKey='resumes'>
                My Resumes
              </Nav.Link>
              <Nav.Link as={NavLink} to='/letters' eventKey='letters'>
                Cover Letters
              </Nav.Link>
              <Nav.Link as={NavLink} to='/guides' eventKey='guides'>
                Guides
              </Nav.Link>
              <div className='d-flex align-items-center gap-2 ms-lg-2 mt-2 mt-lg-0'>
                <Button as={Link} to='/resumes?new=1' variant='primary' size='sm' className='px-3'>
                  <Plus size={16} aria-hidden='true' />
                  Build a Resume
                </Button>
                <ThemeToggle />
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className='flex-grow-1'>
        <Outlet />
      </main>

      <footer className='app-footer pt-5 pb-4 mt-5'>
        <Container>
          <Row className='g-4'>
            <Col lg={5}>
              <Brand />
              <p className='text-secondary small mt-3 mb-0' style={{maxWidth: 340}}>
                Free ATS resume checker, resume builder and cover letter writer. No sign-up, no ads.
              </p>
            </Col>
            {FOOTER_LINKS.map((col) => (
              <Col xs={6} md={4} lg={{span: 2, offset: col.title === 'Product' ? 1 : 0}} key={col.title}>
                <div className='small fw-semibold text-body-emphasis mb-2'>{col.title}</div>
                <ul className='list-unstyled small mb-0 d-grid gap-2'>
                  {col.links.map(([label, to]) => (
                    <li key={to}>
                      <Link to={to}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </Col>
            ))}
          </Row>
          <div className='d-flex justify-content-between flex-wrap gap-2 border-top mt-4 pt-3 small text-secondary'>
            <span>© {new Date().getFullYear()} ATS Score</span>
            <span className='d-inline-flex align-items-center gap-1'>
              <ShieldCheck size={14} aria-hidden='true' /> Your resumes stay in your browser
            </span>
          </div>
        </Container>
      </footer>
    </div>
  )
}
