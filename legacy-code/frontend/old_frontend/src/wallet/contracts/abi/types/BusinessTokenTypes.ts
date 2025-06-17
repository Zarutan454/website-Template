
export const BusinessTokenTypes = [
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "symbol", type: "string" },
      { internalType: "uint256", name: "initialSupply", type: "uint256" },
      { internalType: "address", name: "initialOwner", type: "address" },
      { internalType: "bool", name: "_canMint", type: "bool" },
      { internalType: "bool", name: "_canBurn", type: "bool" },
      { internalType: "uint256", name: "_maxTransactionLimit", type: "uint256" },
      { internalType: "uint256", name: "_maxWalletLimit", type: "uint256" },
      { internalType: "uint256", name: "_maxSupply", type: "uint256" },
      { internalType: "uint256", name: "_lockupTime", type: "uint256" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  }
];
