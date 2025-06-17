// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CustomToken is ERC20, ERC20Burnable, Pausable, Ownable, ReentrancyGuard {
    bool public canMint;
    bool public canBurn;

    // Advanced token features
    address public marketingWallet;
    address public charityWallet;
    address public devWallet;
    uint256 public buyTax;
    uint256 public sellTax;
    uint256 public maxTransactionLimit;
    uint256 public maxWalletLimit;
    uint256 public maxSupply;
    uint256 public timelockDuration;
    uint8 private constant DECIMALS = 18;
    
    uint256 public marketingShare = 40;
    uint256 public charityShare = 30;
    uint256 public devShare = 30;

    mapping(address => bool) public blacklist;
    mapping(address => bool) public isExcludedFromLimits;
    mapping(address => bool) public isTaxExempt;
    mapping(address => uint256) private lockedBalances;
    mapping(address => uint256) private lockupExpiry;

    uint256 public buybackThreshold;
    uint256 public lockupTime;

    event TokensLocked(address indexed account, uint256 amount, uint256 releaseTime);
    event TokensUnlocked(address indexed account, uint256 amount);
    event BuybackExecuted(uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address initialOwner,
        bool _canMint,
        bool _canBurn
    ) ERC20(name, symbol) Ownable(initialOwner) {
        _mint(initialOwner, initialSupply);
        transferOwnership(initialOwner);
        canMint = _canMint;
        canBurn = _canBurn;
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(canMint, "Minting is not allowed");
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }

    function burn(uint256 amount) public override {
        require(canBurn, "Burning is not allowed");
        super.burn(amount);
    }

    function setMarketingWallet(address wallet) external onlyOwner {
        require(wallet != address(0), "Cannot set zero address");
        marketingWallet = wallet;
    }

    function setCharityWallet(address wallet) external onlyOwner {
        require(wallet != address(0), "Cannot set zero address");
        charityWallet = wallet;
    }

    function setDevWallet(address wallet) external onlyOwner {
        require(wallet != address(0), "Cannot set zero address");
        devWallet = wallet;
    }

    function setTaxes(uint256 _buyTax, uint256 _sellTax) external onlyOwner {
        buyTax = _buyTax;
        sellTax = _sellTax;
    }

    function setTaxShares(uint256 _marketingShare, uint256 _charityShare, uint256 _devShare) external onlyOwner {
        require(_marketingShare + _charityShare + _devShare == 100, "Shares must add up to 100%");
        marketingShare = _marketingShare;
        charityShare = _charityShare;
        devShare = _devShare;
    }

    function setTransactionLimits(uint256 _maxTransactionLimit, uint256 _maxWalletLimit) external onlyOwner {
        maxTransactionLimit = _maxTransactionLimit;
        maxWalletLimit = _maxWalletLimit;
    }

    function addToBlacklist(address account) external onlyOwner {
        require(account != address(0), "Cannot blacklist the zero address");
        blacklist[account] = true;
    }

    function removeFromBlacklist(address account) external onlyOwner {
        require(account != address(0), "Cannot remove the zero address");
        blacklist[account] = false;
    }

    function excludeFromLimits(address account, bool excluded) external onlyOwner {
        isExcludedFromLimits[account] = excluded;
    }

    function setTaxExempt(address account, bool exempt) external onlyOwner {
        isTaxExempt[account] = exempt;
    }

    function lockTokens(address account, uint256 amount) external onlyOwner {
        require(balanceOf(account) >= amount, "Insufficient balance");
        lockedBalances[account] += amount;
        lockupExpiry[account] = block.timestamp + lockupTime;
        emit TokensLocked(account, amount, lockupExpiry[account]);
    }

    function releaseLockedTokens(address account) external nonReentrant {
        require(block.timestamp >= lockupExpiry[account], "Tokens are still locked");
        uint256 amount = lockedBalances[account];
        lockedBalances[account] = 0;
        emit TokensUnlocked(account, amount);
    }

    function buybackAndBurn() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance >= buybackThreshold, "Insufficient funds for buyback");
        // Implement buyback logic here
        emit BuybackExecuted(balance);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal view override(ERC20, Pausable) {
        super._beforeTokenTransfer(from, to, amount);
        require(!blacklist[from] && !blacklist[to], "Blacklisted address");
        if (!isExcludedFromLimits[from] && !isExcludedFromLimits[to]) {
            require(amount <= maxTransactionLimit, "Transfer exceeds maxTransactionLimit");
            require(balanceOf(to) + amount <= maxWalletLimit, "Recipient balance exceeds maxWalletLimit");
        }
    }
}