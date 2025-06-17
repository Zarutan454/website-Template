export const StandardTokenTypes = [
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "symbol", type: "string" },
      { internalType: "uint256", name: "initialSupply", type: "uint256" },
      { internalType: "address", name: "initialOwner", type: "address" },
      { internalType: "bool", name: "_canMint", type: "bool" },
      { internalType: "bool", name: "_canBurn", type: "bool" }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  }
];