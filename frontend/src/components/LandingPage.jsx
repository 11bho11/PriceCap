import { useState } from 'react'
import MatrixRain from './MatrixRain'
import HowItWorksModal from './HowItWorksModal'

const ShieldLogo = () => (
  <svg width="72" height="88" viewBox="0 0 72 88" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M36 4L68 16V46C68 64 54 78 36 84C18 78 4 64 4 46V16L36 4Z"
      fill="none"
      stroke="#00FF41"
      strokeWidth="2.5"
    />
    <text
      x="36"
      y="54"
      textAnchor="middle"
      fill="#00FF41"
      fontSize="32"
      fontFamily="Share Tech Mono, monospace"
    >
      £
    </text>
  </svg>
)

export default function LandingPage({ onScanBarcode }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: 'var(--bg-color)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MatrixRain />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          padding: '0 24px',
          width: '100%',
          maxWidth: 420,
        }}
      >
        <ShieldLogo />

        <p
          style={{
            fontFamily: 'var(--font-main)',
            color: 'white',
            fontSize: 13,
            letterSpacing: '0.12em',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          THE SYSTEM DOESN&apos;T WANT YOU TO KNOW
        </p>

        <button
          onClick={onScanBarcode}
          style={{
            width: '100%',
            padding: '16px 0',
            background: 'var(--accent-green)',
            color: '#000',
            border: 'none',
            borderRadius: 4,
            fontFamily: 'var(--font-main)',
            fontSize: 16,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          SCAN BARCODE
        </button>

        <button
          onClick={() => setShowModal(true)}
          style={{
            width: '100%',
            padding: '14px 0',
            background: 'transparent',
            color: 'white',
            border: '1.5px solid rgba(255,255,255,0.35)',
            borderRadius: 4,
            fontFamily: 'var(--font-main)',
            fontSize: 13,
            letterSpacing: '0.1em',
            cursor: 'pointer',
          }}
        >
          HOW DOES IT WORK?
        </button>
      </div>

      {showModal && <HowItWorksModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
