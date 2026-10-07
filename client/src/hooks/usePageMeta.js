import {useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import {DEFAULT_DESCRIPTION, fullTitle} from '../content/seo'

const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')

// Update an existing head tag in place (index.html ships defaults) or create it.
function setTag(selector, create, attr, value) {
  let el = document.head.querySelector(selector)
  if (value == null) {
    el?.remove()
    return
  }
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

const meta = (key, keyAttr = 'name') => () => {
  const el = document.createElement('meta')
  el.setAttribute(keyAttr, key)
  return el
}

/**
 * Sets the document title, description, canonical URL and social tags for a
 * page. Pass noindex for private pages (a user's own resume or letter).
 */
export default function usePageMeta({title, description = DEFAULT_DESCRIPTION, noindex = false} = {}) {
  const {pathname} = useLocation()

  useEffect(() => {
    const t = fullTitle(title)
    const url = `${SITE_URL}${pathname}`
    document.title = t
    setTag('meta[name="description"]', meta('description'), 'content', description)
    setTag('meta[name="robots"]', meta('robots'), 'content', noindex ? 'noindex, nofollow' : null)
    setTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), {rel: 'canonical'}), 'href', noindex ? null : url)
    setTag('meta[property="og:title"]', meta('og:title', 'property'), 'content', t)
    setTag('meta[property="og:description"]', meta('og:description', 'property'), 'content', description)
    setTag('meta[property="og:url"]', meta('og:url', 'property'), 'content', url)
    setTag('meta[name="twitter:title"]', meta('twitter:title'), 'content', t)
    setTag('meta[name="twitter:description"]', meta('twitter:description'), 'content', description)
  }, [title, description, noindex, pathname])
}
