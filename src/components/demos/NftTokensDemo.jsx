import React, { useState } from 'react';

const NftTokensDemo = () => {
  const [activeTab, setActiveTab] = useState('collection');
  
  // Sample NFT data
  const nfts = [
    {
      id: 1,
      name: 'Cosmic Explorer #042',
      image: 'bg-gradient-to-br from-purple-500 to-blue-600',
      owner: 'You',
      price: '45.00 BSN',
      likes: 24
    },
    {
      id: 2,
      name: 'Digital Genesis #108',
      image: 'bg-gradient-to-br from-pink-500 to-orange-500',
      owner: 'You',
      price: '32.50 BSN',
      likes: 18
    },
    {
      id: 3,
      name: 'Neon Dreams #076',
      image: 'bg-gradient-to-br from-green-400 to-cyan-500',
      owner: 'You',
      price: '28.75 BSN',
      likes: 15
    },
    {
      id: 4,
      name: 'Abstract Mind #023',
      image: 'bg-gradient-to-br from-yellow-400 to-red-500',
      owner: 'CryptoCollector',
      price: '50.00 BSN',
      likes: 32
    }
  ];
  
  return (
    <div className="w-full max-w-md mx-auto bg-[#0a0b1f] rounded-lg overflow-hidden border border-[#00a2ff]/20">
      {/* Header */}
      <div className="bg-[#0d0e2c] px-4 py-3 border-b border-[#00a2ff]/20 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#00a2ff]/20 flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#00a2ff]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-white font-medium">NFT Gallery</span>
        </div>
        <button className="bg-[#00a2ff] hover:bg-[#33b5ff] text-white text-xs py-1 px-3 rounded-full transition-colors flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create NFT
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-[#00a2ff]/20">
        <button 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'collection' 
              ? 'text-[#00a2ff] border-b-2 border-[#00a2ff]' 
              : 'text-white/50 hover:text-white/80'
          }`}
          onClick={() => setActiveTab('collection')}
        >
          My Collection
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'marketplace' 
              ? 'text-[#00a2ff] border-b-2 border-[#00a2ff]' 
              : 'text-white/50 hover:text-white/80'
          }`}
          onClick={() => setActiveTab('marketplace')}
        >
          Marketplace
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'create' 
              ? 'text-[#00a2ff] border-b-2 border-[#00a2ff]' 
              : 'text-white/50 hover:text-white/80'
          }`}
          onClick={() => setActiveTab('create')}
        >
          Create
        </button>
      </div>
      
      {/* NFT Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {nfts.map(nft => (
            <div key={nft.id} className="bg-[#0d0e2c]/70 rounded-lg overflow-hidden border border-[#00a2ff]/10 hover:border-[#00a2ff]/30 transition-all">
              {/* NFT Image */}
              <div className={`aspect-square ${nft.image} flex items-center justify-center`}>
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                  </svg>
                </div>
              </div>
              
              {/* NFT Info */}
              <div className="p-3">
                <h3 className="text-white text-sm font-medium mb-1">{nft.name}</h3>
                <div className="flex justify-between items-center">
                  <div className="text-white/50 text-xs">Owner: {nft.owner}</div>
                  <div className="text-[#00a2ff] text-xs">{nft.price}</div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-between items-center mt-2">
                  <button className="text-white/50 hover:text-white text-xs flex items-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    {nft.likes}
                  </button>
                  <button className="text-[#00a2ff] hover:text-[#33b5ff] text-xs transition-colors">
                    {nft.owner === 'You' ? 'List for Sale' : 'Buy Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Create NFT Preview (when in create tab) */}
        {activeTab === 'create' && (
          <div className="mt-4 bg-[#0d0e2c]/70 rounded-lg p-4 border border-[#00a2ff]/20">
            <h3 className="text-white text-sm font-medium mb-3">Create New NFT</h3>
            
            <div className="mb-3">
              <label className="block text-white/70 text-xs mb-1">NFT Name</label>
              <input 
                type="text" 
                className="w-full bg-[#06071F] border border-[#00a2ff]/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00a2ff]/50"
                placeholder="Enter NFT name"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-white/70 text-xs mb-1">Description</label>
              <textarea 
                className="w-full bg-[#06071F] border border-[#00a2ff]/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00a2ff]/50 h-20 resize-none"
                placeholder="Describe your NFT"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-white/70 text-xs mb-1">Upload Image</label>
              <div className="border-2 border-dashed border-[#00a2ff]/30 rounded-lg p-4 flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#00a2ff]/50 mb-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p className="text-white/50 text-xs text-center">Drag and drop or click to upload</p>
              </div>
            </div>
            
            <button className="w-full bg-gradient-to-r from-[#00a2ff] to-[#0077ff] hover:from-[#33b5ff] hover:to-[#3390ff] text-white py-2 rounded-md text-sm font-medium transition-all">
              Create NFT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NftTokensDemo; 