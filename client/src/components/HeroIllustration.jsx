// Hero product mockup, drawn inline so it follows the app's light/dark theme
// (colours come from --hero-* tokens in index.css). Purely decorative content.

const lines = (x, y, widths, gap = 13) =>
  widths.map((w, i) => <rect key={i} x={x} y={y + i * gap} width={w} height={6} rx={3} className='hero-line' />)

function Bullet({x, y, w, matched}) {
  return (
    <g>
      <circle cx={x + 3} cy={y + 3} r={3} className={matched ? 'hero-ok' : 'hero-line-strong'} />
      <rect x={x + 12} y={y} width={w} height={6} rx={3} className='hero-line' />
      {matched && <rect x={x + 12} y={y} width={Math.min(42, w)} height={6} rx={3} className='hero-mark' />}
    </g>
  )
}

function Chip({x, y, label, missing}) {
  const text = missing ? `+ ${label}` : label
  const w = text.length * 6.4 + 20
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={24}
        rx={12}
        className={missing ? 'hero-chip-missing' : 'hero-chip'}
        strokeDasharray={missing ? '4 3' : undefined}
      />
      <text x={x + w / 2} y={y + 16} textAnchor='middle' className={missing ? 'hero-chip-missing-text' : 'hero-chip-text'}>
        {text}
      </text>
    </g>
  )
}

