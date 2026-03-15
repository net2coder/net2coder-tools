import { useRef, useState, ReactNode } from 'react'
import { Upload, X, Loader2, AlertTriangle } from 'lucide-react'

// ── IMAGE UPLOAD ─────────────────────────────────────────────
interface ImageUploadProps {
  label: string
  currentUrl?: string | null
  onUpload: (file: File) => Promise<void>
  aspect?: string
}

export function ImageUpload({ label, currentUrl, onUpload, aspect = '16/9' }: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    setLoading(true)
    try { await onUpload(file) } finally { setLoading(false) }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </label>
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        style={{
          aspectRatio: aspect,
          background: 'var(--bg3)',
          border: '1px dashed var(--border-sub)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: loading ? 'default' : 'pointer',
          overflow: 'hidden', position: 'relative',
          transition: 'border-color .2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-em)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-sub)')}
      >
        {preview ? (
          <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text2)' }}>
            <Upload size={20} style={{ margin: '0 auto 8px' }} />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>Click or drop to upload</p>
          </div>
        )}
        {loading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(7,9,14,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Loader2 size={20} color="var(--teal)" style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}
      </div>
      <input
        ref={inputRef} type="file" accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}

// ── CONFIRM DIALOG ───────────────────────────────────────────
interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger }: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border-sub)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        width: '100%', maxWidth: 420,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
          <AlertTriangle size={18} color={danger ? 'var(--danger)' : 'var(--warning)'} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>{title}</h3>
        </div>
        <p style={{ color: 'var(--text1)', fontSize: 14, marginBottom: '1.5rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn-outline" onClick={onCancel} style={{ padding: '8px 18px', fontSize: 13 }}>Cancel</button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 18px', fontSize: 13, borderRadius: 'var(--radius-sm)',
              background: danger ? 'var(--danger)' : 'var(--teal)',
              color: danger ? '#fff' : '#07090e',
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)',
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MODAL ────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: number
}

export function Modal({ open, onClose, title, children, width = 600 }: ModalProps) {
  if (!open) return null
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 998,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', overflowY: 'auto',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border-sub)',
        borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: width,
        maxHeight: '90vh', overflowY: 'auto',
        animation: 'fadeUp .25s ease',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-sub)',
          position: 'sticky', top: 0, background: 'var(--bg2)', zIndex: 1,
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text1)', cursor: 'pointer', lineHeight: 1 }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  )
}

// ── FORM FIELD ───────────────────────────────────────────────
interface FieldProps {
  label: string
  error?: string
  children: ReactNode
  hint?: string
}

export function Field({ label, error, children, hint }: FieldProps) {
  return (
    <div>
      <label style={{
        display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11,
        color: error ? 'var(--danger)' : 'var(--text2)',
        marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {label}
      </label>
      {children}
      {hint && !error && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>{hint}</p>}
      {error && <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

// ── EMPTY STATE ──────────────────────────────────────────────
export function EmptyState({ icon, title, message, action }: {
  icon?: ReactNode; title: string; message?: string; action?: ReactNode
}) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      {icon && <div style={{ color: 'var(--text2)', marginBottom: '1rem' }}>{icon}</div>}
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>{title}</h3>
      {message && <p style={{ color: 'var(--text1)', fontSize: 14, maxWidth: 340, margin: '0 auto 1.5rem' }}>{message}</p>}
      {action}
    </div>
  )
}

// ── SKELETON LOADER ──────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border-sub)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
      <div className="skeleton" style={{ height: 48, width: 48, borderRadius: 8, marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 18, width: '60%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 14, width: '75%', marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 34, width: 120 }} />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '1rem', padding: '14px 16px', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
          <div className="skeleton" style={{ flex: 1, height: 14 }} />
          <div className="skeleton" style={{ width: 80, height: 22 }} />
          <div className="skeleton" style={{ width: 60, height: 22 }} />
        </div>
      ))}
    </div>
  )
}
