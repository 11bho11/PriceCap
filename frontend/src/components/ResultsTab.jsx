export default function ResultsTab({ verdictData }) {
  if (!verdictData || verdictData.error === 'no_price_data') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 32px' }}>
        <div style={{
          background: '#1a1a1a', border: '1px solid #333',
          borderRadius: 12, padding: '32px 40px', textAlign: 'center'
        }}>
          <p style={{ color: '#999', fontFamily: 'var(--font-main)', fontSize: 14, margin: 0 }}>
            No price data found
          </p>
        </div>
      </div>
    )
  }

  const { retailer_prices = [], scanned_price } = verdictData
  const prices = retailer_prices.map(r => r.price).filter(p => p != null)
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 0
  const range = maxPrice - minPrice || 1
  const markerPct = Math.max(0, Math.min(100, ((scanned_price - minPrice) / range) * 100))

  return (
    <div style={{ padding: '24px 20px' }}>
      {/* Price range meter — above the table, only shown with 2+ retailers */}
      {prices.length >= 2 && (
        <div style={{
          padding: '20px 16px 24px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid #222',
          borderRadius: 10,
          marginBottom: 28
        }}>
          <p style={{
            color: '#ccc', fontFamily: 'var(--font-main)',
            fontSize: 11, letterSpacing: 2, marginBottom: 24, textAlign: 'center'
          }}>
            PRICE RANGE
          </p>

          {/* Marker label + bar */}
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <div style={{
              position: 'absolute',
              left: `${markerPct}%`,
              transform: 'translateX(-50%)',
              bottom: 'calc(100% + 8px)',
              whiteSpace: 'nowrap'
            }}>
              <span style={{
                color: 'white', fontFamily: 'var(--font-main)', fontSize: 12,
                background: 'rgba(255,255,255,0.18)',
                padding: '3px 8px', borderRadius: 4
              }}>
                £{scanned_price?.toFixed(2)}
              </span>
            </div>

            {/* Gradient bar */}
            <div style={{
              height: 12, borderRadius: 6,
              background: 'linear-gradient(to right, #00FF41, #FFA500, #FF3333)',
              position: 'relative'
            }}>
              {/* Scanned price marker line */}
              <div style={{
                position: 'absolute',
                left: `${markerPct}%`,
                top: -5, bottom: -5,
                width: 3,
                background: 'white',
                borderRadius: 2,
                transform: 'translateX(-50%)',
                boxShadow: '0 0 6px rgba(255,255,255,0.8)'
              }} />
            </div>
          </div>

          {/* Min / Max labels — clearly visible */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{
              color: '#00FF41', fontFamily: 'var(--font-main)',
              fontSize: 13, fontWeight: 'bold'
            }}>
              £{minPrice.toFixed(2)}
            </span>
            <span style={{
              color: '#FF3333', fontFamily: 'var(--font-main)',
              fontSize: 13, fontWeight: 'bold'
            }}>
              £{maxPrice.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Retailer price table */}
      <div>
        {/* You paid — highlighted top row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', borderRadius: 8, marginBottom: 4,
          background: 'rgba(0,255,65,0.08)', border: '1px solid rgba(0,255,65,0.2)'
        }}>
          <span style={{
            color: 'var(--accent-green)', fontFamily: 'var(--font-main)',
            fontSize: 13, letterSpacing: 1
          }}>
            You paid
          </span>
          <span style={{
            color: 'var(--accent-green)', fontFamily: 'var(--font-main)',
            fontSize: 15, fontWeight: 'bold'
          }}>
            £{scanned_price?.toFixed(2)}
          </span>
        </div>

        {/* Retailer rows */}
        {retailer_prices.map((r, i) => (
          <div
            key={i}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '11px 16px',
              borderBottom: i < retailer_prices.length - 1 ? '1px solid #1a1a1a' : 'none'
            }}
          >
            <span style={{ color: '#aaa', fontFamily: 'var(--font-main)', fontSize: 13 }}>
              {r.name}
            </span>
            <span style={{
              color: r.price < scanned_price ? 'var(--accent-green)' : '#fff',
              fontFamily: 'var(--font-main)', fontSize: 14
            }}>
              £{r.price?.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
