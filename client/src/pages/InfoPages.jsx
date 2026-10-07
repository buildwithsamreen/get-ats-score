import {useState} from 'react'
import {Container, Form, Button, Alert} from 'react-bootstrap'
import usePageMeta from '../hooks/usePageMeta'
import {PAGES} from '../content/seo'
import {analyticsConfigured, analyticsProviderName, browserOptsOut, isOptedOut, setOptedOut} from '../analytics'

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || ''

function Page({title, children}) {
  return (
    <Container className='py-5' style={{maxWidth: 760}}>
      <h1 className='fw-bold h2 mb-4'>{title}</h1>
      {children}
    </Container>
  )
}

function AnalyticsNotice() {
  const [optedOut, setOptedOutState] = useState(isOptedOut)
  const blockedByBrowser = browserOptsOut()
  return (
    <>
      <p>
        To understand which features are useful, we count page visits and feature use (for example "a resume was
        scored" or "a PDF was exported") with {analyticsProviderName}, a privacy-friendly analytics service that
        doesn't use cookies or build profiles of visitors. We never send the contents of your resumes or cover
        letters, and private page addresses are anonymised.
      </p>
      {blockedByBrowser ? (
        <Alert variant='success' className='py-2'>
          Your browser sends a "Do Not Track" or Global Privacy Control signal, so we don't count your visits.
        </Alert>
      ) : (
        <Form.Check
          type='switch'
          id='analytics-optout'
          label="Don't count my visits on this browser"
          checked={optedOut}
          onChange={(e) => {
            setOptedOut(e.target.checked)
            setOptedOutState(e.target.checked)
          }}
        />
      )}
    </>
  )
}

export function Privacy() {
  usePageMeta(PAGES['/privacy'])
  return (
    <Page title='Privacy Policy'>
      <p>We designed ATS Score to collect as little data as possible.</p>
      <h5 className='fw-bold mt-4'>Resumes and cover letters you write</h5>
      <p>
        Resumes and cover letters you create are stored only in your browser's local storage on this device. We do
        not have a database and cannot see them. Clearing your browser data deletes them, so use “Download
        backup” on the My Resumes page to keep a copy.
      </p>
      <h5 className='fw-bold mt-4'>Files you score or export</h5>
      <p>
        When you check a score or download a PDF/DOCX, your resume is sent to our server, processed in memory,
        and the result is sent straight back. Nothing is written to disk or kept after the request finishes.
      </p>
      <h5 className='fw-bold mt-4'>Cookies and analytics</h5>
      <p>We do not use accounts, cookies, advertising or cross-site trackers.</p>
      {analyticsConfigured && <AnalyticsNotice />}
    </Page>
  )
}

export function Terms() {
  usePageMeta(PAGES['/terms'])
  return (
    <Page title='Terms of Use'>
      <p>By using ATS Score you agree to these terms.</p>
      <ul>
        <li className='mb-2'>
          The ATS score is an automated estimate based on common applicant-tracking-system rules. Real ATS
          products differ, so a high score does not guarantee an interview.
        </li>
        <li className='mb-2'>You are responsible for the accuracy of the information in your resume.</li>
        <li className='mb-2'>
          Your resumes are stored in your browser. We are not responsible for data lost when browser storage is
          cleared — keep a backup.
        </li>
        <li className='mb-2'>Do not upload files you don't have the right to share, or use the service to abuse our servers.</li>
        <li className='mb-2'>The service is provided “as is”, without warranties of any kind.</li>
      </ul>
    </Page>
  )
}

export function Contact() {
  usePageMeta(PAGES['/contact'])
  const [form, setForm] = useState({name: '', subject: '', message: ''})

  const submit = (e) => {
    e.preventDefault()
    const body = `${form.message}\n\n— ${form.name}`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(form.subject || 'ATS Score feedback')}&body=${encodeURIComponent(body)}`
  }

  return (
    <Page title='Contact'>
      <p className='text-secondary'>Questions, feedback or a bug to report? Send us a message.</p>
      {!CONTACT_EMAIL && (
        <Alert variant='warning'>
          No contact address is configured yet. Set <code>VITE_CONTACT_EMAIL</code> in <code>client/.env</code>.
        </Alert>
      )}
      <Form onSubmit={submit} className='d-grid gap-3'>
        <Form.Control placeholder='Your name' value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
        <Form.Control placeholder='Subject' value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} />
        <Form.Control
          as='textarea'
          rows={6}
          required
          placeholder='Your message'
          value={form.message}
          onChange={(e) => setForm({...form, message: e.target.value})}
        />
        <div>
          <Button type='submit' variant='primary' disabled={!CONTACT_EMAIL}>
            Open in email app
          </Button>
        </div>
      </Form>
    </Page>
  )
}
