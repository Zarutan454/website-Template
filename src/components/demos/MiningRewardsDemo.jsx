import React, { useState, useEffect } from 'react';

const MiningRewardsDemo = () => {
  const [miningRate, setMiningRate] = useState(0.12);
  const [totalMined, setTotalMined] = useState(5.87);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [isBoostActive, setIsBoostActive] = useState(false);
  const [boostTimeLeft, setBoostTimeLeft] = useState(0);
  
  // Simulate mining progress
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalMined(prev => {
        if (prev < dailyLimit) {
          return +(prev + (isBoostActive ? miningRate * 2 : miningRate) / 60).toFixed(2);
        }
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [miningRate, dailyLimit, isBoostActive]);
  
  // Simulate boost timer
  useEffect(() => {
    if (isBoostActive && boostTimeLeft > 0) {
      const timer = setTimeout(() => {
        setBoostTimeLeft(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (isBoostActive && boostTimeLeft === 0) {
      setIsBoostActive(false);
    }
  }, [isBoostActive, boostTimeLeft]);
  
  const activateBoost = () => {
    setIsBoostActive(true);
    setBoostTimeLeft(300); // 5 minutes boost
  };
  
  return (
    <div className="w-full max-w-md mx-auto bg-[#0a0b1f] rounded-lg overflow-hidden border border-[#00a2ff]/20">
      {/* Header */}
      <div className="bg-[#0d0e2c] px-4 py-3 border-b border-[#00a2ff]/20 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#00a2ff]/20 flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#00a2ff]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-white font-medium">Mining Rewards</span>
        </div>
        <div className="text-xs text-white/50 flex items-center">
          <span className="mr-1">Daily Reset:</span>
          <span className="text-[#00a2ff]">05:32:18</span>
        </div>
      </div>
      
      {/* Mining Status */}
      <div className="p-4 bg-gradient-to-br from-[#00a2ff]/10 to-[#0077ff]/5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white text-lg">Today's Mining</div>
          <div className="flex items-center">
            <span className="text-white/70 text-sm mr-1">Status:</span>
            <span className="text-green-500 text-sm">Active</span>
          </div>
        </div>
        
        <div className="bg-[#0d0e2c]/70 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-white/70">Mining Rate:</div>
            <div className="text-[#00a2ff] font-medium">
              {isBoostActive ? (miningRate * 2).toFixed(2) : miningRate.toFixed(2)} BSN/hr
              {isBoostActive && (
                <span className="ml-1 text-xs text-yellow-400">(Boosted!)</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="text-white/70">Total Mined:</div>
            <div className="text-white font-medium">{totalMined.toFixed(2)} / {dailyLimit} BSN</div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-2 bg-[#06071F] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#00a2ff] to-[#0077ff]"
              style={{ width: `${(totalMined / dailyLimit) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Boost section */}
        <div className="bg-[#0d0e2c]/70 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white">Mining Boosts</div>
            <div className={`text-xs px-2 py-1 rounded ${isBoostActive ? 'bg-yellow-500/20 text-yellow-400' : 'bg-[#00a2ff]/20 text-[#00a2ff]'}`}>
              {isBoostActive ? `Active (${Math.floor(boostTimeLeft / 60)}:${boostTimeLeft % 60 < 10 ? '0' : ''}${boostTimeLeft % 60})` : 'Available'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
                isBoostActive 
                  ? 'bg-yellow-500/20 border border-yellow-500/30' 
                  : 'bg-[#00a2ff]/10 border border-[#00a2ff]/20 hover:bg-[#00a2ff]/20'
              }`}
              onClick={activateBoost}
              disabled={isBoostActive}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 mb-2 ${isBoostActive ? 'text-yellow-400' : 'text-[#00a2ff]'}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              <span className={`text-sm ${isBoostActive ? 'text-yellow-400' : 'text-white'}`}>2x Mining Boost</span>
              <span className="text-xs text-white/50">5 minutes</span>
            </button>
            
            <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#0d0e2c] border border-[#00a2ff]/10 hover:bg-[#00a2ff]/10 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mb-2 text-[#00a2ff]/70" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span className="text-sm text-white">Invite Friends</span>
              <span className="text-xs text-white/50">+1 BSN per invite</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mining History */}
      <div className="p-4 border-t border-[#00a2ff]/20">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white text-sm">Mining History</div>
          <button className="text-xs text-[#00a2ff]">View All</button>
        </div>
        
        <div className="space-y-2">
          {[
            { day: 'Yesterday', amount: 9.45 },
            { day: 'Jun 12', amount: 8.72 },
            { day: 'Jun 11', amount: 10.00 }
          ].map((entry, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[#00a2ff]/10">
              <div className="text-white/70 text-sm">{entry.day}</div>
              <div className="text-white text-sm">{entry.amount.toFixed(2)} BSN</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MiningRewardsDemo; 