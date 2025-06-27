
export const ErrorTypes = [
  {
    inputs: [{ internalType: "address", name: "spender", type: "address" }],
    name: "InsufficientAllowance",
    type: "error"
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "InsufficientBalance",
    type: "error"
  },
  {
    inputs: [],
    name: "MaxSupplyExceeded",
    type: "error"
  },
  {
    inputs: [],
    name: "NotAuthorized",
    type: "error"
  },
  {
    inputs: [],
    name: "PauseFeatureDisabled",
    type: "error"
  },
  {
    inputs: [],
    name: "MintFeatureDisabled",
    type: "error"
  },
  {
    inputs: [],
    name: "BurnFeatureDisabled",
    type: "error"
  },
  {
    inputs: [],
    name: "ContractPaused",
    type: "error"
  }
];
