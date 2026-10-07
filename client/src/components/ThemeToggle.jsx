import {useEffect, useState} from 'react'
import {Dropdown} from 'react-bootstrap'
import {Monitor, Moon, Sun} from 'lucide-react'

// Same key and logic as the pre-paint script in index.html.
const KEY = 'ats.theme'
const OPTIONS = [
  {value: 'light', label: 'Light', icon: Sun},
  {value: 'dark', label: 'Dark', icon: Moon},
  {value: 'auto', label: 'Auto (device)', icon: Monitor},
]

const systemDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches

function readChoice() {
  try {
    return localStorage.getItem(KEY) || 'auto'
  } catch {
    return 'auto'
  }
}

function apply(choice) {
  const theme = choice === 'auto' ? (systemDark() ? 'dark' : 'light') : choice
  document.documentElement.setAttribute('data-bs-theme', theme)
}

export default function ThemeToggle() {
  const [choice, setChoice] = useState(readChoice)

  useEffect(() => {
    apply(choice)
    try {
      localStorage.setItem(KEY, choice)
    } catch {
      // storage unavailable (private mode) — theme still applies for this visit
    }
    if (choice !== 'auto') return
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    const onChange = () => apply('auto')
    mq?.addEventListener('change', onChange)
    return () => mq?.removeEventListener('change', onChange)
  }, [choice])

  const current = OPTIONS.find((o) => o.value === choice) || OPTIONS[2]

  return (
    <Dropdown align='end'>
      <Dropdown.Toggle variant='outline-secondary' size='sm' className='border-0 no-caret' aria-label={`Theme: ${current.label}`} title='Theme'>
        <current.icon size={17} aria-hidden='true' />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {OPTIONS.map((o) => (
          <Dropdown.Item key={o.value} active={o.value === choice} onClick={() => setChoice(o.value)}>
            <o.icon size={15} aria-hidden='true' className='me-2' />
            {o.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}
