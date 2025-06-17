import React from 'react';

const SdkDemo = () => {
  return (
    <div className="w-full h-full bg-[#0d0e35] rounded-lg overflow-hidden">
      {/* App Header */}
      <div className="bg-[#0d0e35] p-3 flex items-center justify-between border-b border-[#00a2ff]/20">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#00a2ff]/30 flex items-center justify-center">
            👤
          </div>
          <div className="ml-3 text-[#00a2ff] font-bold">BSN Developer Portal</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#00a2ff]/20 flex items-center justify-center">
          ⚙️
        </div>
      </div>
      
      {/* App Body */}
      <div className="p-4 overflow-auto h-[calc(100%-48px)]">
        {/* Tabs */}
        <div className="flex bg-[#0d0e35] rounded mb-4 overflow-hidden">
          <div className="py-2 px-4 bg-[#00a2ff]/20 text-[#00a2ff] text-center flex-1">SDK</div>
          <div className="py-2 px-4 text-white/70 text-center flex-1">API</div>
          <div className="py-2 px-4 text-white/70 text-center flex-1">My Apps</div>
          <div className="py-2 px-4 text-white/70 text-center flex-1">Analytics</div>
        </div>
        
        {/* SDK Overview */}
        <div className="bg-[#0d0e35] rounded-lg p-4 mb-4">
          <div className="text-white font-medium mb-2">BSN SDK Overview</div>
          <div className="text-white/70 text-sm mb-4">
            Integrate BSN platform features into your applications with our easy-to-use SDK.
            Available for Web, iOS, Android, and Unity.
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#06071F]/50 p-3 rounded-lg">
              <div className="text-white font-medium">Latest Version</div>
              <div className="text-[#00a2ff]">v2.4.1</div>
              <div className="text-white/50 text-xs">Released 3 days ago</div>
            </div>
            
            <div className="bg-[#06071F]/50 p-3 rounded-lg">
              <div className="text-white font-medium">Your Apps</div>
              <div className="text-[#00a2ff]">3 Active</div>
              <div className="text-white/50 text-xs">12.5k Monthly Users</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="bg-[#00a2ff]/20 border border-[#00a2ff]/40 text-[#00a2ff] px-4 py-2 rounded-full flex-1">
              Documentation
            </button>
            <button className="bg-[#00a2ff]/20 border border-[#00a2ff]/40 text-[#00a2ff] px-4 py-2 rounded-full flex-1">
              Download SDK
            </button>
          </div>
        </div>
        
        {/* Code Example */}
        <div className="bg-[#06071F] rounded-lg p-4 mb-4 font-mono text-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="text-white/70">SDK Integration Example</div>
            <div className="text-[#00a2ff]">JavaScript</div>
          </div>
          <div className="text-green-400">// Initialize the BSN SDK</div>
          <div className="text-white">
            <span className="text-[#00a2ff]">import</span> {'{ BSN }'} <span className="text-[#00a2ff]">from</span> <span className="text-orange-300">'@bsn/sdk'</span>;
          </div>
          <div className="text-white">
            <span className="text-white/70">const</span> bsn = <span className="text-[#00a2ff]">new</span> BSN({'{'} 
          </div>
          <div className="text-white pl-4">
            apiKey: <span className="text-orange-300">'YOUR_API_KEY'</span>,
          </div>
          <div className="text-white pl-4">
            environment: <span className="text-orange-300">'production'</span>
          </div>
          <div className="text-white">{'}'});</div>
          <div className="text-white mt-2">
            <span className="text-green-400">// Authenticate a user</span>
          </div>
          <div className="text-white">
            <span className="text-white/70">const</span> user = <span className="text-white/70">await</span> bsn.auth.login(credentials);
          </div>
          <div className="text-white mt-2">
            <span className="text-green-400">// Get user's BSN balance</span>
          </div>
          <div className="text-white">
            <span className="text-white/70">const</span> balance = <span className="text-white/70">await</span> bsn.wallet.getBalance();
          </div>
          <div className="text-white">console.log(<span className="text-orange-300">`Balance: ${`}</span>balance<span className="text-orange-300">{`} BSN`</span>);</div>
        </div>
        
        {/* Available Integrations */}
        <div className="mb-4">
          <div className="text-white font-medium mb-3">Available Integrations</div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Integration 1 */}
            <div className="bg-[#0d0e35] rounded-lg p-3 flex items-center">
              <div className="w-10 h-10 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
                👤
              </div>
              <div className="flex-1">
                <div className="text-white">User Authentication</div>
                <div className="text-white/50 text-xs">OAuth2, JWT, Social Login</div>
              </div>
            </div>
            
            {/* Integration 2 */}
            <div className="bg-[#0d0e35] rounded-lg p-3 flex items-center">
              <div className="w-10 h-10 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
                💰
              </div>
              <div className="flex-1">
                <div className="text-white">Wallet & Payments</div>
                <div className="text-white/50 text-xs">BSN Transfers, In-App Purchases</div>
              </div>
            </div>
            
            {/* Integration 3 */}
            <div className="bg-[#0d0e35] rounded-lg p-3 flex items-center">
              <div className="w-10 h-10 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
                🎮
              </div>
              <div className="flex-1">
                <div className="text-white">Mini-Games</div>
                <div className="text-white/50 text-xs">Embed Games, Rewards Integration</div>
              </div>
            </div>
            
            {/* Integration 4 */}
            <div className="bg-[#0d0e35] rounded-lg p-3 flex items-center">
              <div className="w-10 h-10 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
                🖼️
              </div>
              <div className="flex-1">
                <div className="text-white">NFT Management</div>
                <div className="text-white/50 text-xs">Create, Transfer, Display NFTs</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Create App Button */}
        <div className="flex justify-center">
          <button className="bg-[#00a2ff]/20 border border-[#00a2ff]/40 text-[#00a2ff] px-4 py-2 rounded-full flex items-center">
            <span className="mr-2">➕</span> Create New App
          </button>
        </div>
      </div>
    </div>
  );
};

export default SdkDemo; 