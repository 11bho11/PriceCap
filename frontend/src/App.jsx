import { useEffect, useState } from 'react'
import './index.css'
import LandingPage from './components/LandingPage'
import BarcodeScan from './components/BarcodeScan'
import PriceScan from './components/PriceScan'
import VerdictScreen from './components/VerdictScreen'
import MatrixRain from './components/MatrixRain'

const API_BASE = import.meta.env.VITE_API_URL || ''

function VerdictLoader({ barcode, productName, scannedPrice, onSuccess, onError }) {
  useEffect(() => {
    fetch(`${API_BASE}/verdict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barcode,
        product_name: productName,
        scanned_price: scannedPrice,
      }),
    })
      .then(r => r.json())
      .then(data => onSuccess(data))
      .catch(() => onError())
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg-color)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      <MatrixRain />
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100%'
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid #333', borderTopColor: 'var(--accent-green)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{
          color: 'var(--accent-green)', fontFamily: 'var(--font-main)',
          marginTop: 16, letterSpacing: 3, fontSize: 13
        }}>
          LOADING
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing')
  const [barcode, setBarcode] = useState(null)
  const [productName, setProductName] = useState(null)
  const [scannedPrice, setScannedPrice] = useState(null)
  const [verdictData, setVerdictData] = useState(null)
  const [step1Key, setStep1Key] = useState(0)

  function handleScanAgain() {
    setBarcode(null)
    setProductName(null)
    setScannedPrice(null)
    setVerdictData(null)
    setStep1Key(k => k + 1)
    setCurrentScreen('landing')
  }

  let screen
  switch (currentScreen) {
    case 'landing':
      screen = <LandingPage onScanBarcode={() => setCurrentScreen('step1')} />
      break
    case 'step1':
      screen = (
        <BarcodeScan
          key={step1Key}
          onAdvance={(scannedBarcode, name) => {
            setBarcode(scannedBarcode)
            setProductName(name)
            setCurrentScreen('step2')
          }}
          onScanAgain={() => setStep1Key(k => k + 1)}
          onError={() => setCurrentScreen('landing')}
        />
      )
      break
    case 'step2':
      screen = (
        <PriceScan
          barcode={barcode}
          productName={productName}
          onAdvance={(price) => {
            setScannedPrice(price)
            setCurrentScreen('loading')
          }}
          onBack={() => setCurrentScreen('step1')}
          onError={() => setCurrentScreen('landing')}
        />
      )
      break
    case 'loading':
      screen = (
        <VerdictLoader
          barcode={barcode}
          productName={productName}
          scannedPrice={scannedPrice}
          onSuccess={(data) => {
            setVerdictData(data)
            setCurrentScreen('verdict')
          }}
          onError={() => setCurrentScreen('landing')}
        />
      )
      break
    case 'verdict':
      screen = (
        <VerdictScreen
          verdictData={verdictData}
          onScanAgain={handleScanAgain}
        />
      )
      break
    default:
      screen = <LandingPage onScanBarcode={() => setCurrentScreen('step1')} />
  }

  return screen
}

export default App
