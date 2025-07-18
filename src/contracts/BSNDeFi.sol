// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title BSN DeFi Protocol
 * @dev BSN Social Network DeFi with Lending, Borrowing and Yield Farming
 */
contract BSNDeFi is Pausable, Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Token Configuration
    IERC20 public bsnToken;
    uint256 public constant LIQUIDATION_THRESHOLD = 80; // 80% collateralization ratio
    uint256 public constant LIQUIDATION_PENALTY = 10; // 10% penalty
    uint256 public constant MINIMUM_COLLATERAL_RATIO = 150; // 150% minimum
    uint256 public constant MAXIMUM_COLLATERAL_RATIO = 200; // 200% maximum

    // Interest Rates (per year, in basis points)
    uint256 public lendingRate = 500; // 5% APY
    uint256 public borrowingRate = 800; // 8% APY
    uint256 public farmingRate = 1200; // 12% APY

    // User Positions
    struct UserPosition {
        uint256 depositedAmount;
        uint256 borrowedAmount;
        uint256 farmingAmount;
        uint256 lastUpdateTime;
        uint256 accumulatedInterest;
        uint256 farmingRewards;
    }

    // Pool State
    struct PoolState {
        uint256 totalDeposited;
        uint256 totalBorrowed;
        uint256 totalFarming;
        uint256 totalReserves;
        uint256 lastUpdateTime;
        uint256 utilizationRate;
    }

    // State Variables
    mapping(address => UserPosition) public userPositions;
    PoolState public poolState;
    mapping(address => bool) public authorizedTokens;
    mapping(address => uint256) public tokenPrices; // Price in USD (8 decimals)

    // Events
    event Deposited(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 timestamp);
    event Borrowed(address indexed user, uint256 amount, uint256 timestamp);
    event Repaid(address indexed user, uint256 amount, uint256 timestamp);
    event Liquidated(address indexed user, address indexed liquidator, uint256 amount, uint256 timestamp);
    event FarmingStarted(address indexed user, uint256 amount, uint256 timestamp);
    event FarmingStopped(address indexed user, uint256 amount, uint256 timestamp);
    event InterestAccrued(address indexed user, uint256 amount, uint256 timestamp);
    event FarmingRewardsClaimed(address indexed user, uint256 amount, uint256 timestamp);

    constructor(address _bsnToken) Ownable(msg.sender) {
        bsnToken = IERC20(_bsnToken);
        poolState.lastUpdateTime = block.timestamp;
    }

    /**
     * @dev Deposit BSN tokens for lending
     */
    function deposit(uint256 amount) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(bsnToken.balanceOf(msg.sender) >= amount, "Insufficient balance");

        // Update user position
        UserPosition storage position = userPositions[msg.sender];
        _accrueInterest(msg.sender);
        
        position.depositedAmount = position.depositedAmount.add(amount);
        position.lastUpdateTime = block.timestamp;

        // Update pool state
        poolState.totalDeposited = poolState.totalDeposited.add(amount);
        poolState.totalReserves = poolState.totalReserves.add(amount);
        _updateUtilizationRate();

        // Transfer tokens to contract
        bsnToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Deposited(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Withdraw deposited BSN tokens
     */
    function withdraw(uint256 amount) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        UserPosition storage position = userPositions[msg.sender];
        require(position.depositedAmount >= amount, "Insufficient deposited amount");

        _accrueInterest(msg.sender);
        
        position.depositedAmount = position.depositedAmount.sub(amount);
        position.lastUpdateTime = block.timestamp;

        // Update pool state
        poolState.totalDeposited = poolState.totalDeposited.sub(amount);
        poolState.totalReserves = poolState.totalReserves.sub(amount);
        _updateUtilizationRate();

        // Transfer tokens to user
        bsnToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Borrow BSN tokens
     */
    function borrow(uint256 amount) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(poolState.totalReserves >= amount, "Insufficient liquidity");

        UserPosition storage position = userPositions[msg.sender];
        _accrueInterest(msg.sender);

        // Check collateral ratio
        uint256 collateralRatio = _calculateCollateralRatio(msg.sender);
        require(collateralRatio >= MINIMUM_COLLATERAL_RATIO, "Insufficient collateral ratio");

        position.borrowedAmount = position.borrowedAmount.add(amount);
        position.lastUpdateTime = block.timestamp;

        // Update pool state
        poolState.totalBorrowed = poolState.totalBorrowed.add(amount);
        poolState.totalReserves = poolState.totalReserves.sub(amount);
        _updateUtilizationRate();

        // Transfer tokens to user
        bsnToken.safeTransfer(msg.sender, amount);

        emit Borrowed(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Repay borrowed BSN tokens
     */
    function repay(uint256 amount) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(bsnToken.balanceOf(msg.sender) >= amount, "Insufficient balance");

        UserPosition storage position = userPositions[msg.sender];
        require(position.borrowedAmount >= amount, "Amount exceeds borrowed amount");

        _accrueInterest(msg.sender);

        position.borrowedAmount = position.borrowedAmount.sub(amount);
        position.lastUpdateTime = block.timestamp;

        // Update pool state
        poolState.totalBorrowed = poolState.totalBorrowed.sub(amount);
        poolState.totalReserves = poolState.totalReserves.add(amount);
        _updateUtilizationRate();

        // Transfer tokens from user
        bsnToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Repaid(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Start yield farming
     */
    function startFarming(uint256 amount) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(bsnToken.balanceOf(msg.sender) >= amount, "Insufficient balance");

        UserPosition storage position = userPositions[msg.sender];
        _accrueFarmingRewards(msg.sender);

        position.farmingAmount = position.farmingAmount.add(amount);
        position.lastUpdateTime = block.timestamp;

        // Update pool state
        poolState.totalFarming = poolState.totalFarming.add(amount);

        // Transfer tokens to contract
        bsnToken.safeTransferFrom(msg.sender, address(this), amount);

        emit FarmingStarted(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Stop yield farming
     */
    function stopFarming(uint256 amount) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");

        UserPosition storage position = userPositions[msg.sender];
        require(position.farmingAmount >= amount, "Insufficient farming amount");

        _accrueFarmingRewards(msg.sender);

        position.farmingAmount = position.farmingAmount.sub(amount);
        position.lastUpdateTime = block.timestamp;

        // Update pool state
        poolState.totalFarming = poolState.totalFarming.sub(amount);

        // Transfer tokens to user
        bsnToken.safeTransfer(msg.sender, amount);

        emit FarmingStopped(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Claim farming rewards
     */
    function claimFarmingRewards() external whenNotPaused nonReentrant {
        UserPosition storage position = userPositions[msg.sender];
        _accrueFarmingRewards(msg.sender);

        uint256 rewards = position.farmingRewards;
        require(rewards > 0, "No rewards to claim");

        position.farmingRewards = 0;

        // Mint rewards to user
        bsnToken.safeTransfer(msg.sender, rewards);

        emit FarmingRewardsClaimed(msg.sender, rewards, block.timestamp);
    }

    /**
     * @dev Liquidate undercollateralized position
     */
    function liquidate(address user) external whenNotPaused nonReentrant {
        UserPosition storage position = userPositions[user];
        require(position.borrowedAmount > 0, "No debt to liquidate");

        uint256 collateralRatio = _calculateCollateralRatio(user);
        require(collateralRatio < LIQUIDATION_THRESHOLD, "Position not liquidatable");

        uint256 borrowedAmount = position.borrowedAmount;
        uint256 liquidationAmount = borrowedAmount.mul(LIQUIDATION_PENALTY).div(100);
        uint256 totalLiquidationAmount = borrowedAmount.add(liquidationAmount);

        // Check if liquidator has enough tokens
        require(bsnToken.balanceOf(msg.sender) >= totalLiquidationAmount, "Insufficient balance");

        // Transfer liquidation amount from liquidator
        bsnToken.safeTransferFrom(msg.sender, address(this), totalLiquidationAmount);

        // Clear user's debt
        position.borrowedAmount = 0;
        position.lastUpdateTime = block.timestamp;

        // Update pool state
        poolState.totalBorrowed = poolState.totalBorrowed.sub(borrowedAmount);
        poolState.totalReserves = poolState.totalReserves.add(totalLiquidationAmount);
        _updateUtilizationRate();

        // Transfer liquidation reward to liquidator
        bsnToken.safeTransfer(msg.sender, liquidationAmount);

        emit Liquidated(user, msg.sender, borrowedAmount, block.timestamp);
    }

    /**
     * @dev Calculate collateral ratio for user
     */
    function _calculateCollateralRatio(address user) internal view returns (uint256) {
        UserPosition storage position = userPositions[user];
        
        if (position.borrowedAmount == 0) return 0;
        
        uint256 totalCollateral = position.depositedAmount.add(position.farmingAmount);
        return totalCollateral.mul(100).div(position.borrowedAmount);
    }

    /**
     * @dev Accrue interest for user
     */
    function _accrueInterest(address user) internal {
        UserPosition storage position = userPositions[user];
        
        if (position.lastUpdateTime == 0) return;

        uint256 timeElapsed = block.timestamp.sub(position.lastUpdateTime);
        if (timeElapsed == 0) return;

        // Calculate lending interest
        if (position.depositedAmount > 0) {
            uint256 lendingInterest = position.depositedAmount
                .mul(lendingRate)
                .mul(timeElapsed)
                .div(365 days)
                .div(10000);
            
            position.accumulatedInterest = position.accumulatedInterest.add(lendingInterest);
        }

        // Calculate borrowing interest
        if (position.borrowedAmount > 0) {
            uint256 borrowingInterest = position.borrowedAmount
                .mul(borrowingRate)
                .mul(timeElapsed)
                .div(365 days)
                .div(10000);
            
            position.borrowedAmount = position.borrowedAmount.add(borrowingInterest);
        }
    }

    /**
     * @dev Accrue farming rewards for user
     */
    function _accrueFarmingRewards(address user) internal {
        UserPosition storage position = userPositions[user];
        
        if (position.lastUpdateTime == 0 || position.farmingAmount == 0) return;

        uint256 timeElapsed = block.timestamp.sub(position.lastUpdateTime);
        if (timeElapsed == 0) return;

        uint256 farmingRewards = position.farmingAmount
            .mul(farmingRate)
            .mul(timeElapsed)
            .div(365 days)
            .div(10000);
        
        position.farmingRewards = position.farmingRewards.add(farmingRewards);
    }

    /**
     * @dev Update utilization rate
     */
    function _updateUtilizationRate() internal {
        if (poolState.totalDeposited > 0) {
            poolState.utilizationRate = poolState.totalBorrowed.mul(100).div(poolState.totalDeposited);
        } else {
            poolState.utilizationRate = 0;
        }
        poolState.lastUpdateTime = block.timestamp;
    }

    /**
     * @dev Get user position info
     */
    function getUserPosition(address user) external view returns (
        uint256 depositedAmount,
        uint256 borrowedAmount,
        uint256 farmingAmount,
        uint256 accumulatedInterest,
        uint256 farmingRewards,
        uint256 collateralRatio
    ) {
        UserPosition storage position = userPositions[user];
        return (
            position.depositedAmount,
            position.borrowedAmount,
            position.farmingAmount,
            position.accumulatedInterest,
            position.farmingRewards,
            _calculateCollateralRatio(user)
        );
    }

    /**
     * @dev Get pool state info
     */
    function getPoolState() external view returns (
        uint256 totalDeposited,
        uint256 totalBorrowed,
        uint256 totalFarming,
        uint256 totalReserves,
        uint256 utilizationRate,
        uint256 lendingRate,
        uint256 borrowingRate,
        uint256 farmingRate
    ) {
        return (
            poolState.totalDeposited,
            poolState.totalBorrowed,
            poolState.totalFarming,
            poolState.totalReserves,
            poolState.utilizationRate,
            lendingRate,
            borrowingRate,
            farmingRate
        );
    }

    /**
     * @dev Update interest rates (owner only)
     */
    function updateRates(uint256 _lendingRate, uint256 _borrowingRate, uint256 _farmingRate) external onlyOwner {
        lendingRate = _lendingRate;
        borrowingRate = _borrowingRate;
        farmingRate = _farmingRate;
    }

    /**
     * @dev Pause contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = bsnToken.balanceOf(address(this));
        bsnToken.safeTransfer(owner(), balance);
    }
} 