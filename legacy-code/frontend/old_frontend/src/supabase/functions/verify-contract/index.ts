
// Follow Deno Deploy requirements for Supabase Edge Functions
// This is a workaround for TypeScript errors during local development
// The actual function runs correctly on Supabase

// In Deno environments, this will work fine
// @ts-ignore - We ignore this import error because it's a Deno-specific URL that TypeScript doesn't understand in local dev
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// TypeScript declaration for local development
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

const ETHERSCAN_API_KEY = Deno.env.get('ETHERSCAN_API_KEY') || '';

interface VerificationRequest {
  contractAddress: string;
  network: string;
  constructorArgs: string;
  contractName: string;
  compilerVersion: string;
}

// This will be executed in the Deno runtime
serve(async (req) => {
  try {
    // CORS Headers
    const headers = new Headers({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });

    // Handle OPTIONS request (CORS preflight)
    if (req.method === "OPTIONS") {
      return new Response(null, { headers, status: 204 });
    }

    // Only accept POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { headers, status: 405 }
      );
    }

    // Parse request body
    const body = await req.json() as VerificationRequest;
    const { contractAddress, network, constructorArgs, contractName, compilerVersion } = body;
    
    // Validate necessary data
    if (!contractAddress || !network || !constructorArgs) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required parameters" }),
        { headers, status: 400 }
      );
    }

    // Check if API key is available
    if (!ETHERSCAN_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Etherscan API key not configured" }),
        { headers, status: 500 }
      );
    }

    // Determine API URL based on network
    const apiUrl = getEtherscanApiUrl(network);
    
    // Prepare verification request
    const formData = new FormData();
    formData.append("apikey", ETHERSCAN_API_KEY);
    formData.append("module", "contract");
    formData.append("action", "verifysourcecode");
    formData.append("contractaddress", contractAddress);
    formData.append("sourceCode", TOKEN_SOURCE_CODE);
    formData.append("codeformat", "solidity-single-file");
    formData.append("contractname", contractName || "CustomToken");
    formData.append("compilerversion", compilerVersion || "v0.8.24+commit.e11b9ed9");
    formData.append("optimizationUsed", "1");
    formData.append("runs", "200");
    formData.append("constructorArguements", constructorArgs || "");

    // Send verification request to Etherscan
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    // Parse response
    const data = await response.json();
    
    if (data.status === "1" && data.message === "OK") {
      return new Response(
        JSON.stringify({ success: true, guid: data.result }),
        { headers, status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: data.result || "Contract verification failed",
          details: data
        }),
        { headers, status: 200 }
      );
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred",
        stack: error.stack
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});

// Helper function to get the appropriate Etherscan API URL
function getEtherscanApiUrl(network: string): string {
  switch (network.toLowerCase()) {
    case "ethereum":
    case "mainnet":
      return "https://api.etherscan.io/api";
    case "holesky":
      return "https://api-holesky.etherscan.io/api";
    case "sepolia":
      return "https://api-sepolia.etherscan.io/api";
    case "goerli":
      return "https://api-goerli.etherscan.io/api";
    case "polygon":
      return "https://api.polygonscan.com/api";
    case "bsc":
    case "binance":
      return "https://api.bscscan.com/api";
    default:
      return "https://api.etherscan.io/api";
  }
}

// The source code of the token contract
const TOKEN_SOURCE_CODE = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CustomToken is ERC20, ERC20Burnable, Pausable, Ownable, ReentrancyGuard {
    bool public canMint;
    bool public canBurn;
    uint8 private constant DECIMALS = 18;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address initialOwner,
        bool _canMint,
        bool _canBurn
    ) ERC20(name, symbol) Ownable(initialOwner) {
        _mint(initialOwner, initialSupply);
        canMint = _canMint;
        canBurn = _canBurn;
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(canMint, "Minting is not allowed");
        _mint(to, amount);
    }

    function burn(uint256 amount) public override {
        require(canBurn, "Burning is not allowed");
        super.burn(amount);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override(ERC20)
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}`;
