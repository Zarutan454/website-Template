import React, { useState } from 'react';

const WalletDemo = () => {
  const [activeTab, setActiveTab] = useState('balance');
  
  // Sample wallet data
  const walletData = {
    balance: 245.87,
    address: '0x7F5EB...3A2b',
    transactions: [
      { id: 1, type: 'receive', amount: 50, from: '0x3F2a...8B1c', date: '2023-05-15', status: 'confirmed' },
      { id: 2, type: 'send', amount: 12.5, to: '0x9E4c...7D3a', date: '2023-05-12', status: 'confirmed' },
      { id: 3, type: 'receive', amount: 25, from: '0x6B7d...2F4e', date: '2023-05-10', status: 'confirmed' },
      { id: 4, type: 'mining', amount: 3.75, date: '2023-05-09', status: 'confirmed' },
      { id: 5, type: 'send', amount: 8.2, to: '0x1A3b...5C7d', date: '2023-05-07', status: 'confirmed' }
    ]
  };
  
  return (
    <div className="w-full max-w-md mx-auto bg-[#0a0b1f] rounded-lg overflow-hidden border border-[#00a2ff]/20">
      {/* Header */}
      <div className="bg-[#0d0e2c] px-4 py-3 border-b border-[#00a2ff]/20 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#00a2ff]/20 flex items-center justify-center mr-2">
            <span className="text-[#00a2ff] text-xs">BSN</span>
          </div>
          <span className="text-white font-medium">Wallet</span>
        </div>
        <div className="flex space-x-3">
          <button className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Balance Card */}
      <div className="p-4 bg-gradient-to-br from-[#00a2ff]/20 to-[#0077ff]/10">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-white/70">Total Balance</div>
          <div className="text-xs text-white/50">{walletData.address}</div>
        </div>
        <div className="flex items-end mb-4">
          <div className="text-3xl font-light text-white">{walletData.balance}</div>
          <div className="ml-2 text-lg text-[#00a2ff]">BSN</div>
        </div>
        <div className="flex space-x-2">
          <button className="flex-1 bg-[#00a2ff] hover:bg-[#33b5ff] text-white text-sm py-2 rounded-md transition-colors flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
            Send
          </button>
          <button className="flex-1 bg-[#0d0e2c] hover:bg-[#161a45] text-white text-sm py-2 rounded-md transition-colors border border-[#00a2ff]/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
            </svg>
            Receive
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-[#00a2ff]/20">
        <button 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'balance' 
              ? 'text-[#00a2ff] border-b-2 border-[#00a2ff]' 
              : 'text-white/50 hover:text-white/80'
          }`}
          onClick={() => setActiveTab('balance')}
        >
          Balance
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'transactions' 
              ? 'text-[#00a2ff] border-b-2 border-[#00a2ff]' 
              : 'text-white/50 hover:text-white/80'
          }`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'stake' 
              ? 'text-[#00a2ff] border-b-2 border-[#00a2ff]' 
              : 'text-white/50 hover:text-white/80'
          }`}
          onClick={() => setActiveTab('stake')}
        >
          Stake
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'balance' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm text-white font-medium">Assets</div>
              <button className="text-xs text-[#00a2ff]">View All</button>
            </div>
            
            <div className="bg-[#0d0e2c] rounded-lg p-3 mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#00a2ff]/20 flex items-center justify-center mr-3">
                  <span className="text-[#00a2ff] text-xs">BSN</span>
                </div>
                <div>
                  <div className="text-white text-sm">BSN Token</div>
                  <div className="text-white/50 text-xs">Native</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white text-sm">{walletData.balance} BSN</div>
                <div className="text-[#00a2ff] text-xs">≈ $1,229.35</div>
              </div>
            </div>
            
            <div className="bg-[#0d0e2c] rounded-lg p-3 flex items-center justify-between opacity-50">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#8247E5]/20 flex items-center justify-center mr-3">
                  <span className="text-[#8247E5] text-xs">MATIC</span>
                </div>
                <div>
                  <div className="text-white text-sm">Polygon</div>
                  <div className="text-white/50 text-xs">Coming soon</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white text-sm">0 MATIC</div>
                <div className="text-white/50 text-xs">≈ $0.00</div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'transactions' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm text-white font-medium">Recent Activity</div>
              <button className="text-xs text-[#00a2ff]">Export</button>
            </div>
            
            <div className="space-y-3">
              {walletData.transactions.map(tx => (
                <div key={tx.id} className="bg-[#0d0e2c] rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      tx.type === 'receive' ? 'bg-green-500/20' : 
                      tx.type === 'send' ? 'bg-red-500/20' : 
                      'bg-[#00a2ff]/20'
                    }`}>
                      {tx.type === 'receive' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      {tx.type === 'send' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      {tx.type === 'mining' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#00a2ff]" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="text-white text-sm capitalize">{tx.type}</div>
                      <div className="text-white/50 text-xs">
                        {tx.type === 'receive' ? `From: ${tx.from}` : 
                         tx.type === 'send' ? `To: ${tx.to}` : 
                         'Mining Reward'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${
                      tx.type === 'receive' || tx.type === 'mining' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {tx.type === 'receive' || tx.type === 'mining' ? '+' : '-'}{tx.amount} BSN
                    </div>
                    <div className="text-white/50 text-xs">{tx.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'stake' && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 rounded-full bg-[#00a2ff]/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#00a2ff]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-white text-lg mb-2">Staking Coming Soon</h3>
            <p className="text-white/70 text-sm text-center max-w-xs mb-4">
              Earn up to 15% APY by staking your BSN tokens. Help secure the network and earn rewards.
            </p>
            <button className="bg-[#00a2ff]/20 hover:bg-[#00a2ff]/30 text-[#00a2ff] text-sm py-2 px-6 rounded-md transition-colors border border-[#00a2ff]/30">
              Join Waitlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletDemo; 