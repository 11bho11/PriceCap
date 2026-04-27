import { useState } from 'react'
import MatrixRain from './MatrixRain'
import VerdictTab from './VerdictTab'

export default function VerdictScreen({ verdictData, onScanAgain }) {
  const [activeTab, setActiveTab] = useState('verdict')

  const tabBtn = (tab, label) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      style={{
        flex: 1, padding: '12px 0', border: 'none', background: 'transparent',
        cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: 13, letterSpacing: 2,
        color: activeTab === tab ? 'var(--accent-green)' : '#555',
        borderBottom: `2px solid ${activeTab === tab ? 'var(--accent-green)' : 'transparent'}`,
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg-color)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <MatrixRain />

      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', height: '100%'
      }}>
        {/* Header + tab bar */}
        <div style={{ background: 'rgba(10,10,10,0.88)', padding: '20px 16px 0', flexShrink: 0 }}>
          <h1 style={{
            color: 'var(--accent-green)', fontFamily: 'var(--font-main)',
            fontSize: 20, letterSpacing: 5, margin: '0 0 16px', textAlign: 'center'
          }}>
            VERDICT
          </h1>
          <div style={{ display: 'flex', borderBottom: '1px solid #1e1e1e' }}>
            {tabBtn('verdict', 'VERDICT')}
            {tabBtn('results', 'RESULTS')}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(10,10,10,0.78)' }}>
          {activeTab === 'verdict' ? (
            <VerdictTab verdictData={verdictData} />
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '200px', color: '#444', fontFamily: 'var(--font-main)', fontSize: 13
            }}>
              — Results tab coming in step 11 —
            </div>
          )}
        </div>

        {/* SCAN AGAIN */}
        <div style={{ background: 'rgba(10,10,10,0.92)', padding: '16px 24px 40px', flexShrink: 0 }}>
          <button
            onClick={onScanAgain}
            style={{
              width: '100%', background: 'var(--accent-green)', color: 'black',
              fontFamily: 'var(--font-main)', fontWeight: 'bold',
              border: 'none', borderRadius: 8, padding: '16px 0',
              fontSize: 14, cursor: 'pointer', letterSpacing: 2
            }}
          >
            SCAN AGAIN
          </button>
        </div>
      </div>
    </div>
  )
}
