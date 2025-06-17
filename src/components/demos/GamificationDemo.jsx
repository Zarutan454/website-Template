import React from 'react';

const GamificationDemo = () => {
  return (
    <div className="w-full h-full bg-[#0d0e35] rounded-lg overflow-hidden">
      {/* App Header */}
      <div className="bg-[#0d0e35] p-3 flex items-center justify-between border-b border-[#00a2ff]/20">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#00a2ff]/30 flex items-center justify-center">
            👤
          </div>
          <div className="ml-3 text-[#00a2ff] font-bold">BSN Achievements</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#00a2ff]/20 flex items-center justify-center">
          ⚙️
        </div>
      </div>
      
      {/* App Body */}
      <div className="p-4 overflow-auto h-[calc(100%-48px)]">
        {/* User Level */}
        <div 
          className="rounded-lg p-4 mb-4"
          style={{
            background: 'linear-gradient(135deg, #0d0e35, rgba(0, 162, 255, 0.1))'
          }}
        >
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-[#00a2ff]/20 border-2 border-[#00a2ff] flex items-center justify-center text-2xl mr-3">
              12
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">Level 12: Blockchain Pioneer</div>
              <div className="text-white/70 text-sm">4,250 / 5,000 XP to Level 13</div>
              <div className="w-full h-2 bg-[#06071F] rounded-full overflow-hidden mt-2">
                <div className="h-full bg-[#00a2ff]" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-[#0d0e35] rounded mb-4 overflow-hidden">
          <div className="py-2 px-4 bg-[#00a2ff]/20 text-[#00a2ff] text-center flex-1">Daily Missions</div>
          <div className="py-2 px-4 text-white/70 text-center flex-1">Achievements</div>
          <div className="py-2 px-4 text-white/70 text-center flex-1">Leaderboards</div>
          <div className="py-2 px-4 text-white/70 text-center flex-1">Rewards</div>
        </div>
        
        {/* Daily Missions */}
        <div className="space-y-3 mb-6">
          <div className="text-white font-medium mb-2">Daily Missions</div>
          
          {/* Mission 1 - Completed */}
          <div className="bg-[#0d0e35] rounded-lg p-3 flex items-center">
            <div className="w-10 h-10 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
              📝
            </div>
            <div className="flex-1">
              <div className="text-white">Create a post</div>
              <div className="text-white/50 text-xs">1/1 completed</div>
              <div className="w-full h-1.5 bg-[#06071F] rounded-full overflow-hidden mt-1">
                <div className="h-full bg-[#00a2ff]" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="text-[#00a2ff] font-medium">+50 XP</div>
            <div className="ml-3 text-green-400">✓</div>
          </div>
          
          {/* Mission 2 - In Progress */}
          <div className="bg-[#0d0e35] rounded-lg p-3 flex items-center">
            <div className="w-10 h-10 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
              💬
            </div>
            <div className="flex-1">
              <div className="text-white">Comment on 3 posts</div>
              <div className="text-white/50 text-xs">1/3 completed</div>
              <div className="w-full h-1.5 bg-[#06071F] rounded-full overflow-hidden mt-1">
                <div className="h-full bg-[#00a2ff]" style={{ width: '33%' }}></div>
              </div>
            </div>
            <div className="text-[#00a2ff] font-medium">+75 XP</div>
          </div>
          
          {/* Mission 3 - Not Started */}
          <div className="bg-[#0d0e35] rounded-lg p-3 flex items-center">
            <div className="w-10 h-10 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
              👥
            </div>
            <div className="flex-1">
              <div className="text-white">Invite a friend</div>
              <div className="text-white/50 text-xs">0/1 completed</div>
              <div className="w-full h-1.5 bg-[#06071F] rounded-full overflow-hidden mt-1">
                <div className="h-full bg-[#00a2ff]" style={{ width: '0%' }}></div>
              </div>
            </div>
            <div className="text-[#00a2ff] font-medium">+100 XP</div>
          </div>
        </div>
        
        {/* Achievements */}
        <div>
          <div className="text-white font-medium mb-2">Recent Achievements</div>
          
          <div className="grid grid-cols-3 gap-3">
            {/* Achievement 1 */}
            <div className="bg-[#0d0e35] rounded-lg p-3 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00a2ff] to-[#7000ff] mx-auto flex items-center justify-center text-xl">
                🚀
              </div>
              <div className="text-white text-sm mt-2">Early Adopter</div>
              <div className="text-[#00a2ff] text-xs">+200 XP</div>
            </div>
            
            {/* Achievement 2 */}
            <div className="bg-[#0d0e35] rounded-lg p-3 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00a2ff] to-[#00ff9d] mx-auto flex items-center justify-center text-xl">
                💯
              </div>
              <div className="text-white text-sm mt-2">100 Posts</div>
              <div className="text-[#00a2ff] text-xs">+150 XP</div>
            </div>
            
            {/* Achievement 3 */}
            <div className="bg-[#0d0e35] rounded-lg p-3 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00a2ff] to-[#ff4d6a] mx-auto flex items-center justify-center text-xl">
                🏆
              </div>
              <div className="text-white text-sm mt-2">Top Contributor</div>
              <div className="text-[#00a2ff] text-xs">+300 XP</div>
            </div>
            
            {/* Achievement 4 - Locked */}
            <div className="bg-[#0d0e35] rounded-lg p-3 text-center opacity-50">
              <div className="w-12 h-12 rounded-full bg-[#06071F] mx-auto flex items-center justify-center text-xl">
                🔒
              </div>
              <div className="text-white text-sm mt-2">1000 Followers</div>
              <div className="text-[#00a2ff] text-xs">+500 XP</div>
            </div>
            
            {/* Achievement 5 - Locked */}
            <div className="bg-[#0d0e35] rounded-lg p-3 text-center opacity-50">
              <div className="w-12 h-12 rounded-full bg-[#06071F] mx-auto flex items-center justify-center text-xl">
                🔒
              </div>
              <div className="text-white text-sm mt-2">NFT Creator</div>
              <div className="text-[#00a2ff] text-xs">+250 XP</div>
            </div>
            
            {/* Achievement 6 - Locked */}
            <div className="bg-[#0d0e35] rounded-lg p-3 text-center opacity-50">
              <div className="w-12 h-12 rounded-full bg-[#06071F] mx-auto flex items-center justify-center text-xl">
                🔒
              </div>
              <div className="text-white text-sm mt-2">DAO Voter</div>
              <div className="text-[#00a2ff] text-xs">+200 XP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationDemo; 