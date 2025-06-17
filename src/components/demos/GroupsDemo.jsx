import React from 'react';

const GroupsDemo = () => {
  return (
    <div className="w-full h-full bg-[#0d0e35] rounded-lg overflow-hidden">
      {/* App Header */}
      <div className="bg-[#0d0e35] p-3 flex items-center justify-between border-b border-[#00a2ff]/20">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#00a2ff]/30 flex items-center justify-center">
            👤
          </div>
          <div className="ml-3 text-[#00a2ff] font-bold">BSN Groups</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#00a2ff]/20 flex items-center justify-center">
          ⚙️
        </div>
      </div>
      
      {/* App Body */}
      <div className="p-4 overflow-auto h-[calc(100%-48px)]">
        {/* Search */}
        <div className="relative mb-4">
          <input 
            type="text" 
            placeholder="Search groups..." 
            className="w-full bg-[#06071F] border border-[#00a2ff]/20 rounded-full py-2 px-4 text-white focus:outline-none focus:border-[#00a2ff]/50"
          />
          <div className="absolute right-3 top-2.5 text-white/50">🔍</div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-[#0d0e35] rounded mb-4 overflow-hidden">
          <div className="py-2 px-4 bg-[#00a2ff]/20 text-[#00a2ff] text-center flex-1">My Groups</div>
          <div className="py-2 px-4 text-white/70 text-center flex-1">Discover</div>
          <div className="py-2 px-4 text-white/70 text-center flex-1">Invites</div>
        </div>
        
        {/* Group List */}
        <div className="space-y-3">
          {/* Group 1 */}
          <div className="bg-[#0d0e35] rounded-lg p-3 flex items-center">
            <div className="w-12 h-12 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
              🚀
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">BSN Early Adopters</div>
              <div className="text-white/50 text-xs">8,245 members • 12 new posts</div>
            </div>
            <div className="bg-[#00a2ff]/30 text-[#00a2ff] text-xs px-2 py-1 rounded">Admin</div>
          </div>
          
          {/* Group 2 */}
          <div className="bg-[#0d0e35] rounded-lg p-3 flex items-center">
            <div className="w-12 h-12 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
              👩‍💻
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">Blockchain Developers</div>
              <div className="text-white/50 text-xs">12,421 members • 35 new posts</div>
            </div>
            <div className="bg-[#00a2ff]/10 text-[#00a2ff] text-xs px-2 py-1 rounded">Member</div>
          </div>
          
          {/* Group 3 - Token Gated */}
          <div className="bg-[#0d0e35] rounded-lg p-3 flex items-center">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00a2ff]/30 to-[#7000ff]/30 flex items-center justify-center text-xl mr-3">
              🔒
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="text-white font-medium">BSN VIP Club</div>
                <div className="ml-2 bg-gradient-to-r from-[#00a2ff] to-[#7000ff] text-white text-xs px-2 py-0.5 rounded-full">
                  Token Gated
                </div>
              </div>
              <div className="text-white/50 text-xs">1,024 members • 8 new posts</div>
            </div>
            <div className="bg-[#00a2ff]/10 text-[#00a2ff] text-xs px-2 py-1 rounded">Member</div>
          </div>
          
          {/* Group 4 */}
          <div className="bg-[#0d0e35] rounded-lg p-3 flex items-center">
            <div className="w-12 h-12 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
              🎮
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">GameFi Enthusiasts</div>
              <div className="text-white/50 text-xs">5,672 members • 24 new posts</div>
            </div>
            <div className="bg-[#00a2ff]/10 text-[#00a2ff] text-xs px-2 py-1 rounded">Member</div>
          </div>
          
          {/* Group 5 */}
          <div className="bg-[#0d0e35] rounded-lg p-3 flex items-center">
            <div className="w-12 h-12 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
              🎨
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">NFT Artists</div>
              <div className="text-white/50 text-xs">3,891 members • 17 new posts</div>
            </div>
            <div className="bg-[#00a2ff]/10 text-[#00a2ff] text-xs px-2 py-1 rounded">Member</div>
          </div>
        </div>
        
        {/* Create Group Button */}
        <div className="mt-4 flex justify-center">
          <button className="bg-[#00a2ff]/20 border border-[#00a2ff]/40 text-[#00a2ff] px-4 py-2 rounded-full flex items-center">
            <span className="mr-2">➕</span> Create New Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupsDemo; 