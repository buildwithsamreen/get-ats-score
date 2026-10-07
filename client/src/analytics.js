// Privacy-friendly, cookie-free analytics. Off unless configured in .env:
//   VITE_ANALYTICS_PROVIDER = umami | plausible | goatcounter
//   VITE_ANALYTICS_SITE_ID  = Umami website ID, Plausible domain, or GoatCounter code
//   VITE_ANALYTICS_SCRIPT_URL (optional) = script URL for a self-hosted instance
// We only send page paths (with private IDs removed) and feature-usage events;
// never resume or cover letter content. Do Not Track / Global Privacy Control
// and the opt-out on the Privacy page are respected.

const PROVIDER = (import.meta.env.VITE_ANALYTICS_PROVIDER || '').toLowerCase()
const SITE_ID = import.meta.env.VITE_ANALYTICS_SITE_ID || ''
const DEFAULT_SCRIPTS = {
  umami: 'https://cloud.umami.is/script.js',
  plausible: 'https://plausible.io/js/script.manual.js',
  goatcounter: 'https://gc.zgo.at/count.js',
}
const SCRIPT_URL = import.meta.env.VITE_ANALYTICS_SCRIPT_URL || DEFAULT_SCRIPTS[PROVIDER]
const OPT_OUT_KEY = 'ats.analytics.optout'

export const analyticsConfigured = Boolean(PROVIDER && SITE_ID && SCRIPT_URL)
export const analyticsProviderName = {umami: 'Umami', plausible: 'Plausible', goatcounter: 'GoatCounter'}[PROVIDER] || ''

export function browserOptsOut() {
  return navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true
}

export function isOptedOut() {
  try {
    return localStorage.getItem(OPT_OUT_KEY) === '1'
  } catch {
    return false
  }
}

export function setOptedOut(value) {
  try {
    if (value) localStorage.setItem(OPT_OUT_KEY, '1')
    else localStorage.removeItem(OPT_OUT_KEY)
  } catch {
    // storage unavailable: the choice lasts for this visit only
  }
  sessionOptOut = value
}

let sessionOptOut = false
let loaded = false
let started = false
const queue = []

const active = () => analyticsConfigured && !browserOptsOut() && !isOptedOut() && !sessionOptOut

// /builder/3f2a…  → /builder/:id (IDs are random, but they'd clutter reports)
export function normalizePath(path) {
  return path.replace(/\/(builder|letters)\/[^/]+$/, '/$1/:id')
}

function send(kind, name, props) {
  if (PROVIDER === 'umami' && window.umami) {
    if (kind === 'pageview') window.umami.track((p) => ({...p, url: name, title: document.title}))
    else window.umami.track(name, props)
  } else if (PROVIDER === 'plausible' && window.plausible) {
    if (kind === 'pageview') window.plausible('pageview', {u: window.location.origin + name})
    else window.plausible(name, props ? {props} : undefined)
  } else if (PROVIDER === 'goatcounter' && window.goatcounter?.count) {
    if (kind === 'pageview') window.goatcounter.count({path: name})
    else window.goatcounter.count({path: `event/${name}${props ? `/${Object.values(props).join('/')}` : ''}`, title: name, event: true})
  }
}

function dispatch(kind, name, props) {
  if (!active()) return
  if (loaded) send(kind, name, props)
  else queue.push([kind, name, props])
}

export function initAnalytics() {
  if (started || !active()) return
  started = true
  const s = document.createElement('script')
  s.defer = true
  s.src = SCRIPT_URL
  if (PROVIDER === 'umami') {
    s.dataset.websiteId = SITE_ID
    s.dataset.autoTrack = 'false' // we send pageviews ourselves with private IDs removed
  } else if (PROVIDER === 'plausible') {
    s.dataset.domain = SITE_ID
  } else if (PROVIDER === 'goatcounter') {
    window.goatcounter = {no_onload: true}
    s.dataset.goatcounter = `https://${SITE_ID}.goatcounter.com/count`
  }
  s.onload = () => {
    loaded = true
    queue.splice(0).forEach(([kind, name, props]) => send(kind, name, props))
  }
  document.head.appendChild(s)
}

let lastPath = null
export function trackPageview(path) {
  const p = normalizePath(path)
  if (p === lastPath) return // ignore repeats (e.g. React re-running effects in development)
  lastPath = p
  dispatch('pageview', p)
}

/** Feature-usage event. Keep props to small, non-personal values. */
export const track = (event, props) => dispatch('event', event, props)

export const scoreBucket = (score) => (score >= 80 ? '80-100' : score >= 65 ? '65-79' : '0-64')
