import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import ErrorOverlay from './ErrorOverlay'

const API_BASE = ''

function LoadingView() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'rgba(10,10,10,0.82)',
        border: '1px solid rgba(0,255,65,0.3)',
        borderRadius: 16, padding: '32px 48px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        backdropFilter: 'blur(6px)',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid #333', borderTopColor: 'var(--accent-green)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{
          color: 'var(--accent-green)', fontFamily: 'var(--font-main)',
          marginTop: 14, letterSpacing: 2, fontSize: 13
        }}>
          LOADING
        </p>
      </div>
    </div>
  )
}

function SuccessView({ productName }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 20,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 32px',
    }}>
      <div style={{
        background: 'rgba(10,10,10,0.82)',
        border: '1px solid rgba(0,255,65,0.3)',
        borderRadius: 16, padding: '32px 28px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        backdropFilter: 'blur(6px)', width: '100%', maxWidth: 320,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          border: '3px solid var(--accent-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 30, color: 'var(--accent-green)'
        }}>
          ✓
        </div>
        <p style={{
          color: '#aaa', fontFamily: 'var(--font-main)',
          marginTop: 16, fontSize: 12, letterSpacing: 1
        }}>
          Product scanned
        </p>
        <p style={{
          color: 'var(--accent-green)', fontFamily: 'var(--font-main)',
          marginTop: 8, fontSize: 17, textAlign: 'center', lineHeight: 1.4
        }}>
          {productName}
        </p>
      </div>
    </div>
  )
}

function NotFoundView({ onScanAgain }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 20,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(10,10,10,0.95)'
    }}>
      <div style={{
        background: '#1a1a1a', borderRadius: 12, padding: '32px 24px',
        textAlign: 'center', border: '1px solid #333', maxWidth: 280, width: '90%'
      }}>
        <p style={{ color: 'white', fontFamily: 'var(--font-main)', fontSize: 18, marginBottom: 8 }}>
          Product Not Found
        </p>
        <p style={{ color: '#666', fontFamily: 'var(--font-main)', fontSize: 12, marginBottom: 24 }}>
          This barcode isn't in the database
        </p>
        <button
          onClick={onScanAgain}
          style={{
            background: 'var(--accent-green)', color: 'black',
            fontFamily: 'var(--font-main)', fontWeight: 'bold',
            border: 'none', borderRadius: 6, padding: '12px 0',
            fontSize: 14, cursor: 'pointer', width: '100%', letterSpacing: 1
          }}
        >
          SCAN AGAIN
        </button>
      </div>
    </div>
  )
}


export default function BarcodeScan({ onAdvance, onScanAgain, onError }) {
  const [scanState, setScanState] = useState('scanning')
  const [foundName, setFoundName] = useState(null)
  const videoRef = useRef(null)
  const controlsRef = useRef(null)
  const scannedRef = useRef(false)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()

    reader
      .decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current,
        (result, err) => {
          if (result && !scannedRef.current) {
            handleBarcodeDetected(result.getText())
          }
        }
      )
      .then(controls => {
        controlsRef.current = controls
      })
      .catch(err => {
        if (err?.name === 'NotAllowedError') {
          setScanState('camera-error')
        } else {
          setScanState('camera-error')
        }
      })

    return () => {
      controlsRef.current?.stop()
    }
  }, [])

  async function handleBarcodeDetected(barcode) {
    scannedRef.current = true
    setScanState('loading')

    try {
      const res = await fetch(`${API_BASE}/product/${barcode}`, { method: 'POST' })
      const data = await res.json()
      if (data.error === 'not_found') {
        controlsRef.current?.stop()
        setScanState('not-found')
      } else {
        setFoundName(data.name)
        setScanState('success')
        setTimeout(() => {
          controlsRef.current?.stop()
          onAdvance(barcode, data.name)
        }, 1500)
      }
    } catch {
      controlsRef.current?.stop()
      setScanState(navigator.onLine ? 'not-found' : 'network-error')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-color)' }}>
      {/* Our own video element — full control over playsinline + sizing */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'fixed', inset: 0,
          width: '100vw', height: '100vh',
          objectFit: 'cover',
          visibility: ['scanning', 'loading', 'success'].includes(scanState) ? 'visible' : 'hidden'
        }}
      />

      {scanState === 'scanning' && (
        <>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10,
            padding: '20px 16px',
            fontFamily: 'var(--font-main)', color: 'var(--accent-green)',
            fontSize: 13, letterSpacing: 2,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)'
          }}>
            STEP 1 OF 2 — SCAN BARCODE
          </div>

          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 280, height: 180, zIndex: 10, pointerEvents: 'none'
          }}>
            {[
              { top: 0, left: 0, borderTop: '3px solid #00FF41', borderLeft: '3px solid #00FF41' },
              { top: 0, right: 0, borderTop: '3px solid #00FF41', borderRight: '3px solid #00FF41' },
              { bottom: 0, left: 0, borderBottom: '3px solid #00FF41', borderLeft: '3px solid #00FF41' },
              { bottom: 0, right: 0, borderBottom: '3px solid #00FF41', borderRight: '3px solid #00FF41' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 28, height: 28, ...s }} />
            ))}
          </div>

          <div style={{
            position: 'fixed', bottom: 60, left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.6)', border: '1px solid #333',
            borderRadius: 20, padding: '8px 20px', zIndex: 10,
            fontFamily: 'var(--font-main)', color: 'white', fontSize: 13,
            whiteSpace: 'nowrap'
          }}>
            Scanning automatically...
          </div>
        </>
      )}

      {scanState === 'loading' && <LoadingView />}
      {scanState === 'success' && <SuccessView productName={foundName} />}
      {scanState === 'not-found' && <NotFoundView onScanAgain={onScanAgain} />}
      {(scanState === 'camera-error' || scanState === 'network-error') && (
        <ErrorOverlay type={scanState} onOk={onError} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
