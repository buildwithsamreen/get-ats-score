import {Badge, ProgressBar} from 'react-bootstrap'
import {CATEGORY_HELP} from '../content/writingTips'

function HowToFix({help}) {
  return (
    <details className='small mt-1'>
      <summary className='text-primary' style={{cursor: 'pointer'}}>How to fix</summary>
      <div className='border rounded-3 p-2 mt-1 bg-body-tertiary'>
        <p className='mb-2'>{help.text}</p>
        <div className='mb-1'>
          <span className='text-danger fw-semibold'>✗ Weak: </span>
          {help.weak}
        </div>
        <div>
          <span className='text-success fw-semibold'>✓ Strong: </span>
          {help.strong}
        </div>
      </div>
    </details>
  )
}

const scoreVariant = (pct) => (pct >= 80 ? 'success' : pct >= 65 ? 'warning' : 'danger')

const verdict = (s) =>
  s >= 80 ? 'Strong — likely to parse and rank well.' : s >= 65 ? 'Decent — a few fixes will help.' : 'Needs work — see the suggestions below.'

export default function ScoreReport({result}) {
  if (!result) return null
  const {score, categories = [], keywords = {}, suggestions = []} = result

  return (
    <div>
      <div className='d-flex align-items-end gap-3 mb-2'>
        <h2 className='fw-bold mb-0'>{score}/100</h2>
        <span className='text-secondary pb-1'>{verdict(score)}</span>
      </div>
      <ProgressBar now={score} variant={scoreVariant(score)} className='mb-4' />

      {categories.length > 0 && (
        <>
          <h6 className='fw-bold'>Breakdown</h6>
          <div className='mb-4'>
            {categories.map((c) => (
              <div key={c.key} className='mb-2'>
                <div className='d-flex justify-content-between small'>
                  <span>{c.label}</span>
                  <span className='text-secondary'>
                    {c.score}/{c.max}
                  </span>
                </div>
                <ProgressBar
                  now={(c.score / c.max) * 100}
                  variant={scoreVariant((c.score / c.max) * 100)}
                  style={{height: 6}}
                />
                {c.score / c.max < 0.8 && CATEGORY_HELP[c.key] && <HowToFix help={CATEGORY_HELP[c.key]} />}
              </div>
            ))}
          </div>
        </>
      )}

      {(keywords.mode === 'job' || keywords.mode === 'role') && (
        <div className='mb-4'>
          <h6 className='fw-bold'>
            {keywords.mode === 'role' ? `Common ${keywords.role.label} keywords` : 'Keyword match'}
          </h6>
          {keywords.missing.length > 0 && (
            <p className='small mb-2'>
              <span className='text-secondary me-1'>Missing:</span>
              {keywords.missing.map((k) => (
                <Badge key={k} bg='danger-subtle' text='danger' className='me-1 mb-1 fw-normal'>
                  {k}
                </Badge>
              ))}
            </p>
          )}
          {keywords.matched.length > 0 && (
            <p className='small mb-0'>
              <span className='text-secondary me-1'>Found:</span>
              {keywords.matched.map((k) => (
                <Badge key={k} bg='success-subtle' text='success' className='me-1 mb-1 fw-normal'>
                  {k}
                </Badge>
              ))}
            </p>
          )}
        </div>
      )}

      {keywords.mode === 'general' && keywords.matched.length > 0 && (
        <div className='mb-4'>
          <h6 className='fw-bold'>Skills detected</h6>
          {keywords.matched.map((k) => (
            <Badge key={k} bg='secondary-subtle' className='me-1 mb-1 fw-normal text-body-emphasis'>
              {k}
            </Badge>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <>
          <h6 className='fw-bold'>Suggestions</h6>
          <ul className='small mb-0 ps-3'>
            {suggestions.map((s) => (
              <li key={s} className='mb-1'>
                {s}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
