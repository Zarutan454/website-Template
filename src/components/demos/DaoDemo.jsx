import React from 'react';

const DaoDemo = () => {
  return (
    <div className="w-full h-full bg-[#0d0e35] rounded-lg overflow-hidden">
      {/* App Header */}
      <div className="bg-[#0d0e35] p-3 flex items-center justify-between border-b border-[#00a2ff]/20">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#00a2ff]/30 flex items-center justify-center">
            👤
          </div>
          <div className="ml-3 text-[#00a2ff] font-bold">BSN DAO Governance</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#00a2ff]/20 flex items-center justify-center">
          ⚙️
        </div>
      </div>
      
      {/* App Body */}
      <div className="p-4 overflow-auto h-[calc(100%-48px)]">
        {/* Treasury Overview */}
        <div 
          className="rounded-lg p-4 mb-4"
          style={{
            background: 'linear-gradient(135deg, #0d0e35, rgba(0, 162, 255, 0.1))'
          }}
        >
          <div className="text-white/70">BSN DAO Treasury</div>
          <div className="text-white text-3xl font-bold my-2">2,450,000 BSN</div>
          <div className="text-white/70">≈ $1,225,000 USD</div>
          
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-[#06071F]/50 p-2 rounded-lg text-center">
              <div className="text-white/70 text-xs">Proposals</div>
              <div className="text-[#00a2ff] text-lg">24</div>
            </div>
            <div className="bg-[#06071F]/50 p-2 rounded-lg text-center">
              <div className="text-white/70 text-xs">Active Votes</div>
              <div className="text-[#00a2ff] text-lg">3</div>
            </div>
            <div className="bg-[#06071F]/50 p-2 rounded-lg text-center">
              <div className="text-white/70 text-xs">Your Voting Power</div>
              <div className="text-[#00a2ff] text-lg">1,250 BSN</div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-[#0d0e35] rounded mb-4 overflow-hidden">
          <div className="py-2 px-4 bg-[#00a2ff]/20 text-[#00a2ff] text-center flex-1">Active</div>
          <div className="py-2 px-4 text-white/70 text-center flex-1">Passed</div>
          <div className="py-2 px-4 text-white/70 text-center flex-1">Rejected</div>
          <div className="py-2 px-4 text-white/70 text-center flex-1">My Votes</div>
        </div>
        
        {/* Active Proposals */}
        <div className="space-y-4">
          {/* Proposal 1 */}
          <div className="bg-[#0d0e35] rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="bg-[#00a2ff]/20 text-[#00a2ff] text-xs px-2 py-1 rounded-full">BIP-42</div>
              <div className="text-white/50 text-xs">Ends in 2 days</div>
            </div>
            
            <div className="text-white font-medium mb-2">Implement Staking Rewards for BSN Token Holders</div>
            <div className="text-white/70 text-sm mb-4">
              Proposal to allocate 500,000 BSN from treasury for a 12-month staking rewards program with 15% APY.
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <div className="text-white/70">Current Votes</div>
                <div className="text-white/70">68% Yes • 32% No</div>
              </div>
              <div className="w-full h-2 bg-[#06071F] rounded-full overflow-hidden">
                <div className="h-full bg-[#00a2ff]" style={{ width: '68%' }}></div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="bg-[#00a2ff]/20 border border-[#00a2ff]/40 text-[#00a2ff] px-4 py-2 rounded-full flex-1">
                Vote Yes
              </button>
              <button className="bg-[#06071F] border border-white/10 text-white/70 px-4 py-2 rounded-full flex-1">
                Vote No
              </button>
            </div>
          </div>
          
          {/* Proposal 2 */}
          <div className="bg-[#0d0e35] rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="bg-[#00a2ff]/20 text-[#00a2ff] text-xs px-2 py-1 rounded-full">BIP-43</div>
              <div className="text-white/50 text-xs">Ends in 5 days</div>
            </div>
            
            <div className="text-white font-medium mb-2">Fund Community Developer Grants Program</div>
            <div className="text-white/70 text-sm mb-4">
              Allocate 250,000 BSN for grants to developers building applications on the BSN platform.
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <div className="text-white/70">Current Votes</div>
                <div className="text-white/70">82% Yes • 18% No</div>
              </div>
              <div className="w-full h-2 bg-[#06071F] rounded-full overflow-hidden">
                <div className="h-full bg-[#00a2ff]" style={{ width: '82%' }}></div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="bg-[#00a2ff]/20 border border-[#00a2ff]/40 text-[#00a2ff] px-4 py-2 rounded-full flex-1">
                Vote Yes
              </button>
              <button className="bg-[#06071F] border border-white/10 text-white/70 px-4 py-2 rounded-full flex-1">
                Vote No
              </button>
            </div>
          </div>
          
          {/* Proposal 3 */}
          <div className="bg-[#0d0e35] rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="bg-[#00a2ff]/20 text-[#00a2ff] text-xs px-2 py-1 rounded-full">BIP-44</div>
              <div className="text-white/50 text-xs">Ends in 7 days</div>
            </div>
            
            <div className="text-white font-medium mb-2">Increase Daily Mining Rewards Cap to 15 BSN</div>
            <div className="text-white/70 text-sm mb-4">
              Proposal to increase the daily mining rewards cap from 10 BSN to 15 BSN per user.
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <div className="text-white/70">Current Votes</div>
                <div className="text-white/70">45% Yes • 55% No</div>
              </div>
              <div className="w-full h-2 bg-[#06071F] rounded-full overflow-hidden">
                <div className="h-full bg-[#ff4d6a]" style={{ width: '55%' }}></div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="bg-[#06071F] border border-white/10 text-white/70 px-4 py-2 rounded-full flex-1">
                Vote Yes
              </button>
              <button className="bg-[#ff4d6a]/20 border border-[#ff4d6a]/40 text-[#ff4d6a] px-4 py-2 rounded-full flex-1">
                Vote No
              </button>
            </div>
          </div>
        </div>
        
        {/* Create Proposal Button */}
        <div className="mt-4 flex justify-center">
          <button className="bg-[#00a2ff]/20 border border-[#00a2ff]/40 text-[#00a2ff] px-4 py-2 rounded-full flex items-center">
            <span className="mr-2">📝</span> Create New Proposal
          </button>
        </div>
      </div>
    </div>
  );
};

export default DaoDemo; 