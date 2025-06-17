
export const MarketingTokenTypes = [
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "symbol", type: "string" },
      { internalType: "uint256", name: "initialSupply", type: "uint256" },
      { internalType: "address", name: "initialOwner", type: "address" },
      { internalType: "bool", name: "_canMint", type: "bool" },
      { internalType: "bool", name: "_canBurn", type: "bool" },
      { internalType: "address", name: "_marketingWallet", type: "address" },
      { internalType: "uint256", name: "_buyTax", type: "uint256" },
      { internalType: "uint256", name: "_sellTax", type: "uint256" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  }
];
