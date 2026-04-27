import { useEffect, useRef, useState } from 'react'

const API_BASE = ''

function ManualEntry({ value, onChange, error, onSubmit }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        border: '1px solid rgba(0,255,65,0.4)', borderRadius: 8,
        marginBottom: 12, overflow: 'hidden',
        background: 'rgba(0,0,0,0.3)'
      }}>
        <span style={{
          padding: '14px 12px',
          color: 'var(--accent-green)', fontFamily: 'var(--font-main)',
          fontSize: 22, background: 'rgba(0,255,65,0.05)',
          borderRight: '1px solid rgba(0,255,65,0.2)'
        }}>
          £
        </span>
        <input
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          onChange={e => onChange(e.target.value)}
          autoFocus
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'white', fontFamily: 'var(--font-main)', fontSize: 22,
            padding: '14px 12px'
          }}
        />
      </div>
      {error && (
        <p style={{
          color: '#ff4444', fontFamily: 'var(--font-main)',
          fontSize: 12, marginBottom: 12, textAlign: 'center'
        }}>
          {error}
        </p>
      )}
      <button
        onClick={onSubmit}
        style={{
          width: '100%', background: 'var(--accent-green)', color: 'black',
          fontFamily: 'var(--font-main)', fontWeight: 'bold',
          border: 'none', borderRadius: 8, padding: '14px 0',
          fontSize: 14, cursor: 'pointer', letterSpacing: 1
        }}
      >
        CONFIRM PRICE
      </button>
    </div>
  )
}

