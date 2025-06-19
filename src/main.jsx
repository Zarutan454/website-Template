import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'
import './blockchain-styles.css'
import './translations/i18n'
import { initURLLocalization } from './translations/i18n'

import { WagmiConfig, createConfig, http } from 'wagmi'
import { mainnet, polygon, bsc } from 'wagmi/chains'
import { walletConnect, injected, metaMask, coinbaseWallet } from 'wagmi/connectors'
import { Web3Modal } from '@web3modal/react'

// Initialisiere die URL-Lokalisierung
initURLLocalization()

// Web3Modal-Konfiguration
const projectId = '117c4b32c67be7181995ffa5ff8d481b'
const chains = [mainnet, polygon, bsc]

const wagmiConfig = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
  },
  connectors: [
    walletConnect({ projectId, showQrModal: false }),
    injected(),
    metaMask(),
    coinbaseWallet({ appName: 'BSN' }),
  ],
  autoConnect: true,
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <WagmiConfig config={wagmiConfig}>
          <App />
          <Web3Modal projectId={projectId} wagmiConfig={wagmiConfig} />
        </WagmiConfig>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
