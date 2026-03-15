import { useState } from 'react'
import { Download, ChevronDown, Star, Loader2, CheckCircle2 } from 'lucide-react'
import type { Version, Tool } from '@/types'
import { useDownload } from '@/hooks/useDownload'
import { formatDate } from '@/utils'

interface VersionSelectorProps {
  tool: Tool
  versions: Version[]
}

export function VersionSelector({ tool, versions }: VersionSelectorProps) {
  const latestVersion = versions.find(v => v.is_latest) ?? versions[0]
  const [selected, setSelected] = useState<Version>(latestVersion)
  const [dropOpen, setDropOpen] = useState(false)
  const { downloading, downloadedId, download } = useDownload()

  if (!selected || versions.length === 0) return null

  const justDownloaded = downloadedId === selected.id

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border-sub)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'visible',
    }}>
      {/* Selected version header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-sub)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24, fontWeight: 800,
              color: 'var(--teal)', lineHeight: 1,
            }}>
              v{selected.version_number}
            </span>
            {selected.is_latest && (
              <span className="badge badge-teal" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Star size={9} /> Latest
              </span>
            )}
          </div>

          {/* Version dropdown — only show if multiple versions */}
          {versions.length > 1 && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropOpen(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'var(--text2)',
                  background: 'var(--bg3)',
                  border: '1px solid var(--border-sub)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '5px 10px', cursor: 'pointer',
                  transition: 'border-color .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-em)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-sub)')}
              >
                All versions <ChevronDown size={11} style={{ transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
              </button>

              {dropOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 4px)',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border-sub)',
                  borderRadius: 'var(--radius-md)',
                  minWidth: 160, zIndex: 50,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  overflow: 'hidden',
                }}>
                  {versions.map(v => (
                    <button
                      key={v.id}
                      onClick={() => { setSelected(v); setDropOpen(false) }}
                      style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%', padding: '10px 14px',
                        fontFamily: 'var(--font-mono)', fontSize: 12,
                        color: selected.id === v.id ? 'var(--teal)' : 'var(--text1)',
                        background: selected.id === v.id ? 'var(--teal-dim)' : 'transparent',
                        border: 'none', cursor: 'pointer',
                        transition: 'background .1s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => { if (selected.id !== v.id) e.currentTarget.style.background = 'var(--bg3)' }}
                      onMouseLeave={e => { if (selected.id !== v.id) e.currentTarget.style.background = 'transparent' }}
                    >
                      <span>v{v.version_number}</span>
                      {v.is_latest && <Star size={10} color="var(--teal)" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)' }}>
          Released {formatDate(selected.release_date)}
          {' · '}
          {selected.download_count.toLocaleString()} download{selected.download_count !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Changelog */}
      {selected.changelog && (
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-sub)' }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--text2)', textTransform: 'uppercase',
            letterSpacing: '0.1em', marginBottom: 8,
          }}>
            Changelog
          </p>
          <p style={{
            fontSize: 13, color: 'var(--text1)',
            whiteSpace: 'pre-line', lineHeight: 1.75,
          }}>
            {selected.changelog}
          </p>
        </div>
      )}

      {/* Download button */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <button
          onClick={() => download(tool, selected)}
          disabled={downloading}
          className="btn-teal"
          style={{
            width: '100%', justifyContent: 'center',
            opacity: downloading ? 0.75 : 1,
            background: justDownloaded ? '#00c87a' : 'var(--teal)',
            transition: 'background .3s, opacity .2s',
          }}
        >
          {downloading ? (
            <>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Preparing download…
            </>
          ) : justDownloaded ? (
            <>
              <CheckCircle2 size={14} />
              Downloaded!
            </>
          ) : (
            <>
              <Download size={14} />
              Download v{selected.version_number}
            </>
          )}
        </button>

        <p style={{
          textAlign: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'var(--text2)', marginTop: 8,
          lineHeight: 1.5,
        }}>
          ZIP · Chrome / Chromium extension
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
