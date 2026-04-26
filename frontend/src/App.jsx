import { useState } from 'react'
import './index.css'

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
      screen = <div style={stubStyle}>landing</div>
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
      screen = <div style={stubStyle}>landing</div>
  }

  return screen
}

export default App
