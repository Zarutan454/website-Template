import { createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { publicProvider } from 'wagmi/providers/public'
import { configureChains } from 'wagmi'

// Configure chains & providers for wagmi
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia],
  [
    // Use public provider
    publicProvider(),
  ]
)

export const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors: [
    new InjectedConnector({ chains }),
  ],
})

// Etherscan API configuration
export const ETHERSCAN_CONFIG = {
  mainnet: {
    apiKey: import.meta.env.VITE_ETHERSCAN_API_KEY || 'EV9V3ZB72G6Z3RPAFDGRKIPFCY53IHNCS8',
    baseUrl: 'https://api.etherscan.io/api',
  },
  sepolia: {
    apiKey: import.meta.env.VITE_ETHERSCAN_API_KEY || 'EV9V3ZB72G6Z3RPAFDGRKIPFCY53IHNCS8',
    baseUrl: 'https://api-sepolia.etherscan.io/api',
  },
}
