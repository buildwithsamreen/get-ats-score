import {useState} from 'react'
import {Button} from 'react-bootstrap'
import {comparableHistory, describeKind} from '../content/scoreHistory'

const LABELS = {
  contact: 'Contact information',
  sections: 'Standard sections',
  keywords: 'Keywords',
  verbs: 'Action verbs',
  metrics: 'Quantified results',
  length: 'Length',
  format: 'Readability',
}

const fmtDate = (iso) =>
  new Date(iso).toLocaleString(undefined, {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})

export function Delta({value, suffix = ''}) {
  if (!value) return <span className='text-secondary'>No change{suffix}</span>
  const up = value > 0
  return (
    <span className={up ? 'text-success' : 'text-danger'}>
      <span aria-hidden='true'>{up ? '▲' : '▼'}</span> {up ? '+' : '−'}
      {Math.abs(value)}
      {suffix}
    </span>
  )
}

// Line chart: 0–100 fixed scale, recessive grid, 2px line, 8px markers, hover tooltip.
function TrendChart({points}) {
  const [hover, setHover] = useState(null)
  const W = 320
  const H = 120
  const pad = {l: 26, r: 14, t: 12, b: 18}
  const x = (i) => pad.l + (points.length === 1 ? 0 : (i / (points.length - 1)) * (W - pad.l - pad.r))
  const y = (s) => pad.t + (1 - s / 100) * (H - pad.t - pad.b)
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`).join(' ')
  const last = points.length - 1
  const h = hover !== null ? points[hover] : null

  return (
    <div className='position-relative'>
      <svg viewBox={`0 0 ${W} ${H}`} width='100%' role='img' aria-label={`Score trend: ${points.map((p) => p.score).join(', ')}`}>
        {[0, 50, 100].map((g) => (
          <g key={g}>
            <line x1={pad.l} x2={W - pad.r} y1={y(g)} y2={y(g)} stroke='var(--bs-border-color)' strokeWidth='1' />
            <text x={pad.l - 6} y={y(g) + 3} textAnchor='end' fontSize='9' fill='var(--bs-secondary-color)'>
              {g}
            </text>
          </g>
        ))}
        <line x1={pad.l} x2={W - pad.r} y1={y(80)} y2={y(80)} stroke='var(--app-chart-target)' strokeWidth='1' strokeDasharray='3 3' opacity='0.7' />
        <text x={W - pad.r} y={y(80) - 3} textAnchor='end' fontSize='8.5' fill='var(--bs-secondary-color)'>
          strong (80+)
        </text>

        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke='var(--bs-secondary-color)' strokeWidth='1' />
        )}
        <path d={path} fill='none' stroke='var(--app-chart-series)' strokeWidth='2' strokeLinejoin='round' strokeLinecap='round' />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.score)} r='4' fill='var(--app-chart-series)' stroke='var(--bs-body-bg)' strokeWidth='2' />
            <circle
              cx={x(i)}
              cy={y(p.score)}
              r='12'
              fill='transparent'
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              aria-label={`${fmtDate(p.at)}: ${p.score}`}
            />
          </g>
        ))}
        <text x={x(last)} y={y(points[last].score) - 9} textAnchor='middle' fontSize='10' fontWeight='700' fill='var(--bs-emphasis-color)'>
          {points[last].score}
        </text>
        <text x={pad.l} y={H - 4} fontSize='9' fill='var(--bs-secondary-color)'>
          {fmtDate(points[0].at).split(',')[0]}
        </text>
        <text x={W - pad.r} y={H - 4} textAnchor='end' fontSize='9' fill='var(--bs-secondary-color)'>
          {fmtDate(points[last].at).split(',')[0]}
        </text>
      </svg>
      {h && (
        <div
          className='position-absolute rounded-2 px-2 py-1 small shadow-sm'
          style={{
            left: `${(x(hover) / W) * 100}%`,
            top: 0,
            transform: `translateX(${hover >= (points.length - 1) / 2 ? '-105%' : '5%'})`,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            background: 'var(--bs-emphasis-color)',
            color: 'var(--bs-body-bg)',
          }}
        >
          <div className='fw-semibold'>{h.score}/100</div>
          <div className='opacity-75'>{fmtDate(h.at)}</div>
          {hover > 0 && (
            <div className='opacity-75'>
              {h.score - points[hover - 1].score >= 0 ? '+' : '−'}
              {Math.abs(h.score - points[hover - 1].score)} vs previous
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ScoreHistory({history, onClear}) {
  const points = comparableHistory(history)
  if (!points.length) return null
  const first = points[0]
  const latest = points[points.length - 1]
  const prev = points[points.length - 2]
  const kind = describeKind(latest)

  const changes = prev
    ? Object.keys(latest.categories || {})
        .map((k) => ({k, d: (latest.categories[k] || 0) - (prev.categories?.[k] || 0)}))
        .filter((c) => c.d)
        .sort((a, b) => Math.abs(b.d) - Math.abs(a.d))
    : []

  return (
    <div className='border rounded-3 p-3 mb-3'>
      <div className='d-flex justify-content-between align-items-start'>
        <h6 className='fw-bold mb-1'>Your progress</h6>
        {onClear && (
          <Button
            variant='link'
            size='sm'
            className='p-0 small text-secondary'
            onClick={() => window.confirm('Clear the score history for this resume?') && onClear()}
          >
            Clear history
          </Button>
        )}
      </div>

      {points.length < 2 ? (
        <p className='small text-secondary mb-0'>
          First check saved ({latest.score}/100). Edit your resume and check again to see how your score changes.
        </p>
      ) : (
        <>
          <div className='d-flex align-items-baseline gap-2 flex-wrap'>
            <span className='fs-4 fw-bold'>
              {first.score} → {latest.score}
            </span>
            <span className='small fw-semibold'>
              <Delta value={latest.score - first.score} suffix={` since your first check`} />
            </span>
          </div>
          <div className='small text-secondary mb-2'>
            {points.length} checks {kind}
          </div>
          <TrendChart points={points} />
          <div className='small mt-2'>
            <span className='text-secondary'>Since last check: </span>
            {changes.length === 0 ? (
              <span className='text-secondary'>no change</span>
            ) : (
              changes.slice(0, 4).map((c, i) => (
                <span key={c.k}>
                  {i > 0 && <span className='text-secondary'>, </span>}
                  {LABELS[c.k] || c.k} <Delta value={c.d} />
                </span>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
