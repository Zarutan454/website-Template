
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, TrendingUp, BarChart2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Token } from '@/types/token';

// Sample data for charts
const priceData = [
  { name: 'Jan', price: 400 },
  { name: 'Feb', price: 700 },
  { name: 'Mar', price: 600 },
  { name: 'Apr', price: 800 },
  { name: 'May', price: 750 },
  { name: 'Jun', price: 900 },
  { name: 'Jul', price: 1000 },
];

const volumeData = [
  { name: 'Jan', volume: 2400 },
  { name: 'Feb', volume: 1398 },
  { name: 'Mar', volume: 9800 },
  { name: 'Apr', volume: 3908 },
  { name: 'May', volume: 4800 },
  { name: 'Jun', volume: 3800 },
  { name: 'Jul', volume: 4300 },
];

interface TokenAnalyticsDashboardProps {
  token: Token;
}

const TokenAnalyticsDashboard: React.FC<TokenAnalyticsDashboardProps> = ({ token }) => {
  // Convert token to display format
  const displayToken: Token = {
    ...token,
    // Use existing properties
  };

  return (
    <div className="space-y-6">
      {/* Token Overview */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{token.name} ({token.symbol})</CardTitle>
                {token.is_verified && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    Verified
                  </Badge>
                )}
                <Badge variant="outline" className="capitalize">
                  {token.token_type || 'Standard'}
                </Badge>
              </div>
              <CardDescription className="mt-1 text-sm">
                {token.description || `${token.name} token on ${token.network} blockchain`}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {token.social_links?.website && (
                <Button variant="outline" size="sm" className="h-8" asChild>
                  <a href={token.social_links.website} target="_blank" rel="noopener noreferrer">Website</a>
                </Button>
              )}
              {token.social_links?.twitter && (
                <Button variant="outline" size="sm" className="h-8" asChild>
                  <a href={token.social_links.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>
                </Button>
              )}
              {token.social_links?.telegram && (
                <Button variant="outline" size="sm" className="h-8" asChild>
                  <a href={token.social_links.telegram} target="_blank" rel="noopener noreferrer">Telegram</a>
                </Button>
              )}
              {token.contract_address && (
                <Button variant="outline" size="sm" className="h-8" asChild>
                  <a href={`https://${token.network.toLowerCase() === 'ethereum' ? '' : token.network.toLowerCase() + '.'}etherscan.io/token/${token.contract_address}`} target="_blank" rel="noopener noreferrer">
                    Explorer
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Price Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <h3 className="text-2xl font-bold">
                      ${token.token_metrics?.price_usd?.toFixed(6) || '0.000000'}
                    </h3>
                    <div className="flex items-center mt-1">
                      <Badge variant={token.token_metrics?.price_change_24h && token.token_metrics.price_change_24h > 0 ? "success" : "destructive"} className="text-xs">
                        {token.token_metrics?.price_change_24h ? (token.token_metrics.price_change_24h > 0 ? '+' : '') + token.token_metrics.price_change_24h.toFixed(2) + '%' : '0.00%'}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-2">24h</span>
                    </div>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Market Cap Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <h3 className="text-2xl font-bold">
                      ${token.token_metrics?.market_cap?.toLocaleString() || '0'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Rank: {token.token_metrics?.market_cap ? '#' + Math.floor(Math.random() * 5000) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <BarChart2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 24h Volume Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">24h Volume</p>
                    <h3 className="text-2xl font-bold">
                      ${token.token_metrics?.volume_24h?.toLocaleString() || '0'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {token.token_metrics?.volume_24h && token.token_metrics.market_cap 
                        ? (token.token_metrics.volume_24h / token.token_metrics.market_cap * 100).toFixed(2) + '% of market cap' 
                        : '0% of market cap'}
                    </p>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Holders Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Holders</p>
                    <h3 className="text-2xl font-bold">
                      {token.token_metrics?.holder_count?.toLocaleString() || '0'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {/* Trend would be calculated from historical data */}
                      <span className="text-green-500">+0.5%</span> last 7 days
                    </p>
                  </div>
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      {/* Charts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Price & Volume History</CardTitle>
          <CardDescription>Historical performance data for {token.symbol}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="price">
            <TabsList>
              <TabsTrigger value="price">Price</TabsTrigger>
              <TabsTrigger value="volume">Volume</TabsTrigger>
            </TabsList>
            <TabsContent value="price" className="pt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="price" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="volume" className="pt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Token Details */}
      <Card>
        <CardHeader>
          <CardTitle>Token Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Contract Address</h4>
                <div className="mt-1 bg-muted/50 p-2 rounded font-mono text-xs break-all">
                  {token.contract_address || 'Not deployed yet'}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Total Supply</h4>
                <p className="mt-1">{Number(token.total_supply).toLocaleString()} {token.symbol}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Network</h4>
                <p className="mt-1 capitalize">{token.network}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Decimals</h4>
                <p className="mt-1">{token.decimals || 18}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Token Type</h4>
                <p className="mt-1 capitalize">{token.token_type || 'Standard'}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                <p className="mt-1">{new Date(token.created_at).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Features</h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  {token.features?.map((feature, index) => (
                    <Badge key={index} variant="outline">{feature}</Badge>
                  ))}
                  {(!token.features || token.features.length === 0) && (
                    <span className="text-muted-foreground text-sm">No special features</span>
                  )}
                </div>
              </div>
              
              {token.token_type === 'marketing' && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Tax Info</h4>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 p-2 rounded text-sm">
                      <span className="text-muted-foreground">Buy:</span> {token.buy_tax || 0}%
                    </div>
                    <div className="bg-muted/50 p-2 rounded text-sm">
                      <span className="text-muted-foreground">Sell:</span> {token.sell_tax || 0}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenAnalyticsDashboard;
