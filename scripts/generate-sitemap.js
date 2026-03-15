/**
 * Sitemap Generator for Net2Coder Tools
 *
 * Run with: node scripts/generate-sitemap.js
 * Or add to package.json scripts: "sitemap": "node scripts/generate-sitemap.js"
 *
 * Requires: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment
 * Install: npm install @supabase/supabase-js dotenv (if not already)
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
)

const BASE_URL = 'https://tools.net2coder.in'

const STATIC_ROUTES = [
  { path: '/',             priority: '1.0', changefreq: 'weekly'  },
  { path: '/tools',        priority: '0.9', changefreq: 'weekly'  },
  { path: '/install-guide',priority: '0.7', changefreq: 'monthly' },
  { path: '/legal/terms',  priority: '0.4', changefreq: 'yearly'  },
  { path: '/legal/privacy',priority: '0.4', changefreq: 'yearly'  },
  { path: '/legal/license',priority: '0.3', changefreq: 'yearly'  },
]

function xmlEscape(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function generate() {
  const now = new Date().toISOString().split('T')[0]

  // Fetch published tools
  const { data: tools, error } = await supabase
    .from('tools')
    .select('slug, updated_at')
    .eq('status', 'published')

  if (error) {
    console.error('Failed to fetch tools:', error.message)
    process.exit(1)
  }

  // Fetch legal pages
  const { data: legalPages } = await supabase
    .from('legal_pages')
    .select('slug, updated_at')

  const urls = []

  // Static routes
  for (const route of STATIC_ROUTES) {
    urls.push(`
  <url>
    <loc>${BASE_URL}${xmlEscape(route.path)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`)
  }

  // Tool detail pages
  for (const tool of (tools ?? [])) {
    const lastmod = tool.updated_at?.split('T')[0] ?? now
    urls.push(`
  <url>
    <loc>${BASE_URL}/tools/${xmlEscape(tool.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
  }

  // Custom legal pages (not in static list)
  const staticSlugs = new Set(['terms', 'privacy', 'license'])
  for (const page of (legalPages ?? [])) {
    if (!staticSlugs.has(page.slug)) {
      const lastmod = page.updated_at?.split('T')[0] ?? now
      urls.push(`
  <url>
    <loc>${BASE_URL}/legal/${xmlEscape(page.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>`)
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">${urls.join('')}
</urlset>`

  const outPath = resolve(__dirname, '../public/sitemap.xml')
  writeFileSync(outPath, xml, 'utf8')
  console.log(`✔ Sitemap generated: ${outPath}`)
  console.log(`  Static routes: ${STATIC_ROUTES.length}`)
  console.log(`  Tool pages:    ${(tools ?? []).length}`)
  console.log(`  Legal pages:   ${(legalPages ?? []).filter(p => !staticSlugs.has(p.slug)).length}`)
}

generate()
