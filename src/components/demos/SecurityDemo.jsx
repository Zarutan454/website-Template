import React from 'react';

const SecurityDemo = () => {
  return (
    <div className="w-full h-full bg-[#0d0e35] rounded-lg overflow-hidden">
      {/* App Header */}
      <div className="bg-[#0d0e35] p-3 flex items-center justify-between border-b border-[#00a2ff]/20">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#00a2ff]/30 flex items-center justify-center">
            👤
          </div>
          <div className="ml-3 text-[#00a2ff] font-bold">BSN Security Center</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#00a2ff]/20 flex items-center justify-center">
          ⚙️
        </div>
      </div>
      
      {/* App Body */}
      <div className="p-4 overflow-auto h-[calc(100%-48px)]">
        {/* Security Status */}
        <div 
          className="rounded-lg p-4 mb-4"
          style={{
            background: 'linear-gradient(135deg, #0d0e35, rgba(0, 162, 255, 0.1))'
          }}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#00a2ff]/20 flex items-center justify-center text-2xl mr-3">
              🔒
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">Account Security Status</div>
              <div className="text-[#00ff9d] text-sm">Strong • 95/100</div>
              <div className="w-full h-2 bg-[#06071F] rounded-full overflow-hidden mt-2">
                <div className="h-full bg-[#00ff9d]" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-[#0d0e35] rounded mb-4 overflow-hidden">
          <div className="py-2 px-4 bg-[#00a2ff]/20 text-[#00a2ff] text-center flex-1">Security</div>
          <div className="py-2 px-4 text-white/70 text-center flex-1">Privacy</div>
          <div className="py-2 px-4 text-white/70 text-center flex-1">Activity</div>
          <div className="py-2 px-4 text-white/70 text-center flex-1">Data</div>
        </div>
        
        {/* Security Features */}
        <div className="space-y-3 mb-6">
          {/* 2FA */}
          <div className="bg-[#0d0e35] rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
                  🔑
                </div>
                <div>
                  <div className="text-white">Two-Factor Authentication</div>
                  <div className="text-white/50 text-xs">Additional security layer for your account</div>
                </div>
              </div>
              <div className="w-12 h-6 bg-[#00a2ff]/30 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-[#00a2ff] rounded-full"></div>
              </div>
            </div>
            <div className="bg-[#06071F]/50 p-2 rounded text-white/70 text-xs mt-2">
              2FA is enabled via Authenticator App
            </div>
          </div>
          
          {/* Email Verification */}
          <div className="bg-[#0d0e35] rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
                  ✉️
                </div>
                <div>
                  <div className="text-white">Email Verification</div>
                  <div className="text-white/50 text-xs">Verify your email address</div>
                </div>
              </div>
              <div className="bg-[#00ff9d]/20 text-[#00ff9d] text-xs px-2 py-1 rounded">
                Verified
              </div>
            </div>
          </div>
          
          {/* Password Strength */}
          <div className="bg-[#0d0e35] rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
                  🔐
                </div>
                <div>
                  <div className="text-white">Password Strength</div>
                  <div className="text-white/50 text-xs">Strong password increases security</div>
                </div>
              </div>
              <div className="text-[#00ff9d]">Strong</div>
            </div>
            <div className="w-full h-2 bg-[#06071F] rounded-full overflow-hidden">
              <div className="h-full bg-[#00ff9d]" style={{ width: '90%' }}></div>
            </div>
          </div>
          
          {/* Recovery Options */}
          <div className="bg-[#0d0e35] rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
                  🔄
                </div>
                <div>
                  <div className="text-white">Recovery Options</div>
                  <div className="text-white/50 text-xs">Methods to recover your account</div>
                </div>
              </div>
              <button className="bg-[#00a2ff]/20 text-[#00a2ff] text-xs px-2 py-1 rounded">
                Manage
              </button>
            </div>
          </div>
        </div>
        
        {/* Privacy Settings */}
        <div className="mb-4">
          <div className="text-white font-medium mb-3">Privacy Settings</div>
          
          <div className="space-y-3">
            {/* Profile Visibility */}
            <div className="bg-[#0d0e35] rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
                    👁️
                  </div>
                  <div>
                    <div className="text-white">Profile Visibility</div>
                    <div className="text-white/50 text-xs">Who can see your profile</div>
                  </div>
                </div>
                <select className="bg-[#06071F] border border-[#00a2ff]/20 text-white rounded px-2 py-1 text-sm">
                  <option>Everyone</option>
                  <option>Friends Only</option>
                  <option>Private</option>
                </select>
              </div>
            </div>
            
            {/* Data Usage */}
            <div className="bg-[#0d0e35] rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
                    📊
                  </div>
                  <div>
                    <div className="text-white">Data Usage & Analytics</div>
                    <div className="text-white/50 text-xs">How your data is used</div>
                  </div>
                </div>
                <div className="w-12 h-6 bg-[#06071F] rounded-full relative">
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white/30 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* GDPR Compliance */}
            <div className="bg-[#0d0e35] rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-[#00a2ff]/20 flex items-center justify-center text-xl mr-3">
                    📝
                  </div>
                  <div>
                    <div className="text-white">GDPR Data Request</div>
                    <div className="text-white/50 text-xs">Download or delete your data</div>
                  </div>
                </div>
                <button className="bg-[#00a2ff]/20 text-[#00a2ff] text-xs px-2 py-1 rounded">
                  Request
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Security Tips */}
        <div className="bg-[#0d0e35] rounded-lg p-3">
          <div className="text-white font-medium mb-2">Security Tips</div>
          <ul className="text-white/70 text-sm space-y-2">
            <li className="flex items-start">
              <div className="text-[#00a2ff] mr-2">•</div>
              <div>Never share your password or recovery phrases with anyone.</div>
            </li>
            <li className="flex items-start">
              <div className="text-[#00a2ff] mr-2">•</div>
              <div>Enable 2FA for all your crypto accounts.</div>
            </li>
            <li className="flex items-start">
              <div className="text-[#00a2ff] mr-2">•</div>
              <div>Regularly check your account activity for suspicious actions.</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SecurityDemo; 