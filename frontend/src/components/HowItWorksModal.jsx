import { useRef } from 'react'

const STEPS = [
  {
    num: '01',
    text: 'Scan the barcode. Point your camera at the product — the app identifies it automatically, no button needed.',
  },
  {
    num: '02',
    text: 'Scan the shelf price. The app reads it via OCR. You can always type the price manually instead.',
  },
  {
    num: '03',
    text: 'Get your verdict. FAIR, ABOVE MARKET, or OVERPRICED — compared to what other UK retailers charge right now.',
  },
]

export default function HowItWorksModal({ onClose }) {
  const startYRef = useRef(null)

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY
  }

  const handleTouchMove = (e) => {
    if (e.touches[0].clientY - startYRef.current > 60) onClose()
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 10,
        }}
      />
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#111',
          borderRadius: '16px 16px 0 0',
          zIndex: 11,
          padding: '20px 20px 48px',
          animation: 'slideUp 0.28s ease-out',
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: 'rgba(255,255,255,0.25)',
            borderRadius: 2,
            margin: '0 auto 20px',
          }}
        />
        <h2
          style={{
            fontFamily: 'var(--font-main)',
            color: 'white',
            fontSize: 14,
            letterSpacing: '0.12em',
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          HOW IT WORKS
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STEPS.map((s) => (
            <div
              key={s.num}
              style={{
                background: '#1a1a1a',
                borderRadius: 8,
                padding: '14px 16px',
                borderLeft: '3px solid var(--accent-green)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-main)',
                  color: 'var(--accent-green)',
                  fontSize: 11,
                  letterSpacing: '0.15em',
                  marginBottom: 6,
                }}
              >
                STEP {s.num}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-main)',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {s.text}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
    </>
  )
}
