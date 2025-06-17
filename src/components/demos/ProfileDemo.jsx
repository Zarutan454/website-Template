import React, { useState } from 'react';

const ProfileDemo = () => {
  const [activeTab, setActiveTab] = useState('posts');
  
  // Sample profile data
  const profile = {
    name: 'Alex Blockchain',
    username: '@alexblockchain',
    bio: 'Blockchain developer & enthusiast | Building the decentralized future | BSN early adopter',
    followers: 1248,
    following: 356,
    posts: 87,
    joined: 'March 2023',
    location: 'Berlin, Germany',
    website: 'alexblockchain.dev',
    coverImage: 'bg-gradient-to-r from-blue-600 to-purple-600',
    avatar: 'https://i.pravatar.cc/150?img=3'
  };
  
  // Sample posts data
  const posts = [
    {
      id: 1,
      content: 'Just deployed my first smart contract on BSN testnet! The developer experience is amazing. #BSN #Blockchain #Web3',
      likes: 42,
      comments: 7,
      time: '2h ago',
      hasImage: false
    },
    {
      id: 2,
      content: 'Check out my new NFT collection "Digital Dreamscapes" - now available on the BSN marketplace!',
      likes: 28,
      comments: 3,
      time: '1d ago',
      hasImage: true
    },
    {
      id: 3,
      content: 'Excited to be speaking at the upcoming BSN Developer Conference next month. Who else is attending? Let\'s connect!',
      likes: 35,
      comments: 12,
      time: '3d ago',
      hasImage: false
    }
  ];
  
  return (
    <div className="w-full max-w-md mx-auto bg-[#0a0b1f] rounded-lg overflow-hidden border border-[#00a2ff]/20">
      {/* Cover Image */}
      <div className={`h-24 ${profile.coverImage} relative`}>
        {/* Profile Options */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <button className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Profile Info */}
      <div className="px-4 pt-12 pb-4 relative">
        {/* Avatar */}
        <div className="absolute -top-8 left-4 w-16 h-16 rounded-full border-4 border-[#0a0b1f] overflow-hidden bg-[#0d0e2c]">
          <div className="w-full h-full bg-[#00a2ff]/20 flex items-center justify-center text-[#00a2ff] text-xl font-bold">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile.name.charAt(0)
            )}
          </div>
        </div>
        
        {/* Follow Button */}
        <div className="absolute top-4 right-4">
          <button className="bg-[#00a2ff] hover:bg-[#33b5ff] text-white text-xs py-1 px-4 rounded-full transition-colors">
            Follow
          </button>
        </div>
        
        {/* Profile Details */}
        <div className="mb-4">
          <h2 className="text-white text-lg font-medium">{profile.name}</h2>
          <p className="text-white/50 text-sm">{profile.username}</p>
          <p className="text-white/80 text-sm mt-2">{profile.bio}</p>
        </div>
        
        {/* Profile Stats */}
        <div className="flex space-x-4 mb-4">
          <div className="flex items-center text-sm">
            <span className="text-white font-medium">{profile.followers}</span>
            <span className="text-white/50 ml-1">Followers</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-white font-medium">{profile.following}</span>
            <span className="text-white/50 ml-1">Following</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-white font-medium">{profile.posts}</span>
            <span className="text-white/50 ml-1">Posts</span>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="flex flex-wrap text-xs text-white/50 space-x-4">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{profile.location}</span>
          </div>
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            <span>{profile.website}</span>
          </div>
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>Joined {profile.joined}</span>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-[#00a2ff]/20">
        <button 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'posts' 
              ? 'text-[#00a2ff] border-b-2 border-[#00a2ff]' 
              : 'text-white/50 hover:text-white/80'
          }`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'media' 
              ? 'text-[#00a2ff] border-b-2 border-[#00a2ff]' 
              : 'text-white/50 hover:text-white/80'
          }`}
          onClick={() => setActiveTab('media')}
        >
          Media
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'nfts' 
              ? 'text-[#00a2ff] border-b-2 border-[#00a2ff]' 
              : 'text-white/50 hover:text-white/80'
          }`}
          onClick={() => setActiveTab('nfts')}
        >
          NFTs
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'activity' 
              ? 'text-[#00a2ff] border-b-2 border-[#00a2ff]' 
              : 'text-white/50 hover:text-white/80'
          }`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-[#0d0e2c]/70 rounded-lg p-4">
                <div className="text-white/90 text-sm mb-3">{post.content}</div>
                
                {post.hasImage && (
                  <div className="mb-3 rounded-md overflow-hidden bg-[#00a2ff]/10 h-32 flex items-center justify-center">
                    <div className="text-[#00a2ff]/30 text-xs">Image Content</div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-white/50">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center hover:text-[#00a2ff] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center hover:text-[#00a2ff] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                      </svg>
                      <span>{post.comments}</span>
                    </button>
                  </div>
                  <div className="text-white/50">{post.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'media' && (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square bg-[#0d0e2c] rounded-md overflow-hidden flex items-center justify-center">
                <div className="text-[#00a2ff]/30 text-xs">Media {i}</div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'nfts' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#00a2ff]/10 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#00a2ff]/50" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
              </svg>
            </div>
            <h3 className="text-white text-sm font-medium mb-1">No NFTs Yet</h3>
            <p className="text-white/50 text-xs mb-4">Start collecting or creating NFTs to display them on your profile</p>
            <button className="bg-[#00a2ff]/20 hover:bg-[#00a2ff]/30 text-[#00a2ff] text-xs py-2 px-4 rounded transition-colors">
              Explore NFTs
            </button>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="space-y-3">
            {[
              { type: 'follow', user: 'CryptoEmma', time: '2h ago' },
              { type: 'like', user: 'BlockchainBob', content: 'your post about smart contracts', time: '1d ago' },
              { type: 'comment', user: 'Web3Developer', content: 'your NFT collection', time: '2d ago' },
              { type: 'mint', content: 'Digital Dreamscapes #042', time: '3d ago' },
              { type: 'reward', amount: '5 BSN', reason: 'daily mining', time: '3d ago' }
            ].map((activity, i) => (
              <div key={i} className="bg-[#0d0e2c]/70 rounded-lg p-3 flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#00a2ff]/20 flex items-center justify-center mr-3">
                  {activity.type === 'follow' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#00a2ff]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                  )}
                  {activity.type === 'like' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#00a2ff]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                  )}
                  {activity.type === 'comment' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#00a2ff]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                    </svg>
                  )}
                  {activity.type === 'mint' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#00a2ff]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                    </svg>
                  )}
                  {activity.type === 'reward' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#00a2ff]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white">
                    {activity.type === 'follow' && (
                      <span><span className="text-[#00a2ff]">{activity.user}</span> followed you</span>
                    )}
                    {activity.type === 'like' && (
                      <span><span className="text-[#00a2ff]">{activity.user}</span> liked {activity.content}</span>
                    )}
                    {activity.type === 'comment' && (
                      <span><span className="text-[#00a2ff]">{activity.user}</span> commented on {activity.content}</span>
                    )}
                    {activity.type === 'mint' && (
                      <span>You minted <span className="text-[#00a2ff]">{activity.content}</span></span>
                    )}
                    {activity.type === 'reward' && (
                      <span>You earned <span className="text-[#00a2ff]">{activity.amount}</span> from {activity.reason}</span>
                    )}
                  </div>
                  <div className="text-xs text-white/50">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDemo; 