export default function PriceScan({ barcode, productName, onAdvance, onBack, onError }) {
  const [phase, setPhase] = useState('scanning')
  const [detectedPrice, setDetectedPrice] = useState(null)
  const [manualInput, setManualInput] = useState('')
  const [manualError, setManualError] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const capturedRef = useRef(false)
  const captureTimerRef = useRef(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
      clearTimeout(captureTimerRef.current)
    }
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      captureTimerRef.current = setTimeout(captureAndSend, 4000)
    } catch {
      onError()
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  async function captureAndSend() {
    if (capturedRef.current) return
    capturedRef.current = true
    clearTimeout(captureTimerRef.current)
    setPhase('loading')

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0)

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9))

    const formData = new FormData()
    formData.append('file', blob, 'price.jpg')

    try {
      const res = await fetch(`${API_BASE}/ocr`, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.price !== undefined) {
        setDetectedPrice(data.price)
        setPhase('confirm')
      } else {
        setPhase('failed')
      }
    } catch {
      setPhase('failed')
    }
  }

  function handleConfirm() {
    stopCamera()
    onAdvance(detectedPrice)
  }

  function handleReject() {
    setPhase('manual')
  }

  function handleManualSubmit() {
    const price = parseFloat(manualInput)
    if (isNaN(price) || price <= 0) {
      setManualError('Please enter a valid price')
      return
    }
    stopCamera()
    onAdvance(price)
  }

  function handleScanNow() {
    clearTimeout(captureTimerRef.current)
    captureAndSend()
  }

  function openManual() {
    clearTimeout(captureTimerRef.current)
    capturedRef.current = true
    setPhase('manual')
  }

  function handleBack() {
    stopCamera()
    clearTimeout(captureTimerRef.current)
    onBack()
  }

  const cameraVisible = ['scanning', 'loading', 'confirm'].includes(phase)

  const headerStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10,
    padding: '20px 16px 20px 60px',
    fontFamily: 'var(--font-main)', color: 'var(--accent-green)',
    fontSize: 13, letterSpacing: 2,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)'
  }

  const overlayCardStyle = {
    background: 'rgba(10,10,10,0.90)',
    border: '1px solid rgba(0,255,65,0.25)',
    borderRadius: 16, padding: '32px 28px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    backdropFilter: 'blur(8px)', width: '100%', maxWidth: 320,
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-color)' }}>
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'fixed', inset: 0,
          width: '100vw', height: '100vh',
          objectFit: 'cover',
          visibility: cameraVisible ? 'visible' : 'hidden'
        }}
      />

      {/* Back arrow — always visible */}
      <button
        onClick={handleBack}
        style={{
          position: 'fixed', top: 18, left: 16, zIndex: 30,
          background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8, padding: '8px 14px',
          color: 'white', fontFamily: 'var(--font-main)', fontSize: 18,
          cursor: 'pointer', lineHeight: 1
        }}
      >
        ←
      </button>

      {/* SCANNING phase */}
      {phase === 'scanning' && (
        <>
          <div style={headerStyle}>STEP 2 OF 2 — SCAN PRICE</div>

          {/* Viewfinder */}
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -65%)',
            width: 260, height: 90, zIndex: 10, pointerEvents: 'none'
          }}>
            {[
              { top: 0, left: 0, borderTop: '3px solid #00FF41', borderLeft: '3px solid #00FF41' },
              { top: 0, right: 0, borderTop: '3px solid #00FF41', borderRight: '3px solid #00FF41' },
              { bottom: 0, left: 0, borderBottom: '3px solid #00FF41', borderLeft: '3px solid #00FF41' },
              { bottom: 0, right: 0, borderBottom: '3px solid #00FF41', borderRight: '3px solid #00FF41' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...s }} />
            ))}
          </div>

          <div style={{
            position: 'fixed', bottom: 160, left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.6)', border: '1px solid #333',
            borderRadius: 20, padding: '8px 20px', zIndex: 10,
            fontFamily: 'var(--font-main)', color: 'white', fontSize: 13,
            whiteSpace: 'nowrap'
          }}>
            Point at the price label...
          </div>

          <button
            onClick={handleScanNow}
            style={{
              position: 'fixed', bottom: 90, left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--accent-green)', color: 'black',
              fontFamily: 'var(--font-main)', fontWeight: 'bold',
              border: 'none', borderRadius: 8, padding: '14px 48px',
              fontSize: 14, cursor: 'pointer', letterSpacing: 1, zIndex: 10
            }}
          >
            SCAN NOW
          </button>

          <button
            onClick={openManual}
            style={{
              position: 'fixed', bottom: 36, left: '50%',
              transform: 'translateX(-50%)',
              background: 'transparent', color: '#999',
              fontFamily: 'var(--font-main)',
              border: '1px solid #444', borderRadius: 8, padding: '10px 32px',
              fontSize: 13, cursor: 'pointer', zIndex: 10, whiteSpace: 'nowrap'
            }}
          >
            Enter price manually
          </button>
        </>
      )}

      {/* LOADING phase */}
      {phase === 'loading' && (
        <>
          <div style={headerStyle}>STEP 2 OF 2 — SCAN PRICE</div>
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
        </>
      )}

      {/* CONFIRM phase */}
      {phase === 'confirm' && (
        <>
          <div style={headerStyle}>STEP 2 OF 2 — SCAN PRICE</div>
          <div style={{
            position: 'fixed', inset: 0, zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 32px',
          }}>
            <div style={overlayCardStyle}>
              <p style={{
                color: '#999', fontFamily: 'var(--font-main)',
                fontSize: 12, letterSpacing: 1, margin: '0 0 10px'
              }}>
                Price detected
              </p>
              <p style={{
                color: 'var(--accent-green)', fontFamily: 'var(--font-main)',
                fontSize: 40, margin: '0 0 8px'
              }}>
                £{detectedPrice?.toFixed(2)}
              </p>
              <p style={{
                color: '#555', fontFamily: 'var(--font-main)',
                fontSize: 12, margin: '0 0 24px'
              }}>
                Is this correct?
              </p>
              <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                <button
                  onClick={handleReject}
                  style={{
                    flex: 1, background: 'transparent',
                    border: '1px solid #555', borderRadius: 8,
                    color: '#ccc', fontFamily: 'var(--font-main)',
                    fontSize: 22, padding: '12px 0', cursor: 'pointer'
                  }}
                >
                  ✗
                </button>
                <button
                  onClick={handleConfirm}
                  style={{
                    flex: 1, background: 'var(--accent-green)',
                    border: 'none', borderRadius: 8,
                    color: 'black', fontFamily: 'var(--font-main)',
                    fontSize: 22, fontWeight: 'bold', padding: '12px 0', cursor: 'pointer'
                  }}
                >
                  ✓
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* FAILED phase */}
      {phase === 'failed' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(10,10,10,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 32px',
        }}>
          <div style={{ ...overlayCardStyle, border: '1px solid #333' }}>
            <p style={{
              color: 'white', fontFamily: 'var(--font-main)',
              fontSize: 16, margin: '0 0 8px'
            }}>
              Couldn't read price
            </p>
            <p style={{
              color: '#555', fontFamily: 'var(--font-main)',
              fontSize: 12, margin: '0 0 24px', textAlign: 'center', lineHeight: 1.6
            }}>
              The image wasn't clear enough. Enter the price below.
            </p>
            <ManualEntry
              value={manualInput}
              onChange={v => { setManualInput(v); setManualError('') }}
              error={manualError}
              onSubmit={handleManualSubmit}
            />
          </div>
        </div>
      )}

      {/* MANUAL phase */}
      {phase === 'manual' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(10,10,10,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 32px',
        }}>
          <div style={{ ...overlayCardStyle, border: '1px solid rgba(0,255,65,0.2)' }}>
            <p style={{
              color: 'white', fontFamily: 'var(--font-main)',
              fontSize: 16, margin: '0 0 24px'
            }}>
              Enter price manually
            </p>
            <ManualEntry
              value={manualInput}
              onChange={v => { setManualInput(v); setManualError('') }}
              error={manualError}
              onSubmit={handleManualSubmit}
            />
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
