import { useEffect, useState } from 'react'
import { Image, Copy, Trash2, Upload, Loader2 } from 'lucide-react'
import { mediaService } from '@/services/media.service'
import { toast } from 'sonner'

type Folder = 'logos' | 'banners' | 'steps'

interface MediaFile { name: string; url: string; size: number }

export default function AdminMedia() {
  const [folder, setFolder]   = useState<Folder>('logos')
  const [files, setFiles]     = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setFiles(await mediaService.listFiles(folder)) }
    catch { setFiles([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [folder])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await mediaService.uploadImage(file, folder)
      toast.success('Uploaded!')
      load()
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied')
  }

  const handleDelete = async (url: string, name: string) => {
    try {
      await mediaService.deleteFile(url, 'tool-assets')
      setFiles(prev => prev.filter(f => f.name !== name))
      toast.success('Deleted')
    } catch { toast.error('Delete failed') }
  }

  const folders: Folder[] = ['logos', 'banners', 'steps']

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div className="page-header">
        <div>
          <p className="section-label" style={{ marginBottom: 4 }}>// assets</p>
          <h1 className="page-title">Media Manager</h1>
        </div>
        <label style={{ cursor: 'pointer' }}>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
          <span className="btn-teal" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {uploading ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</> : <><Upload size={14} /> Upload Image</>}
          </span>
        </label>
      </div>

      {/* Folder tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-sub)', paddingBottom: 0 }}>
        {folders.map(f => (
          <button
            key={f}
            onClick={() => setFolder(f)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
              color: folder === f ? 'var(--teal)' : 'var(--text2)',
              borderBottom: folder === f ? '2px solid var(--teal)' : '2px solid transparent',
              marginBottom: -1, textTransform: 'capitalize', transition: 'color .15s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div className="skeleton" style={{ height: 120 }} />
              <div className="skeleton" style={{ height: 12, margin: '8px 0 4px', width: '60%' }} />
            </div>
          ))}
        </div>
      ) : files.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text2)' }}>
          <Image size={32} style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>No files in {folder}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {files.map(f => (
            <div key={f.name} style={{
              background: 'var(--bg2)', border: '1px solid var(--border-sub)',
              borderRadius: 'var(--radius-md)', overflow: 'hidden',
              transition: 'border-color .2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-em)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-sub)')}
            >
              <div style={{ height: 120, overflow: 'hidden', background: 'var(--bg3)' }}>
                <img src={f.url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
              <div style={{ padding: '0.6rem 0.75rem' }}>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text1)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  marginBottom: 4,
                }}>
                  {f.name}
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text2)', marginBottom: 8 }}>
                  {(f.size / 1024).toFixed(0)} KB
                </p>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => handleCopy(f.url)}
                    style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border-sub)', borderRadius: 4, padding: '5px', cursor: 'pointer', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Copy URL"
                  >
                    <Copy size={11} color="var(--text1)" />
                  </button>
                  <button
                    onClick={() => handleDelete(f.url, f.name)}
                    style={{ flex: 1, background: 'rgba(255,85,85,0.08)', border: '1px solid rgba(255,85,85,0.15)', borderRadius: 4, padding: '5px', cursor: 'pointer', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Delete"
                  >
                    <Trash2 size={11} color="var(--danger)" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
