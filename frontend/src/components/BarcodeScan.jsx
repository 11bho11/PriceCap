import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

const API_BASE = 'http://localhost:8000'

function LoadingView() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 20,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(10,10,10,0.92)'
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: '4px solid #333', borderTopColor: 'var(--accent-green)',
        animation: 'spin 0.8s linear infinite'
      }} />
      <p style={{
        color: 'var(--accent-green)', fontFamily: 'var(--font-main)',
        marginTop: 16, letterSpacing: 2, fontSize: 14
      }}>
        LOADING
      </p>
    </div>
  )
}

function SuccessView({ productName }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 20,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(10,10,10,0.95)', padding: '0 24px'
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        border: '4px solid var(--accent-green)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, color: 'var(--accent-green)'
      }}>
        ✓
      </div>
      <p style={{
        color: '#aaa', fontFamily: 'var(--font-main)',
        marginTop: 20, fontSize: 13, letterSpacing: 1
      }}>
        Product scanned
      </p>
      <p style={{
        color: 'var(--accent-green)', fontFamily: 'var(--font-main)',
        marginTop: 10, fontSize: 18, textAlign: 'center', lineHeight: 1.4
      }}>
        {productName}
      </p>
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

function ErrorOverlayPlaceholder({ type, onOk }) {
  const msg = type === 'camera-error'
    ? 'Camera access is required to use PriceCap'
    : 'No internet connection'
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 30,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)'
    }}>
      <div style={{
        background: '#1a1a1a', borderRadius: 12, padding: '32px 24px',
        textAlign: 'center', border: '1px solid #333', maxWidth: 280, width: '90%'
      }}>
        <p style={{ color: 'white', fontFamily: 'var(--font-main)', fontSize: 15, marginBottom: 24, lineHeight: 1.5 }}>
          {msg}
        </p>
        <button
          onClick={onOk}
          style={{
            background: 'var(--accent-green)', color: 'black',
            fontFamily: 'var(--font-main)', fontWeight: 'bold',
            border: 'none', borderRadius: 6, padding: '12px 0',
            fontSize: 14, cursor: 'pointer', width: '100%', letterSpacing: 1
          }}
        >
          OK
        </button>
      </div>
    </div>
  )
}

export default function BarcodeScan({ onAdvance, onScanAgain, onError }) {
  const [scanState, setScanState] = useState('scanning')
  const [foundName, setFoundName] = useState(null)
  const scannerRef = useRef(null)
  const scannedRef = useRef(false)

  useEffect(() => {
    const scanner = new Html5Qrcode('barcode-reader')
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10 },
        handleBarcodeDetected,
        () => {}
      )
      .catch(() => setScanState('camera-error'))

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [])

  async function handleBarcodeDetected(barcode) {
    if (scannedRef.current) return
    scannedRef.current = true

    try { await scannerRef.current.stop() } catch (_) {}
    setScanState('loading')

    try {
      const res = await fetch(`${API_BASE}/product/${barcode}`, { method: 'POST' })
      const data = await res.json()
      if (data.error === 'not_found') {
        setScanState('not-found')
      } else {
        setFoundName(data.name)
        setScanState('success')
        setTimeout(() => onAdvance(barcode, data.name), 1500)
      }
    } catch {
      setScanState(navigator.onLine ? 'not-found' : 'network-error')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-color)' }}>
      {/* Camera feed container — always in DOM so useEffect can target it, hidden when not scanning */}
      <div
        id="barcode-reader"
        style={{
          position: 'fixed', inset: 0, overflow: 'hidden',
          visibility: scanState === 'scanning' ? 'visible' : 'hidden'
        }}
      />

      {/* Scanning UI — header, corner brackets, status pill */}
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

          {/* Corner bracket viewfinder — centered on screen */}
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

          {/* Status pill */}
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
        <ErrorOverlayPlaceholder type={scanState} onOk={onError} />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        #barcode-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
        }
      `}</style>
    </div>
  )
}
