
import { Coins, ShoppingBag, BarChart4, Cpu } from 'lucide-react';
import { TokenTypeOption, NetworkOption } from '../types/unified';

// Netzwerkoptionen
export const NETWORKS: NetworkOption[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    icon: '/images/networks/ethereum.svg',
    isTestnet: false,
    color: '#627EEA',
    currency: 'ETH',
    gasToken: 'ETH',
    chainId: 1,
    symbol: 'ETH'
  },
  {
    id: 'holesky',
    name: 'Holesky Testnet',
    icon: '/images/networks/ethereum.svg',
    isTestnet: true,
    color: '#627EEA',
    currency: 'ETH',
    gasToken: 'ETH',
    chainId: 17000,
    symbol: 'ETH'
  },
  {
    id: 'sepolia',
    name: 'Sepolia Testnet',
    icon: '/images/networks/ethereum.svg',
    isTestnet: true,
    color: '#627EEA',
    currency: 'ETH',
    gasToken: 'ETH',
    chainId: 11155111,
    symbol: 'ETH'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    icon: '/images/networks/polygon.svg',
    isTestnet: false,
    color: '#8247E5',
    currency: 'MATIC',
    gasToken: 'MATIC',
    chainId: 137,
    symbol: 'MATIC'
  }
];

// Token-Typ-Optionen
export const TOKEN_TYPES: TokenTypeOption[] = [
  {
    id: 'standard',
    title: 'Standard ERC-20',
    name: 'Standard Token',
    description: 'Ein einfacher Token mit grundlegenden ERC-20-Funktionen.',
    features: ['Transferable', 'Burnable', 'Mintable'],
    icon: Coins,
    complexity: 'Einfach'
  },
  {
    id: 'business',
    title: 'Business ERC-20',
    name: 'Business Token',
    description: 'Token mit erweiterten Features für Geschäftsanwendungen.',
    features: ['Max Wallet', 'Max Transaction', 'Anti-Bot', 'Timelock'],
    icon: ShoppingBag,
    complexity: 'Mittel'
  },
  {
    id: 'marketing',
    title: 'Marketing ERC-20',
    name: 'Marketing Token',
    description: 'Token mit Marketing- und Steuerfeatures.',
    features: ['Buy/Sell Tax', 'Marketing Wallet', 'Auto Liquidity', 'Rewards'],
    icon: BarChart4,
    complexity: 'Mittel'
  },
  {
    id: 'custom',
    title: 'Custom ERC-20',
    name: 'Custom Token',
    description: 'Vollständig anpassbarer Token mit benutzerdefinierten Funktionen.',
    features: ['Alle Features auswählbar', 'Benutzerdefinierte Logik', 'Erweiterbar'],
    icon: Cpu,
    complexity: 'Komplex'
  }
];
