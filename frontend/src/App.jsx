import { useState } from 'react'
import './index.css'
import LandingPage from './components/LandingPage'
import BarcodeScan from './components/BarcodeScan'
import PriceScan from './components/PriceScan'

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing')
  const [barcode, setBarcode] = useState(null)
  const [productName, setProductName] = useState(null)
  const [scannedPrice, setScannedPrice] = useState(null)
  const [verdictData, setVerdictData] = useState(null)
  const [step1Key, setStep1Key] = useState(0)

  const stubStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'var(--font-main)',
    color: 'white',
    fontSize: '24px',
    background: 'var(--bg-color)',
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
      screen = <div style={stubStyle}>loading</div>
      break
    case 'verdict':
      screen = <div style={stubStyle}>verdict</div>
      break
    default:
      screen = <LandingPage onScanBarcode={() => setCurrentScreen('step1')} />
  }

  return screen
}

export default App
