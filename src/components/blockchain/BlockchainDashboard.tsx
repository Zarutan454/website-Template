import React, { useState } from 'react';
import { useBlockchain } from '../../hooks/useBlockchain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  Wallet, 
  Coins, 
  TrendingUp, 
  Lock, 
  Unlock, 
  Zap, 
  Gift, 
  Activity,
  DollarSign,
  ArrowUpDown,
  PiggyBank,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

export const BlockchainDashboard: React.FC = () => {
  const {
    userBalance,
    miningInfo,
    stakingInfo,
    defiInfo,
    isLoading,
    isConnected,
    handleStartMining,
    handleClaimMiningRewards,
    handleStakeTokens,
    handleUnstakeTokens,
    handleClaimStakingRewards,
    handleDeposit,
    handleWithdraw,
    handleBorrow,
    handleRepay,
    handleStartFarming,
    handleStopFarming,
    handleClaimFarmingRewards
  } = useBlockchain();

  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [farmingAmount, setFarmingAmount] = useState('');

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Connection Required
            </CardTitle>
            <CardDescription>
              Please connect your wallet to access blockchain features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blockchain Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your BSN tokens, mining, staking, and DeFi activities
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Balance: {parseFloat(userBalance).toFixed(2)} BSN
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseFloat(userBalance).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">BSN Tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staked Amount</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseFloat(stakingInfo.stakedAmount).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Staked BSN</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deposited</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parseFloat(defiInfo.depositedAmount).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">In DeFi Pool</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collateral Ratio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{defiInfo.collateralRatio.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Health Status</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="mining" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mining">Mining</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="defi">DeFi</TabsTrigger>
          <TabsTrigger value="farming">Farming</TabsTrigger>
        </TabsList>

        {/* Mining Tab */}
        <TabsContent value="mining" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Mining Status
              </CardTitle>
              <CardDescription>
                Mine BSN tokens through platform activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Mining Status</p>
                  <Badge variant={miningInfo.isMining ? "default" : "secondary"}>
                    {miningInfo.isMining ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Daily Mined</p>
                  <p className="text-lg font-semibold">{parseFloat(miningInfo.dailyMiningAmount).toFixed(2)} BSN</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Daily Progress</p>
                <Progress value={(parseFloat(miningInfo.dailyMiningAmount) / 10) * 100} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {parseFloat(miningInfo.dailyMiningAmount).toFixed(2)} / 10.00 BSN daily limit
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleStartMining} 
                  disabled={isLoading || miningInfo.isMining}
                  className="flex-1"
                >
                  Start Mining
                </Button>
                <Button 
                  onClick={handleClaimMiningRewards} 
                  disabled={isLoading || !miningInfo.isMining}
                  variant="outline"
                  className="flex-1"
                >
                  Claim Rewards
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staking Tab */}
        <TabsContent value="staking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Staking Management
              </CardTitle>
              <CardDescription>
                Stake your BSN tokens to earn rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Staked Amount</p>
                  <p className="text-lg font-semibold">{parseFloat(stakingInfo.stakedAmount).toFixed(2)} BSN</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Pending Rewards</p>
                  <p className="text-lg font-semibold">{parseFloat(stakingInfo.pendingRewards).toFixed(2)} BSN</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Rewards</p>
                  <p className="text-lg font-semibold">{parseFloat(stakingInfo.totalRewards).toFixed(2)} BSN</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Amount to stake"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleStakeTokens(stakeAmount)}
                    disabled={isLoading || !stakeAmount}
                    className="w-full"
                  >
                    Stake Tokens
                  </Button>
                </div>

                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Amount to unstake"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleUnstakeTokens(unstakeAmount)}
                    disabled={isLoading || !unstakeAmount}
                    variant="outline"
                    className="w-full"
                  >
                    Unstake Tokens
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleClaimStakingRewards}
                disabled={isLoading || parseFloat(stakingInfo.totalRewards) === 0}
                className="w-full"
              >
                Claim Staking Rewards
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DeFi Tab */}
        <TabsContent value="defi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                DeFi Lending & Borrowing
              </CardTitle>
              <CardDescription>
                Deposit, borrow, and manage your DeFi positions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Deposited</p>
                  <p className="text-lg font-semibold">{parseFloat(defiInfo.depositedAmount).toFixed(2)} BSN</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Borrowed</p>
                  <p className="text-lg font-semibold">{parseFloat(defiInfo.borrowedAmount).toFixed(2)} BSN</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Collateral Ratio</p>
                  <p className="text-lg font-semibold">{defiInfo.collateralRatio.toFixed(1)}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Amount to deposit"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleDeposit(depositAmount)}
                    disabled={isLoading || !depositAmount}
                    className="w-full"
                  >
                    Deposit
                  </Button>
                </div>

                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Amount to withdraw"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleWithdraw(withdrawAmount)}
                    disabled={isLoading || !withdrawAmount}
                    variant="outline"
                    className="w-full"
                  >
                    Withdraw
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Amount to borrow"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleBorrow(borrowAmount)}
                    disabled={isLoading || !borrowAmount}
                    className="w-full"
                  >
                    Borrow
                  </Button>
                </div>

                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Amount to repay"
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleRepay(repayAmount)}
                    disabled={isLoading || !repayAmount}
                    variant="outline"
                    className="w-full"
                  >
                    Repay
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Farming Tab */}
        <TabsContent value="farming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Yield Farming
              </CardTitle>
              <CardDescription>
                Farm additional rewards by providing liquidity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Farming Amount</p>
                  <p className="text-lg font-semibold">{parseFloat(defiInfo.farmingAmount).toFixed(2)} BSN</p>
                </div>
                <div>
                  <p className="text-sm font-medium">APY</p>
                  <p className="text-lg font-semibold text-green-600">12%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Amount to farm"
                    value={farmingAmount}
                    onChange={(e) => setFarmingAmount(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleStartFarming(farmingAmount)}
                    disabled={isLoading || !farmingAmount}
                    className="w-full"
                  >
                    Start Farming
                  </Button>
                </div>

                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Amount to stop farming"
                    value={farmingAmount}
                    onChange={(e) => setFarmingAmount(e.target.value)}
                  />
                  <Button 
                    onClick={() => handleStopFarming(farmingAmount)}
                    disabled={isLoading || !farmingAmount}
                    variant="outline"
                    className="w-full"
                  >
                    Stop Farming
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleClaimFarmingRewards}
                disabled={isLoading}
                className="w-full"
              >
                Claim Farming Rewards
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 