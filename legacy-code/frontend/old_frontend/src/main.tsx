
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { config } from './lib/wagmi'
import { MotionConfig } from 'framer-motion'
import { WagmiConfig } from 'wagmi'

createRoot(document.getElementById("root")!).render(
  <WagmiConfig config={config}>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MotionConfig>
  </WagmiConfig>
);
