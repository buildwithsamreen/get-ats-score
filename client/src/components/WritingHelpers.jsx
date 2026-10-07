import {useId, useRef, useState} from 'react'
import {Form, Button, OverlayTrigger, Popover, Dropdown} from 'react-bootstrap'
import {CircleCheck} from 'lucide-react'
import {VERB_GROUPS, SUMMARY_TEMPLATES, checkBullet} from '../content/writingTips'

function VerbPicker({onPick: pickVerb}) {
  const [show, setShow] = useState(false)
  const onPick = (v) => {
    setShow(false)
    pickVerb(v)
  }
  const popover = (
    <Popover style={{maxWidth: 420}}>
      <Popover.Header as='div' className='small fw-semibold'>Start a bullet with…</Popover.Header>
      <Popover.Body className='py-2'>
        {Object.entries(VERB_GROUPS).map(([group, verbs]) => (
          <div key={group} className='mb-2'>
            <div className='text-secondary small mb-1'>{group}</div>
            <div className='d-flex flex-wrap gap-1'>
              {verbs.map((v) => (
                <Button key={v} size='sm' variant='outline-secondary' className='py-0 px-2' onClick={() => onPick(v)}>
                  {v}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </Popover.Body>
    </Popover>
  )
  return (
    <OverlayTrigger
      trigger='click'
      placement='bottom-end'
      overlay={popover}
      rootClose
      show={show}
      onToggle={setShow}
    >
      <Button size='sm' variant='link' className='p-0 small text-nowrap flex-shrink-0 ms-2 mb-1'>
        Action verbs
      </Button>
    </OverlayTrigger>
  )
}

// Achievement bullets (one per line) with live feedback per line.
export function BulletsField({label, bullets, onChange, rows = 4}) {
  const id = useId()
  const ref = useRef(null)
  const text = bullets.join('\n')
  const filled = bullets.map((b, i) => ({i, b})).filter(({b}) => b.trim())
  const problems = filled.map(({i, b}) => ({i, issues: checkBullet(b)})).filter((p) => p.issues.length)

  const addVerb = (verb) => {
    const next = text.trim() ? `${text.replace(/\n+$/, '')}\n${verb} ` : `${verb} `
    onChange(next.split('\n'))
    requestAnimationFrame(() => {
      const el = ref.current
      if (!el) return
      el.focus()
      el.setSelectionRange(next.length, next.length)
    })
  }

  return (
    <Form.Group controlId={id}>
      <div className='d-flex justify-content-between align-items-end'>
        <Form.Label className='small text-secondary mb-1'>{label}</Form.Label>
        <VerbPicker onPick={addVerb} />
      </div>
      <Form.Control
        ref={ref}
        as='textarea'
        size='sm'
        rows={rows}
        value={text}
        onChange={(e) => onChange(e.target.value.split('\n'))}
      />
      {filled.length > 0 && (
        <div className='small mt-1'>
          {problems.length === 0 ? (
            <span className='text-success d-inline-flex align-items-center gap-1'><CircleCheck size={14} aria-hidden='true' /> These bullets look strong.</span>
          ) : (
            <details>
              <summary className='text-warning-emphasis' style={{cursor: 'pointer'}}>
                {problems.length} of {filled.length} bullet{filled.length > 1 ? 's' : ''} could be stronger
              </summary>
              <ul className='ps-3 mb-0 mt-1'>
                {problems.map(({i, issues}) => (
                  <li key={i} className='mb-1'>
                    <span className='fw-semibold'>“{bullets[i].trim().slice(0, 40)}{bullets[i].trim().length > 40 ? '…' : ''}”</span>
                    <span className='text-secondary'>: {issues.join(' ')}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </Form.Group>
  )
}

export function SummaryTemplatePicker({value, onChange}) {
  const pick = (role) => {
    if (value.trim() && !window.confirm('Replace your current summary with this template?')) return
    onChange(SUMMARY_TEMPLATES[role])
  }
  return (
    <Dropdown align='end'>
      <Dropdown.Toggle size='sm' variant='link' className='p-0 small text-nowrap'>
        Use a template
      </Dropdown.Toggle>
      <Dropdown.Menu style={{maxHeight: 320, overflowY: 'auto'}}>
        {Object.keys(SUMMARY_TEMPLATES).map((role) => (
          <Dropdown.Item key={role} onClick={() => pick(role)} className='small'>
            {role}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}
