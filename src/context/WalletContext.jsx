import React, { createContext } from 'react';

// Die alte Wallet-Logik ist deaktiviert, da Web3Modal/wagmi verwendet wird.
const WalletContext = createContext();

export const WalletProvider = ({ children }) => (
  <WalletContext.Provider value={{}}>
    {children}
  </WalletContext.Provider>
);

export const useWallet = () => React.useContext(WalletContext); 