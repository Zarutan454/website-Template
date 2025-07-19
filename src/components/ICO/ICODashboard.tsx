import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext.utils';
import { api } from '@/lib/django-api-new';

interface ICOReservation {
  id: number;
  amount_usd: number;
  tokens_reserved: number;
  payment_method: string;
  status: string;
  transaction_hash?: string;
  created_at: string;
  expires_at: string;
}

interface ICOConfig {
  total_supply: number;
  tokens_sold: number;
  price_per_token: number;
  min_investment: number;
  max_investment: number;
  start_date: string;
  end_date: string;
}

export default function ICODashboard() {
  const [reservations, setReservations] = useState<ICOReservation[]>([]);
  const [icoConfig, setIcoConfig] = useState<ICOConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchReservations();
    fetchICOConfig();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/api/ico-reservations/');
      setReservations(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching ICO reservations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load ICO reservations',
        variant: 'destructive',
      });
    }
  };

  const fetchICOConfig = async () => {
    try {
      // Mock ICO config - in real implementation, this would come from API
      setIcoConfig({
        total_supply: 1000000,
        tokens_sold: 250000,
        price_per_token: 0.1,
        min_investment: 100,
        max_investment: 10000,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });
    } catch (error) {
      console.error('Error fetching ICO config:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReservationStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getICOProgress = () => {
    if (!icoConfig) return 0;
    return (icoConfig.tokens_sold / icoConfig.total_supply) * 100;
  };

  const getTimeRemaining = () => {
    if (!icoConfig) return 'N/A';
    const endDate = new Date(icoConfig.end_date);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ICO Token Sale</h1>
        <p className="text-gray-600">Reserve your tokens in the upcoming Initial Coin Offering</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reservations">My Reservations</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {icoConfig && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Tokens Sold</span>
                    <Badge variant="secondary">
                      {((icoConfig.tokens_sold / icoConfig.total_supply) * 100).toFixed(1)}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">
                    {icoConfig.tokens_sold.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">of {icoConfig.total_supply.toLocaleString()}</p>
                  <Progress value={getICOProgress()} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Price per Token</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    ${icoConfig.price_per_token}
                  </p>
                  <p className="text-sm text-gray-600">Current price</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Investment Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-600">
                    ${icoConfig.min_investment} - ${icoConfig.max_investment}
                  </p>
                  <p className="text-sm text-gray-600">Min - Max investment</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Time Remaining</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-600">
                    {getTimeRemaining()}
                  </p>
                  <p className="text-sm text-gray-600">Until ICO ends</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="w-full" size="lg">
                  Reserve Tokens
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  View Whitepaper
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-6">
          <div className="space-y-4">
            {reservations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-600 mb-4">No reservations yet</p>
                  <Button>Make Your First Reservation</Button>
                </CardContent>
              </Card>
            ) : (
              reservations.map((reservation) => (
                <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        ${reservation.amount_usd} USD
                      </CardTitle>
                      <Badge className={getReservationStatusColor(reservation.status)}>
                        {reservation.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Tokens Reserved</p>
                        <p className="font-semibold">{reservation.tokens_reserved.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-semibold capitalize">{reservation.payment_method}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Created</p>
                        <p className="font-semibold">
                          {new Date(reservation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Expires</p>
                        <p className="font-semibold">
                          {new Date(reservation.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {reservation.transaction_hash && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Transaction Hash</p>
                        <p className="font-mono text-xs break-all">{reservation.transaction_hash}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reservation Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Reservations</span>
                    <span className="font-semibold">{reservations.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Value</span>
                    <span className="font-semibold">
                      ${reservations.reduce((sum, r) => sum + r.amount_usd, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending</span>
                    <span className="font-semibold">
                      {reservations.filter(r => r.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confirmed</span>
                    <span className="font-semibold">
                      {reservations.filter(r => r.status === 'confirmed').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['ethereum', 'polygon', 'bsc', 'solana'].map((method) => {
                    const count = reservations.filter(r => r.payment_method === method).length;
                    return (
                      <div key={method} className="flex justify-between items-center">
                        <span className="capitalize">{method}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="how-it-works" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How the ICO Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold">Reserve Tokens</h3>
                    <p className="text-gray-600">
                      Choose your investment amount and payment method. Your reservation will be valid for 24 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold">Send Payment</h3>
                    <p className="text-gray-600">
                      Send the required amount to the provided wallet address. Include the transaction hash in your reservation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold">Confirmation</h3>
                    <p className="text-gray-600">
                      Once payment is confirmed (12 block confirmations), your reservation status will update to confirmed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold">Token Distribution</h3>
                    <p className="text-gray-600">
                      Tokens will be distributed to your wallet address after the ICO ends and smart contracts are deployed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Important Notes</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Minimum investment: $100 USD</li>
                  <li>• Maximum investment: $10,000 USD</li>
                  <li>• Reservations expire after 24 hours</li>
                  <li>• Payment must be confirmed within 24 hours</li>
                  <li>• No refunds for failed or expired reservations</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
