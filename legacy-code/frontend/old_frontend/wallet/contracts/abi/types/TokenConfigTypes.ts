export const TokenConfigTypes = [
  {
    inputs: [{ internalType: "address", name: "wallet", type: "address" }],
    name: "setMarketingWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "wallet", type: "address" }],
    name: "setDevWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "wallet", type: "address" }],
    name: "setCharityWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "_buyTax", type: "uint256" },
      { internalType: "uint256", name: "_sellTax", type: "uint256" }
    ],
    name: "setTaxes",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "_marketingShare", type: "uint256" },
      { internalType: "uint256", name: "_charityShare", type: "uint256" },
      { internalType: "uint256", name: "_devShare", type: "uint256" }
    ],
    name: "setTaxShares",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];