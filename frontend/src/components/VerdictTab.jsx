import { useEffect, useState } from 'react'

function ShieldBadge() {
  return (
    <svg width="110" height="128" viewBox="0 0 72 84" fill="none">
      <path
        d="M36 4L68 16V46C68 64 54 78 36 84C18 78 4 64 4 46V16L36 4Z"
        fill="rgba(0,255,65,0.1)"
        stroke="#00FF41"
        strokeWidth="2"
      />
      <path
        d="M36 16L58 24V44C58 58 47 68 36 72C25 68 14 58 14 44V24L36 16Z"
        fill="rgba(0,255,65,0.07)"
      />
      <text x="36" y="52" textAnchor="middle" fill="#00FF41" fontSize="26" fontFamily="Share Tech Mono, monospace">✓</text>
    </svg>
  )
}

function TriangleBadge() {
  return (
    <svg width="128" height="114" viewBox="0 0 72 64" fill="none">
      <path
        d="M36 4L68 58H4L36 4Z"
        fill="rgba(255,165,0,0.12)"
        stroke="#FFA500"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="33" y="22" width="6" height="18" rx="2" fill="#FFA500" />
      <rect x="33" y="44" width="6" height="6" rx="2" fill="#FFA500" />
    </svg>
  )
}

function BellBadge() {
  return (
    <svg width="110" height="128" viewBox="0 0 64 70" fill="none">
      <path
        d="M32 6C22 6 14 13 13 22L10 42L5 49H59L54 42L51 22C50 13 42 6 32 6Z"
        fill="rgba(255,51,51,0.12)"
        stroke="#FF3333"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M25 49C25 54 28 57 32 57C36 57 39 54 39 49"
        fill="none"
        stroke="#FF3333"
        strokeWidth="2"
      />
      <line x1="10" y1="14" x2="16" y2="20" stroke="#FF3333" strokeWidth="2" strokeLinecap="round" />
      <line x1="54" y1="14" x2="48" y2="20" stroke="#FF3333" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function VerdictTab({ verdictData }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  if (!verdictData || verdictData.error === 'no_price_data') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 32px'
      }}>
        <div style={{
          background: '#1a1a1a', border: '1px solid #333',
          borderRadius: 12, padding: '32px 40px', textAlign: 'center'
        }}>
          <p style={{ color: '#999', fontFamily: 'var(--font-main)', fontSize: 14, margin: '0 0 8px' }}>
            No price data found
          </p>
          <p style={{ color: '#555', fontFamily: 'var(--font-main)', fontSize: 12, margin: 0 }}>
            No UK retailers found for this product
          </p>
        </div>
      </div>
    )
  }

  const { verdict, suggestions = [], average_price, scanned_price } = verdictData

  let badge, badgeColor, badgeLabel, subMessage

  if (verdict === 'FAIR') {
    badge = <ShieldBadge />
    badgeColor = 'var(--color-fair)'
    badgeLabel = 'FAIR'
    subMessage = "You're getting a good deal!"
  } else if (verdict === 'ABOVE_MARKET') {
    badge = <TriangleBadge />
    badgeColor = 'var(--color-above-market)'
    badgeLabel = 'ABOVE MARKET'
    subMessage = null
  } else {
    badge = <BellBadge />
    badgeColor = 'var(--color-overpriced)'
    badgeLabel = 'OVERPRICED'
    subMessage = null
  }

  return (
    <div style={{ padding: '36px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        animation: mounted ? 'badgePop 0.38s cubic-bezier(0.175,0.885,0.32,1.275) both' : 'none',
        marginBottom: 8
      }}>
        {badge}
        <p style={{
          color: badgeColor,
          fontFamily: 'var(--font-main)',
          fontSize: 20, fontWeight: 'bold', letterSpacing: 3,
          margin: '10px 0 0'
        }}>
          {badgeLabel}
        </p>
        {subMessage && (
          <p style={{
            color: '#aaa', fontFamily: 'var(--font-main)',
            fontSize: 13, margin: '6px 0 0', textAlign: 'center'
          }}>
            {subMessage}
          </p>
        )}
      </div>

      {average_price != null && (
        <div style={{
          display: 'flex', gap: 12, margin: '20px 0 28px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid #2a2a2a', borderRadius: 10,
          padding: '14px 24px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#555', fontFamily: 'var(--font-main)', fontSize: 10, letterSpacing: 1, margin: '0 0 4px' }}>
              YOU PAID
            </p>
            <p style={{ color: badgeColor, fontFamily: 'var(--font-main)', fontSize: 22, fontWeight: 'bold', margin: 0 }}>
              £{scanned_price?.toFixed(2)}
            </p>
          </div>
          <div style={{ width: 1, background: '#2a2a2a', alignSelf: 'stretch' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#555', fontFamily: 'var(--font-main)', fontSize: 10, letterSpacing: 1, margin: '0 0 4px' }}>
              UK AVERAGE
            </p>
            <p style={{ color: '#aaa', fontFamily: 'var(--font-main)', fontSize: 22, fontWeight: 'bold', margin: 0 }}>
              £{average_price.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {verdict === 'FAIR' && (
        <div style={{ width: '100%', alignSelf: 'flex-start' }}>
          <div style={{
            background: 'var(--bubble-bg)',
            borderRadius: '4px 16px 16px 16px',
            padding: '12px 16px',
            maxWidth: '80%'
          }}>
            <p style={{
              color: '#ddd', fontFamily: 'var(--font-main)',
              fontSize: 13, margin: 0, lineHeight: 1.55
            }}>
              Nicely played. That&apos;s already one of the better prices out there.
            </p>
          </div>
        </div>
      )}

      {suggestions.length > 0 && verdict !== 'FAIR' && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, alignSelf: 'flex-start' }}>
          {suggestions.slice(0, 2).map((s, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bubble-bg)',
                borderRadius: '4px 16px 16px 16px',
                padding: '12px 16px',
                maxWidth: '80%'
              }}
            >
              <p style={{
                color: '#ddd', fontFamily: 'var(--font-main)',
                fontSize: 13, margin: 0, lineHeight: 1.55
              }}>
                {s}
              </p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes badgePop {
          0%   { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
