interface SEOMeta {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
}

const BASE_TITLE = 'Net2Coder Tools'
const BASE_DESC  = 'Browser extensions and developer utilities. Open-source. Privacy-first.'
const BASE_URL   = 'https://tools.net2coder.in'

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function setSEO({ title, description, image, url, type = 'website' }: SEOMeta) {
  const fullTitle = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE
  const desc      = description ?? BASE_DESC
  const canonical = url ? `${BASE_URL}${url}` : BASE_URL

  document.title = fullTitle

  setMeta('description', desc)

  // OpenGraph
  setMeta('og:title',       fullTitle,    'property')
  setMeta('og:description', desc,         'property')
  setMeta('og:type',        type,         'property')
  setMeta('og:url',         canonical,    'property')
  if (image) setMeta('og:image', image,   'property')

  // Twitter
  setMeta('twitter:card',        'summary_large_image')
  setMeta('twitter:title',       fullTitle)
  setMeta('twitter:description', desc)
  if (image) setMeta('twitter:image', image)

  // Canonical
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', canonical)
}

export function resetSEO() {
  setSEO({})
}