export default function HeroIllustration() {
  const R = 46
  const C = 2 * Math.PI * R
  return (
    <svg
      viewBox='0 0 560 500'
      className='hero-illustration w-100 h-auto'
      role='img'
      aria-label='Preview: a resume scored 86 out of 100, with matched and missing keywords and a suggested fix'
    >
      <defs>
        <linearGradient id='hero-ring' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#6366f1' />
          <stop offset='1' stopColor='#22c55e' />
        </linearGradient>
        <linearGradient id='hero-brand' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stopColor='#16a34a' />
          <stop offset='1' stopColor='#4f46e5' />
        </linearGradient>
        <filter id='hero-shadow' x='-30%' y='-30%' width='160%' height='160%'>
          <feDropShadow dx='0' dy='14' stdDeviation='16' floodColor='#0f172a' floodOpacity='0.14' />
        </filter>
        <radialGradient id='hero-fade' cx='0.5' cy='0.5' r='0.55'>
          <stop offset='0.55' stopColor='#fff' />
          <stop offset='1' stopColor='#fff' stopOpacity='0' />
        </radialGradient>
        <mask id='hero-dots-mask'>
          <rect width='560' height='500' fill='url(#hero-fade)' />
        </mask>
        <pattern id='hero-dots' width='18' height='18' patternUnits='userSpaceOnUse'>
          <circle cx='2' cy='2' r='1.3' className='hero-dot' />
        </pattern>
      </defs>

      {/* dotted backdrop */}
      <rect width='560' height='500' fill='url(#hero-dots)' mask='url(#hero-dots-mask)' />

      {/* resume document */}
      <g className='hero-float-slow'>
        <g filter='url(#hero-shadow)'>
          <rect x='70' y='48' width='300' height='392' rx='20' className='hero-card' />
        </g>
        <rect x='70' y='48' width='300' height='392' rx='20' className='hero-card-border' fill='none' />
        <circle cx='112' cy='96' r='20' fill='url(#hero-brand)' />
        <text x='112' y='102' textAnchor='middle' className='hero-avatar'>PS</text>
        <rect x='144' y='83' width='130' height='10' rx='5' className='hero-ink' />
        <rect x='144' y='101' width='92' height='7' rx='3.5' className='hero-line-strong' />

        <rect x='94' y='138' width='58' height='7' rx='3.5' className='hero-accent' />
        {lines(94, 154, [250, 230, 180])}

        <rect x='94' y='206' width='74' height='7' rx='3.5' className='hero-accent' />
        <rect x='94' y='222' width='120' height='7' rx='3.5' className='hero-line-strong' />
        <Bullet x={94} y={240} w={232} matched />
        <Bullet x={94} y={256} w={210} />
        <Bullet x={94} y={272} w={224} matched />
        {/* line the suggestion points at */}
        <rect x='88' y='284' width='262' height='20' rx='6' className='hero-highlight' />
        <Bullet x={94} y={291} w={190} />

        <rect x='94' y='326' width='54' height='7' rx='3.5' className='hero-accent' />
        <g>
          {[['SQL', 94], ['Python', 132], ['Tableau', 186]].map(([t, x]) => (
            <g key={t}>
              <rect x={x} y={342} width={t.length * 6 + 14} height={18} rx={9} className='hero-skill' />
              <text x={x + (t.length * 6 + 14) / 2} y={354} textAnchor='middle' className='hero-skill-text'>
                {t}
              </text>
            </g>
          ))}
        </g>

        <rect x='94' y='378' width='66' height='7' rx='3.5' className='hero-accent' />
        {lines(94, 394, [200, 150])}
      </g>

      {/* score card */}
      <g className='hero-float'>
        <g filter='url(#hero-shadow)'>
          <rect x='318' y='40' width='206' height='180' rx='20' className='hero-card' />
        </g>
        <rect x='318' y='40' width='206' height='180' rx='20' className='hero-card-border' fill='none' />
        <text x='340' y='70' className='hero-label'>ATS SCORE</text>
        <g transform='translate(390 138)'>
          <circle r={R} fill='none' strokeWidth='11' className='hero-track' />
          <circle
            r={R}
            fill='none'
            stroke='url(#hero-ring)'
            strokeWidth='11'
            strokeLinecap='round'
            strokeDasharray={`${C * 0.86} ${C}`}
            transform='rotate(-90)'
          />
          <text y='9' textAnchor='middle' className='hero-score'>86</text>
          <text y='27' textAnchor='middle' className='hero-score-of'>/100</text>
        </g>
        <g transform='translate(446 104)'>
          <rect width='58' height='22' rx='11' className='hero-pill-ok' />
          <text x='29' y='15' textAnchor='middle' className='hero-pill-ok-text'>Strong</text>
          <path d='M8 52 l9 -9 l7 6 l12 -14' fill='none' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round' className='hero-trend' />
          <text x='0' y='74' className='hero-trend-text'>+24 pts</text>
          <text x='0' y='88' className='hero-muted-text hero-tiny'>since first check</text>
        </g>
      </g>

      {/* keyword card */}
      <g className='hero-float-delay'>
        <g filter='url(#hero-shadow)'>
          <rect x='300' y='270' width='232' height='130' rx='20' className='hero-card' />
        </g>
        <rect x='300' y='270' width='232' height='130' rx='20' className='hero-card-border' fill='none' />
        <text x='320' y='298' className='hero-label'>KEYWORD MATCH</text>
        <text x='512' y='298' textAnchor='end' className='hero-label-strong'>8 / 10</text>
        <Chip x={320} y={312} label='SQL' />
        <Chip x={366} y={312} label='Tableau' />
        <Chip x={438} y={312} label='Python' />
        <Chip x={320} y={346} label='dbt' missing />
        <Chip x={381} y={346} label='A/B testing' missing />
      </g>

      {/* suggestion toast */}
      <g className='hero-float'>
        <g filter='url(#hero-shadow)'>
          <rect x='28' y='402' width='250' height='66' rx='16' className='hero-card' />
        </g>
        <rect x='28' y='402' width='250' height='66' rx='16' className='hero-card-border' fill='none' />
        <rect x='44' y='417' width='36' height='36' rx='10' className='hero-tile' />
        {/* wand + sparkle */}
        <path d='M54 444 l14 -14' strokeWidth='2.6' strokeLinecap='round' className='hero-tile-icon' />
        <path d='M70 424 v6 M67 427 h6' strokeWidth='2' strokeLinecap='round' className='hero-tile-icon' />
        <text x='92' y='430' className='hero-toast-title'>Add a metric to 2 bullets</text>
        <text x='92' y='450' className='hero-muted-text'>Quantified results  +6 pts</text>
      </g>
    </svg>
  )
}
