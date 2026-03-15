import { FolderOpen, ToggleRight, Upload, Download, Puzzle, CheckCircle } from 'lucide-react'

const steps = [
  {
    icon: <Download size={22} />,
    title: 'Download the ZIP',
    desc: 'Click the Download button on the tool page to get the latest version ZIP file. Save it somewhere you can find it — like your Downloads folder.',
  },
  {
    icon: <FolderOpen size={22} />,
    title: 'Extract the ZIP',
    desc: 'Right-click the downloaded ZIP file and select "Extract All" (Windows) or double-click it (Mac). You\'ll get a folder containing the extension files.',
  },
  {
    icon: <Puzzle size={22} />,
    title: 'Open chrome://extensions',
    desc: 'Open Google Chrome or any Chromium-based browser. Type chrome://extensions in the address bar and press Enter.',
  },
  {
    icon: <ToggleRight size={22} />,
    title: 'Enable Developer Mode',
    desc: 'In the top-right corner of the Extensions page, toggle on "Developer mode". This unlocks the ability to load unpacked extensions.',
  },
  {
    icon: <Upload size={22} />,
    title: 'Load Unpacked',
    desc: 'Click the "Load unpacked" button that appears after enabling Developer mode. Browse to and select the extracted extension folder (not the ZIP file).',
  },
  {
    icon: <CheckCircle size={22} />,
    title: "You're done!",
    desc: 'The extension will appear in your browser toolbar. You may need to pin it from the Extensions menu (puzzle piece icon) to keep it visible.',
  },
]

export default function InstallGuide() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem clamp(1.5rem, 5vw, 4rem)' }}>
      <p className="section-label" style={{ marginBottom: 8 }}>// how to install</p>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2rem, 5vw, 3rem)',
        fontWeight: 800, letterSpacing: '-0.02em',
        marginBottom: '1rem',
      }}>
        Chrome Extension<br />
        <span style={{ color: 'var(--teal)' }}>Install Guide</span>
      </h1>
      <p style={{ color: 'var(--text1)', fontSize: 16, lineHeight: 1.75, marginBottom: '3.5rem', maxWidth: 560 }}>
        Net2Coder extensions are distributed as ZIP files for maximum transparency. Follow these steps to install any extension manually in Chrome or any Chromium-based browser.
      </p>

      {/* Steps */}
      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute', left: 20, top: 0, bottom: 0,
          width: 1,
          background: 'linear-gradient(to bottom, var(--teal), transparent)',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingLeft: '3.5rem' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ position: 'relative', animation: `fadeUp .5s ease forwards ${i * 0.1}s`, opacity: 0 }}>
              {/* Number node */}
              <div style={{
                position: 'absolute', left: -52, top: 0,
                width: 42, height: 42,
                background: 'var(--bg0)', border: '2px solid var(--teal)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--teal)',
              }}>
                {s.icon}
              </div>

              <div style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border-sub)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem 1.5rem',
                transition: 'border-color .2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-em)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-sub)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--teal)', letterSpacing: '0.1em' }}>
                    STEP {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
                  {s.title}
                </h3>
                <p style={{ color: 'var(--text1)', fontSize: 14, lineHeight: 1.7 }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div style={{
        marginTop: '3rem',
        background: 'var(--bg2)',
        border: '1px solid var(--border-sub)',
        borderLeft: '3px solid var(--teal)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
      }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, marginBottom: 6, color: 'var(--teal)' }}>
          Compatible Browsers
        </h4>
        <p style={{ fontSize: 13, color: 'var(--text1)', lineHeight: 1.7 }}>
          These extensions work with any Chromium-based browser: <strong style={{ color: 'var(--text0)' }}>Google Chrome</strong>, <strong style={{ color: 'var(--text0)' }}>Microsoft Edge</strong>, <strong style={{ color: 'var(--text0)' }}>Brave</strong>, <strong style={{ color: 'var(--text0)' }}>Opera</strong>, <strong style={{ color: 'var(--text0)' }}>Vivaldi</strong>, and more.
        </p>
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
