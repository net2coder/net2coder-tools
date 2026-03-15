import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, GripVertical, Loader2, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toolsService } from '@/services/tools.service'
import { featuresService } from '@/services/features.service'
import { stepsService } from '@/services/steps.service'
import { mediaService } from '@/services/media.service'
import { ImageUpload, Field, Modal } from '@/components/ui/index'
import { slugify } from '@/utils'
import { toast } from 'sonner'
import type { ToolFormData, Feature, Step } from '@/types'

type TabId = 'info' | 'features' | 'steps' | 'seo'

export default function ToolForm() {
  const { id } = useParams<{ id?: string }>()
  const isEdit  = !!id
  const navigate = useNavigate()

  const [tab, setTab]             = useState<TabId>('info')
  const [saving, setSaving]       = useState(false)
  const [loading, setLoading]     = useState(isEdit)
  const [toolId, setToolId]       = useState<string | null>(id ?? null)
  const [logoUrl, setLogoUrl]     = useState<string | null>(null)
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)

  // Features state
  const [features, setFeatures] = useState<{ text: string }[]>([{ text: '' }])
  // Steps state
  const [steps, setSteps] = useState<{ title: string; description: string; image_url: string; uploading: boolean }[]>([
    { title: '', description: '', image_url: '', uploading: false },
  ])

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ToolFormData>({
    defaultValues: { status: 'draft', category: 'extension' },
  })

  const title = watch('title')

  // Auto-slug on title change (create mode only)
  useEffect(() => {
    if (!isEdit && title) setValue('slug', slugify(title))
  }, [title, isEdit])

  // Load existing data for edit
  useEffect(() => {
    if (!id) return
    toolsService.adminGetById(id).then(tool => {
      if (!tool) { navigate('/admin/tools'); return }
      const fields: (keyof ToolFormData)[] = ['title','slug','short_desc','description','why_built','status','category','meta_title','meta_desc','github_url','store_url']
      fields.forEach(f => setValue(f, (tool as any)[f] ?? ''))
      setLogoUrl(tool.logo_url)
      setBannerUrl(tool.banner_url)
      if (tool.features?.length) setFeatures(tool.features.map(f => ({ text: f.text })))
      if (tool.steps?.length) setSteps(tool.steps.map(s => ({ title: s.title ?? '', description: s.description ?? '', image_url: s.image_url ?? '', uploading: false })))
      setLoading(false)
    })
  }, [id])

  const onSubmit = async (data: ToolFormData) => {
    setSaving(true)
    try {
      let tid = toolId
      if (!tid) {
        const tool = await toolsService.create(data)
        tid = tool.id
        setToolId(tid)
      } else {
        await toolsService.update(tid, data)
      }

      // Save features
      await featuresService.upsertMany(tid, features.filter(f => f.text.trim()).map((f, i) => ({
        tool_id: tid!, text: f.text, icon: null, order_index: i,
      })))

      // Save steps
      await stepsService.upsertMany(tid, steps.filter(s => s.title || s.description).map((s, i) => ({
        tool_id: tid!, title: s.title, description: s.description, image_url: s.image_url, order_index: i,
      })))

      toast.success(isEdit ? 'Tool updated!' : 'Tool created!')
      navigate('/admin/tools')
    } catch (err: any) {
      toast.error(err.message ?? 'Save failed')
    } finally { setSaving(false) }
  }

  const uploadLogo = async (file: File) => {
    if (!toolId) { toast.error('Save basic info first to upload logo.'); return }
    const url = await mediaService.uploadImage(file, 'logos')
    await toolsService.updateLogoUrl(toolId, url)
    setLogoUrl(url)
    toast.success('Logo uploaded')
  }

  const uploadBanner = async (file: File) => {
    if (!toolId) { toast.error('Save basic info first to upload banner.'); return }
    const url = await mediaService.uploadImage(file, 'banners')
    await toolsService.updateBannerUrl(toolId, url)
    setBannerUrl(url)
    toast.success('Banner uploaded')
  }

  const uploadStepImage = async (file: File, idx: number) => {
    if (!toolId) { toast.error('Save basic info first.'); return }
    setSteps(prev => prev.map((s, i) => i === idx ? { ...s, uploading: true } : s))
    try {
      const url = await mediaService.uploadImage(file, 'steps')
      setSteps(prev => prev.map((s, i) => i === idx ? { ...s, image_url: url, uploading: false } : s))
    } catch { setSteps(prev => prev.map((s, i) => i === idx ? { ...s, uploading: false } : s)) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <Loader2 size={22} color="var(--teal)" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const tabs: { id: TabId; label: string }[] = [
    { id: 'info', label: 'Basic Info' },
    { id: 'features', label: 'Features' },
    { id: 'steps', label: 'Steps' },
    { id: 'seo', label: 'SEO & Media' },
  ]

  return (
    <div style={{ animation: 'fadeUp .3s ease', maxWidth: 860 }}>
      <div className="page-header">
        <div>
          <button
            onClick={() => navigate('/admin/tools')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 8 }}
          >
            <ArrowLeft size={12} /> Tools
          </button>
          <h1 className="page-title">{isEdit ? 'Edit Tool' : 'New Tool'}</h1>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={saving}
          className="btn-teal"
          style={{ fontSize: 13, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : 'Save Tool'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-sub)', marginBottom: '2rem' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 12,
              padding: '10px 18px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: tab === t.id ? 'var(--teal)' : 'var(--text2)',
              borderBottom: tab === t.id ? '2px solid var(--teal)' : '2px solid transparent',
              marginBottom: -1, transition: 'color .15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ── INFO TAB ── */}
        {tab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <Field label="Title *" error={errors.title?.message}>
                <input className="input" {...register('title', { required: 'Required' })} placeholder="Neo Tab" />
              </Field>
              <Field label="Slug *" error={errors.slug?.message} hint="Auto-generated from title">
                <input className="input" {...register('slug', { required: 'Required' })} placeholder="neo-tab" />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <Field label="Category">
                <select className="input" {...register('category')}>
                  <option value="extension">Browser Extension</option>
                  <option value="devtool">Developer Tool</option>
                  <option value="utility">Utility</option>
                  <option value="theme">Theme</option>
                </select>
              </Field>
              <Field label="Status">
                <select className="input" {...register('status')}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
            </div>
            <Field label="Short Description" hint="Shown on tool cards">
              <input className="input" {...register('short_desc')} placeholder="One-line summary of the tool..." />
            </Field>
            <Field label="Full Description">
              <textarea className="input" style={{ minHeight: 120 }} {...register('description')} placeholder="Detailed description..." />
            </Field>
            <Field label="Why I Built This">
              <textarea className="input" style={{ minHeight: 100 }} {...register('why_built')} placeholder="The problem it solves, your motivation..." />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <Field label="GitHub URL">
                <input className="input" type="url" {...register('github_url')} placeholder="https://github.com/..." />
              </Field>
              <Field label="Chrome Store URL">
                <input className="input" type="url" {...register('store_url')} placeholder="https://chrome.google.com/..." />
              </Field>
            </div>
          </div>
        )}

        {/* ── FEATURES TAB ── */}
        {tab === 'features' && (
          <div>
            <p style={{ fontSize: 14, color: 'var(--text1)', marginBottom: '1.5rem' }}>
              Add the key features of this tool. Each feature appears as a bullet point on the detail page.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <GripVertical size={14} color="var(--text2)" style={{ flexShrink: 0 }} />
                  <input
                    className="input"
                    value={f.text}
                    onChange={e => setFeatures(prev => prev.map((x, xi) => xi === i ? { ...x, text: e.target.value } : x))}
                    placeholder={`Feature ${i + 1}...`}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setFeatures(prev => prev.filter((_, xi) => xi !== i))}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', lineHeight: 1 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setFeatures(prev => [...prev, { text: '' }])}
              className="btn-outline"
              style={{ marginTop: '1rem', fontSize: 12 }}
            >
              <Plus size={13} /> Add Feature
            </button>
          </div>
        )}

        {/* ── STEPS TAB ── */}
        {tab === 'steps' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ fontSize: 14, color: 'var(--text1)' }}>
              Add step-by-step visual explanation of how the tool works.
            </p>
            {steps.map((s, i) => (
              <div key={i} style={{
                background: 'var(--bg3)', border: '1px solid var(--border-sub)',
                borderRadius: 'var(--radius-lg)', padding: '1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--teal)' }}>STEP {String(i + 1).padStart(2, '0')}</span>
                  <button
                    type="button"
                    onClick={() => setSteps(prev => prev.filter((_, xi) => xi !== i))}
                    className="btn-danger"
                    style={{ fontSize: 11, padding: '4px 10px' }}
                  >
                    <Trash2 size={11} /> Remove
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Field label="Step Title">
                      <input
                        className="input"
                        value={s.title}
                        onChange={e => setSteps(prev => prev.map((x, xi) => xi === i ? { ...x, title: e.target.value } : x))}
                        placeholder="Step title..."
                      />
                    </Field>
                    <Field label="Description">
                      <textarea
                        className="input"
                        style={{ minHeight: 80 }}
                        value={s.description}
                        onChange={e => setSteps(prev => prev.map((x, xi) => xi === i ? { ...x, description: e.target.value } : x))}
                        placeholder="Explain this step..."
                      />
                    </Field>
                  </div>
                  <ImageUpload
                    label="Step Image"
                    currentUrl={s.image_url || null}
                    onUpload={f => uploadStepImage(f, i)}
                    aspect="16/9"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSteps(prev => [...prev, { title: '', description: '', image_url: '', uploading: false }])}
              className="btn-outline"
              style={{ fontSize: 12 }}
            >
              <Plus size={13} /> Add Step
            </button>
          </div>
        )}

        {/* ── SEO & MEDIA TAB ── */}
        {tab === 'seo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {!toolId && (
              <div style={{
                background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.2)',
                borderRadius: 'var(--radius-md)', padding: '0.9rem 1.1rem',
                fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--warning)',
              }}>
                Save basic info first, then come back to upload images.
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <ImageUpload label="Logo (1:1)" currentUrl={logoUrl} onUpload={uploadLogo} aspect="1/1" />
              <ImageUpload label="Banner (16:9)" currentUrl={bannerUrl} onUpload={uploadBanner} aspect="16/9" />
            </div>
            <Field label="Meta Title" hint="Defaults to tool title if empty">
              <input className="input" {...register('meta_title')} placeholder="Neo Tab – Smart New Tab | Net2Coder Tools" />
            </Field>
            <Field label="Meta Description">
              <textarea className="input" style={{ minHeight: 80 }} {...register('meta_desc')} placeholder="A short description for search engines..." />
            </Field>
          </div>
        )}
      </form>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:640px){div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
