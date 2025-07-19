import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { djangoApi } from '@/lib/django-api-new';

interface TokenBalance {
  balance: string;
  address: string;
  created_at: string;
  updated_at: string;
}

interface StakingInfo {
  active_stakings: StakingRecord[];
  completed_stakings: StakingRecord[];
  total_staked: string;
  total_rewards_earned: string;
}

interface StakingRecord {
  id: number;
  amount: string;
  status: string;
  staking_period: number;
  apy_rate: string;
  rewards_earned: string;
  start_date: string;
  end_date: string;
}

interface TokenStream {
  id: number;
  sender: any;
  receiver: any;
  total_amount: string;
  amount_per_second: string;
  streamed_amount: string;
  status: string;
  start_time: string;
  end_time: string;
}

export default function TokenManagement() {
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
  const [stakingInfo, setStakingInfo] = useState<StakingInfo | null>(null);
  const [tokenStreams, setTokenStreams] = useState<TokenStream[]>([]);
  const [loading, setLoading] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [streamAmount, setStreamAmount] = useState('');
  const [streamDuration, setStreamDuration] = useState('1');
  const [streamReceiver, setStreamReceiver] = useState('');
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadTokenData();
  }, []);

  const loadTokenData = async () => {
    try {
      setLoading(true);
      
      // Load token balance
      const balanceResponse = await djangoApi.get('/wallet/balance/');
      setTokenBalance(balanceResponse.data);
      
      // Load staking info
      const stakingResponse = await djangoApi.get('/wallet/staking-info/');
      setStakingInfo(stakingResponse.data);
      
      // Load token streams
      const streamsResponse = await djangoApi.get('/wallet/streams/');
      setTokenStreams([
        ...streamsResponse.data.sent_streams,
        ...streamsResponse.data.received_streams
      ]);
      
    } catch (error) {
      console.error('Error loading token data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load token data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStakeTokens = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to stake',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await djangoApi.post('/wallet/stake/', {
        amount: parseFloat(stakeAmount)
      });
      
      toast({
        title: 'Success',
        description: 'Tokens staked successfully',
      });
      
      setStakeAmount('');
      loadTokenData();
      
    } catch (error) {
      console.error('Error staking tokens:', error);
      toast({
        title: 'Error',
        description: 'Failed to stake tokens',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnstakeTokens = async (stakingId: number) => {
    try {
      setLoading(true);
      await djangoApi.post('/wallet/unstake/', {
        staking_id: stakingId
      });
      
      toast({
        title: 'Success',
        description: 'Tokens unstaked successfully',
      });
      
      loadTokenData();
      
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      toast({
        title: 'Error',
        description: 'Failed to unstake tokens',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTokenStream = async () => {
    if (!streamAmount || !streamReceiver || parseFloat(streamAmount) <= 0) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter valid amount and receiver',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await djangoApi.post('/wallet/stream/create/', {
        receiver: streamReceiver,
        total_amount: parseFloat(streamAmount),
        duration_hours: parseInt(streamDuration)
      });
      
      toast({
        title: 'Success',
        description: 'Token stream created successfully',
      });
      
      setStreamAmount('');
      setStreamReceiver('');
      setStreamDuration('1');
      loadTokenData();
      
    } catch (error) {
      console.error('Error creating token stream:', error);
      toast({
        title: 'Error',
        description: 'Failed to create token stream',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading && !tokenBalance) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Token Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Token Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                {tokenBalance ? formatBalance(tokenBalance.balance) : '0.00'} BSN
              </div>
              {tokenBalance?.address && (
                <div className="text-sm text-muted-foreground">
                  Address: {tokenBalance.address.slice(0, 6)}...{tokenBalance.address.slice(-4)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Staking Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              Staking Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-2xl font-bold text-green-600">
                {stakingInfo ? formatBalance(stakingInfo.total_staked) : '0.00'} BSN
              </div>
              <div className="text-sm text-muted-foreground">
                Total Rewards: {stakingInfo ? formatBalance(stakingInfo.total_rewards_earned) : '0.00'} BSN
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Streams Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🌊</span>
              Active Streams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-2xl font-bold text-blue-600">
                {tokenStreams.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">
                Active token streams
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="staking" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="streaming">Token Streaming</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="staking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stake Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stake-amount">Amount to Stake (BSN)</Label>
                    <Input
                      id="stake-amount"
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleStakeTokens}
                      disabled={loading || !stakeAmount}
                      className="w-full"
                    >
                      {loading ? 'Staking...' : 'Stake Tokens'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Stakings */}
          {stakingInfo?.active_stakings && stakingInfo.active_stakings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Stakings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stakingInfo.active_stakings.map((staking) => (
                    <div key={staking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{formatBalance(staking.amount)} BSN</div>
                          <div className="text-sm text-muted-foreground">
                            APY: {staking.apy_rate}% | Period: {staking.staking_period} days
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(staking.status)}>
                            {staking.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnstakeTokens(staking.id)}
                            disabled={loading}
                          >
                            Unstake
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="streaming" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Token Stream</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="stream-receiver">Receiver Username</Label>
                    <Input
                      id="stream-receiver"
                      value={streamReceiver}
                      onChange={(e) => setStreamReceiver(e.target.value)}
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stream-amount">Amount (BSN)</Label>
                    <Input
                      id="stream-amount"
                      type="number"
                      value={streamAmount}
                      onChange={(e) => setStreamAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stream-duration">Duration (hours)</Label>
                    <Input
                      id="stream-duration"
                      type="number"
                      value={streamDuration}
                      onChange={(e) => setStreamDuration(e.target.value)}
                      placeholder="Duration"
                      min="1"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleCreateTokenStream}
                  disabled={loading || !streamAmount || !streamReceiver}
                  className="w-full"
                >
                  {loading ? 'Creating Stream...' : 'Create Token Stream'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Streams */}
          {tokenStreams.filter(s => s.status === 'active').length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Streams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tokenStreams
                    .filter(stream => stream.status === 'active')
                    .map((stream) => (
                      <div key={stream.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">
                              {stream.sender?.username || 'Unknown'} → {stream.receiver?.username || 'Unknown'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatBalance(stream.total_amount)} BSN over {stream.duration_hours || 1} hours
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Rate: {formatBalance(stream.amount_per_second)} BSN/sec
                            </div>
                          </div>
                          <Badge className={getStatusColor(stream.status)}>
                            {stream.status}
                          </Badge>
                        </div>
                        <Progress 
                          value={(parseFloat(stream.streamed_amount) / parseFloat(stream.total_amount)) * 100} 
                          className="mt-2"
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Transaction history will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 