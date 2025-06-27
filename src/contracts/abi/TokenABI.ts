
// Export the ABI for each token type

// Standard ERC-20 Token ABI
export const StandardTokenABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "symbol", "type": "string" },
      { "internalType": "uint256", "name": "initialSupply", "type": "uint256" },
      { "internalType": "address", "name": "initialOwner", "type": "address" },
      { "internalType": "bool", "name": "_canMint", "type": "bool" },
      { "internalType": "bool", "name": "_canBurn", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  // Common ERC-20 functions
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Marketing Token ABI (extends Standard with tax features)
export const MarketingTokenABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "symbol", "type": "string" },
      { "internalType": "uint256", "name": "initialSupply", "type": "uint256" },
      { "internalType": "address", "name": "initialOwner", "type": "address" },
      { "internalType": "bool", "name": "_canMint", "type": "bool" },
      { "internalType": "bool", "name": "_canBurn", "type": "bool" },
      { "internalType": "address", "name": "_marketingWallet", "type": "address" },
      { "internalType": "uint16", "name": "_buyTax", "type": "uint16" },
      { "internalType": "uint16", "name": "_sellTax", "type": "uint16" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  // Include all standard functions plus tax-specific ones
  {
    "inputs": [],
    "name": "buyTax",
    "outputs": [{ "internalType": "uint16", "name": "", "type": "uint16" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sellTax",
    "outputs": [{ "internalType": "uint16", "name": "", "type": "uint16" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "marketingWallet",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Business Token ABI (extends Standard with limit features)
export const BusinessTokenABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "symbol", "type": "string" },
      { "internalType": "uint256", "name": "initialSupply", "type": "uint256" },
      { "internalType": "address", "name": "initialOwner", "type": "address" },
      { "internalType": "bool", "name": "_canMint", "type": "bool" },
      { "internalType": "bool", "name": "_canBurn", "type": "bool" },
      { "internalType": "uint256", "name": "_maxTransactionAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "_maxWalletAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "_maxSupply", "type": "uint256" },
      { "internalType": "uint256", "name": "_lockupTime", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  // Include all standard functions plus business-specific ones
  {
    "inputs": [],
    "name": "maxTransactionAmount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxWalletAmount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Custom Token ABI (placeholder for when we add a fully customizable token option)
export const CustomTokenABI = StandardTokenABI;
