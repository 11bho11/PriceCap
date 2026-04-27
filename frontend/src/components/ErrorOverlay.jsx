export default function ErrorOverlay({ type, onOk }) {
  const message = type === 'camera-error'
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
        <p style={{
          color: 'white', fontFamily: 'var(--font-main)',
          fontSize: 15, marginBottom: 24, lineHeight: 1.5
        }}>
          {message}
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
