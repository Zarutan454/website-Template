import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import HomePage from './pages/HomePage.jsx'
import FaucetPage from './pages/FaucetPage.jsx'
import ReferralPage from './pages/ReferralPage.jsx'
import TokenReservationPage from './pages/TokenReservationPage.jsx'
import './index.css'
import './blockchain-styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/faucet" element={<FaucetPage />} />
        <Route path="/referral" element={<ReferralPage />} />
        <Route path="/token-reservation" element={<TokenReservationPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
