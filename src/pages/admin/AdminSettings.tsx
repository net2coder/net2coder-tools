import { useEffect, useState } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { supabase } from '@/services/supabaseClient'
import { Field } from '@/components/ui/index'
import { toast } from 'sonner'

interface Setting { key: string; value: string }

const SETTING_LABELS: Record<string, { label: string; hint?: string; type?: string }> = {
  site_title:   { label: 'Site Title' },
  site_tagline: { label: 'Site Tagline' },
  footer_copy:  { label: 'Footer Copyright Text' },
  admin_email:  { label: 'Admin Email', hint: 'Must match your Supabase auth user', type: 'email' },
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {}
        data.forEach((s: Setting) => { map[s.key] = s.value ?? '' })
        setSettings(map)
      }
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const [key, value] of Object.entries(settings)) {
        await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
      }
      toast.success('Settings saved!')
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <Loader2 size={22} color="var(--teal)" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ animation: 'fadeUp .3s ease', maxWidth: 640 }}>
      <div className="page-header">
        <div>
          <p className="section-label" style={{ marginBottom: 4 }}>// configuration</p>
          <h1 className="page-title">Settings</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-teal" style={{ fontSize: 13, opacity: saving ? 0.7 : 1 }}>
          {saving ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={14} /> Save Settings</>}
        </button>
      </div>

      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border-sub)',
        borderRadius: 'var(--radius-lg)', padding: '1.75rem',
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
      }}>
        {Object.entries(SETTING_LABELS).map(([key, meta]) => (
          <Field key={key} label={meta.label} hint={meta.hint}>
            <input
              className="input"
              type={meta.type ?? 'text'}
              value={settings[key] ?? ''}
              onChange={e => setSettings(prev => ({ ...prev, [key]: e.target.value }))}
              placeholder={meta.label}
            />
          </Field>
        ))}
      </div>

      {/* Info box */}
      <div style={{
        marginTop: '1.5rem',
        background: 'var(--teal-dim)', border: '1px solid var(--border-em)',
        borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem',
      }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--teal)', marginBottom: 4 }}>
          // Important
        </p>
        <p style={{ fontSize: 13, color: 'var(--text1)', lineHeight: 1.7 }}>
          The admin email must match the Supabase Auth user you created manually. Changing it here does not change the auth user — update Supabase Auth separately.
        </p>
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
