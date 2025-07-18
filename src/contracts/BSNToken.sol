// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title BSN Token
 * @dev BSN Social Network Token with advanced features
 */
contract BSNToken is ERC20, ERC20Burnable, Pausable, Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    // Token Configuration
    uint256 public constant TOTAL_SUPPLY = 10_000_000_000 * 10**18; // 10 Billion BSN
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1 Billion for initial distribution
    uint256 public constant MINING_REWARDS = 5_000_000_000 * 10**18; // 5 Billion for mining
    uint256 public constant COMMUNITY_REWARDS = 2_000_000_000 * 10**18; // 2 Billion for community
    uint256 public constant TEAM_REWARDS = 1_000_000_000 * 10**18; // 1 Billion for team
    uint256 public constant MARKETING_REWARDS = 1_000_000_000 * 10**18; // 1 Billion for marketing

    // Mining System
    uint256 public miningRate = 0.01 * 10**18; // 0.01 BSN per minute
    uint256 public dailyMiningLimit = 10 * 10**18; // 10 BSN per day
    uint256 public miningRewardsRemaining = MINING_REWARDS;
    
    // Staking System
    uint256 public stakingRewardRate = 0.05 * 10**18; // 5% APY
    uint256 public stakingRewardsRemaining = COMMUNITY_REWARDS;
    
    // User Mining Data
    mapping(address => uint256) public userMiningBalance;
    mapping(address => uint256) public userLastMiningTime;
    mapping(address => uint256) public userDailyMiningAmount;
    mapping(address => uint256) public userLastMiningReset;
    
    // Staking Data
    mapping(address => uint256) public userStakedAmount;
    mapping(address => uint256) public userStakingStartTime;
    mapping(address => uint256) public userStakingRewards;
    
    // Authorized Minters (for mining rewards)
    mapping(address => bool) public authorizedMinters;
    
    // Events
    event MiningReward(address indexed user, uint256 amount, uint256 timestamp);
    event StakingReward(address indexed user, uint256 amount, uint256 timestamp);
    event TokensStaked(address indexed user, uint256 amount, uint256 timestamp);
    event TokensUnstaked(address indexed user, uint256 amount, uint256 timestamp);
    event MiningRateUpdated(uint256 newRate, uint256 timestamp);
    event StakingRateUpdated(uint256 newRate, uint256 timestamp);

    constructor() ERC20("BSN Social Network", "BSN") Ownable(msg.sender) {
        // Mint initial supply to owner
        _mint(msg.sender, INITIAL_SUPPLY);
        
        // Add owner as authorized minter
        authorizedMinters[msg.sender] = true;
    }

    /**
     * @dev Start mining for user
     */
    function startMining() external whenNotPaused {
        require(userLastMiningTime[msg.sender] == 0, "Mining already started");
        userLastMiningTime[msg.sender] = block.timestamp;
        userLastMiningReset[msg.sender] = block.timestamp;
    }

    /**
     * @dev Claim mining rewards
     */
    function claimMiningRewards() external whenNotPaused nonReentrant {
        require(userLastMiningTime[msg.sender] > 0, "Mining not started");
        require(miningRewardsRemaining > 0, "No mining rewards remaining");
        
        // Reset daily mining if 24 hours passed
        if (block.timestamp >= userLastMiningReset[msg.sender] + 1 days) {
            userDailyMiningAmount[msg.sender] = 0;
            userLastMiningReset[msg.sender] = block.timestamp;
        }
        
        uint256 timeElapsed = block.timestamp - userLastMiningTime[msg.sender];
        uint256 rewardAmount = (timeElapsed * miningRate) / 60; // Convert to minutes
        
        // Apply daily limit
        if (userDailyMiningAmount[msg.sender] + rewardAmount > dailyMiningLimit) {
            rewardAmount = dailyMiningLimit - userDailyMiningAmount[msg.sender];
        }
        
        // Apply remaining rewards limit
        if (rewardAmount > miningRewardsRemaining) {
            rewardAmount = miningRewardsRemaining;
        }
        
        require(rewardAmount > 0, "No rewards to claim");
        
        // Update state
        userMiningBalance[msg.sender] = userMiningBalance[msg.sender].add(rewardAmount);
        userDailyMiningAmount[msg.sender] = userDailyMiningAmount[msg.sender].add(rewardAmount);
        userLastMiningTime[msg.sender] = block.timestamp;
        miningRewardsRemaining = miningRewardsRemaining.sub(rewardAmount);
        
        // Mint tokens to user
        _mint(msg.sender, rewardAmount);
        
        emit MiningReward(msg.sender, rewardAmount, block.timestamp);
    }

    /**
     * @dev Stake tokens
     */
    function stakeTokens(uint256 amount) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        // Update staking data
        if (userStakedAmount[msg.sender] > 0) {
            // Calculate and add pending rewards
            uint256 pendingRewards = calculateStakingRewards(msg.sender);
            userStakingRewards[msg.sender] = userStakingRewards[msg.sender].add(pendingRewards);
        }
        
        userStakedAmount[msg.sender] = userStakedAmount[msg.sender].add(amount);
        userStakingStartTime[msg.sender] = block.timestamp;
        
        emit TokensStaked(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Unstake tokens
     */
    function unstakeTokens(uint256 amount) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(userStakedAmount[msg.sender] >= amount, "Insufficient staked amount");
        
        // Calculate and add pending rewards
        uint256 pendingRewards = calculateStakingRewards(msg.sender);
        userStakingRewards[msg.sender] = userStakingRewards[msg.sender].add(pendingRewards);
        
        // Update staking data
        userStakedAmount[msg.sender] = userStakedAmount[msg.sender].sub(amount);
        userStakingStartTime[msg.sender] = block.timestamp;
        
        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);
        
        emit TokensUnstaked(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Claim staking rewards
     */
    function claimStakingRewards() external whenNotPaused nonReentrant {
        uint256 pendingRewards = calculateStakingRewards(msg.sender);
        uint256 totalRewards = userStakingRewards[msg.sender].add(pendingRewards);
        
        require(totalRewards > 0, "No rewards to claim");
        require(stakingRewardsRemaining >= totalRewards, "Insufficient staking rewards");
        
        // Reset rewards
        userStakingRewards[msg.sender] = 0;
        userStakingStartTime[msg.sender] = block.timestamp;
        stakingRewardsRemaining = stakingRewardsRemaining.sub(totalRewards);
        
        // Mint rewards to user
        _mint(msg.sender, totalRewards);
        
        emit StakingReward(msg.sender, totalRewards, block.timestamp);
    }

    /**
     * @dev Calculate pending staking rewards
     */
    function calculateStakingRewards(address user) public view returns (uint256) {
        if (userStakedAmount[user] == 0) return 0;
        
        uint256 timeStaked = block.timestamp - userStakingStartTime[user];
        uint256 annualReward = userStakedAmount[user].mul(stakingRewardRate).div(100);
        uint256 reward = annualReward.mul(timeStaked).div(365 days);
        
        return reward;
    }

    /**
     * @dev Get user mining info
     */
    function getUserMiningInfo(address user) external view returns (
        uint256 miningBalance,
        uint256 lastMiningTime,
        uint256 dailyMiningAmount,
        uint256 lastMiningReset,
        uint256 timeUntilReset
    ) {
        miningBalance = userMiningBalance[user];
        lastMiningTime = userLastMiningTime[user];
        dailyMiningAmount = userDailyMiningAmount[user];
        lastMiningReset = userLastMiningReset[user];
        
        if (lastMiningReset > 0) {
            uint256 nextReset = lastMiningReset + 1 days;
            timeUntilReset = nextReset > block.timestamp ? nextReset - block.timestamp : 0;
        }
    }

    /**
     * @dev Get user staking info
     */
    function getUserStakingInfo(address user) external view returns (
        uint256 stakedAmount,
        uint256 stakingStartTime,
        uint256 pendingRewards,
        uint256 totalRewards
    ) {
        stakedAmount = userStakedAmount[user];
        stakingStartTime = userStakingStartTime[user];
        pendingRewards = calculateStakingRewards(user);
        totalRewards = userStakingRewards[user].add(pendingRewards);
    }

    /**
     * @dev Update mining rate (owner only)
     */
    function updateMiningRate(uint256 newRate) external onlyOwner {
        miningRate = newRate;
        emit MiningRateUpdated(newRate, block.timestamp);
    }

    /**
     * @dev Update staking reward rate (owner only)
     */
    function updateStakingRate(uint256 newRate) external onlyOwner {
        stakingRewardRate = newRate;
        emit StakingRateUpdated(newRate, block.timestamp);
    }

    /**
     * @dev Add authorized minter (owner only)
     */
    function addAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }

    /**
     * @dev Remove authorized minter (owner only)
     */
    function removeAuthorizedMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
    }

    /**
     * @dev Mint tokens (authorized minters only)
     */
    function mint(address to, uint256 amount) external {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(totalSupply().add(amount) <= TOTAL_SUPPLY, "Exceeds total supply");
        _mint(to, amount);
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
     * @dev Override transfer to check for paused state
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal view override(ERC20, Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }
} 