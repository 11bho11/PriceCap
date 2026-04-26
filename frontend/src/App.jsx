import { useState } from 'react'
import './index.css'
import LandingPage from './components/LandingPage'

function App() {
  const [currentScreen, setCurrentScreen] = useState('landing')
  const [barcode, setBarcode] = useState(null)
  const [productName, setProductName] = useState(null)
  const [scannedPrice, setScannedPrice] = useState(null)
  const [verdictData, setVerdictData] = useState(null)

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
      screen = <div style={stubStyle}>step1</div>
      break
    case 'step2':
      screen = <div style={stubStyle}>step2</div>
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
