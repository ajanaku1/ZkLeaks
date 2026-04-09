import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import WalletProviderWrapper from './wallet/WalletProvider'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <WalletProviderWrapper>
        <App />
      </WalletProviderWrapper>
    </BrowserRouter>
  </StrictMode>,
)
