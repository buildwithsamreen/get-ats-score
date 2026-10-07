import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import {PAGES, SITE_NAME, fullTitle} from './src/content/seo.js'

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// Rewrite the default head tags in index.html for one page.
function withMeta(html, {title, description, url, siteUrl, article}) {
  const t = esc(fullTitle(title))
  const d = esc(description)
  const set = (attr, key, value) => {
    html = html.replace(new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), `$1${value}$2`)
  }
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
  // Added here rather than in index.html: Vite would try to bundle a canonical href as an asset
  html = html.replace('</title>', `</title>\n    <link rel="canonical" href="${esc(url)}" />`)
  set('name', 'description', d)
  set('property', 'og:title', t)
  set('property', 'og:description', d)
  set('property', 'og:url', esc(url))
  set('property', 'og:image', `${siteUrl}/og-image.png`)
  set('name', 'twitter:title', t)
  set('name', 'twitter:description', d)
  set('name', 'twitter:image', `${siteUrl}/og-image.png`)
  if (article) {
    set('property', 'og:type', 'article')
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      dateModified: article.updated,
      mainEntityOfPage: url,
      publisher: {'@type': 'Organization', name: SITE_NAME},
    }
    html = html.replace('</head>', `  <script type="application/ld+json">${JSON.stringify(ld)}</script>\n  </head>`)
  }
  return html
}

// Build-time SEO: one HTML file per public page (correct title and social tags
// for crawlers that don't run JavaScript), plus sitemap.xml and robots.txt.
function seoPages(siteUrl) {
  let outDir
  return {
    name: 'seo-pages',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    writeBundle() {
      const template = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')
      for (const [route, page] of Object.entries(PAGES)) {
        const url = `${siteUrl}${route === '/' ? '/' : route}`
        const html = withMeta(template, {...page, url, siteUrl})
        const file = route === '/' ? path.join(outDir, 'index.html') : path.join(outDir, route, 'index.html')
        fs.mkdirSync(path.dirname(file), {recursive: true})
        fs.writeFileSync(file, html)
      }

      const today = new Date().toISOString().slice(0, 10)
      const urls = Object.entries(PAGES)
        .map(([route, page]) => {
          const priority = route === '/' ? '1.0' : route.startsWith('/guides/') || route === '/resumes' ? '0.8' : '0.5'
          return `  <url><loc>${siteUrl}${route}</loc><lastmod>${page.article?.updated || today}</lastmod><priority>${priority}</priority></url>`
        })
        .join('\n')
      fs.writeFileSync(
        path.join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
      )
      fs.writeFileSync(
        path.join(outDir, 'robots.txt'),
        `User-agent: *\nDisallow: /builder/\nDisallow: /letters/*\nAllow: /letters$\n\nSitemap: ${siteUrl}/sitemap.xml\n`
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd())
  const siteUrl = (env.VITE_SITE_URL || 'http://localhost:4173').replace(/\/$/, '')
  if (mode === 'production' && !env.VITE_SITE_URL) {
    console.warn('\n⚠ VITE_SITE_URL is not set: sitemap and social tags will point at localhost. Set it to your live domain before deploying.\n')
  }
  return {
    plugins: [react(), seoPages(siteUrl)],
    css: {
      preprocessorOptions: {
        // Bootstrap 5.3's SCSS predates Dart Sass modules; hide its deprecation noise
        scss: {quietDeps: true, silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function']},
      },
    },
  }
})
