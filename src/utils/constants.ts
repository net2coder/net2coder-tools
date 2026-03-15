export const SITE_NAME    = 'Net2Coder Tools'
export const SITE_URL     = 'https://tools.net2coder.in'
export const PARENT_URL   = 'https://net2coder.in'
export const GITHUB_URL   = 'https://github.com/net2coder'

export const TOOL_CATEGORIES = [
  { value: 'extension', label: 'Browser Extension' },
  { value: 'devtool',   label: 'Developer Tool'    },
  { value: 'utility',   label: 'Utility'            },
  { value: 'theme',     label: 'Theme'              },
] as const

export const LEGAL_SLUGS = ['terms', 'privacy', 'license'] as const

export const DEFAULT_META_DESC =
  'Browser extensions and developer utilities built by Net2Coder. Open-source, privacy-first, performance-obsessed.'
