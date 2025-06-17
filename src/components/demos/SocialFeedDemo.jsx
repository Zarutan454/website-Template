import React from 'react';

const SocialFeedDemo = () => {
  // Sample posts data
  const posts = [
    {
      id: 1,
      author: 'Alex Blockchain',
      avatar: 'https://i.pravatar.cc/150?img=1',
      content: 'Just published my thoughts on the future of decentralized social media! #BSN #Web3 #Decentralization',
      likes: 42,
      comments: 7,
      time: '2h ago',
      hasImage: true
    },
    {
      id: 2,
      author: 'Crypto Emma',
      avatar: 'https://i.pravatar.cc/150?img=5',
      content: 'Mining rewards are getting better every day! Already earned 5 BSN tokens today just by being active. 🚀',
      likes: 28,
      comments: 3,
      time: '4h ago',
      hasImage: false
    },
    {
      id: 3,
      author: 'Web3 Developer',
      avatar: 'https://i.pravatar.cc/150?img=8',
      content: 'Building my first dApp on BSN. The developer SDK is amazing! Anyone want to collaborate? #BSNdevelopers',
      likes: 35,
      comments: 12,
      time: '6h ago',
      hasImage: false
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-[#0a0b1f] rounded-lg overflow-hidden border border-[#00a2ff]/20">
      {/* Header */}
      <div className="bg-[#0d0e2c] px-4 py-3 border-b border-[#00a2ff]/20 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#00a2ff]/20 flex items-center justify-center mr-2">
            <span className="text-[#00a2ff] text-xs">BSN</span>
          </div>
          <span className="text-white font-medium">Feed</span>
        </div>
        <div className="flex space-x-3">
          <button className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Feed content */}
      <div className="divide-y divide-[#00a2ff]/10">
        {posts.map(post => (
          <div key={post.id} className="p-4">
            {/* Post header */}
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-[#00a2ff]/30">
                <div className="w-full h-full bg-[#00a2ff]/20 flex items-center justify-center">
                  <span className="text-[#00a2ff] text-xs">{post.author.charAt(0)}</span>
                </div>
              </div>
              <div>
                <div className="text-white font-medium text-sm">{post.author}</div>
                <div className="text-white/50 text-xs">{post.time}</div>
              </div>
            </div>
            
            {/* Post content */}
            <div className="text-white/90 text-sm mb-3">{post.content}</div>
            
            {/* Post image (if any) */}
            {post.hasImage && (
              <div className="mb-3 rounded-md overflow-hidden bg-[#00a2ff]/10 h-32 flex items-center justify-center">
                <div className="text-[#00a2ff]/30 text-xs">Image Content</div>
              </div>
            )}
            
            {/* Post actions */}
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
              <div className="flex items-center space-x-2">
                <button className="flex items-center hover:text-[#00a2ff] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="flex items-center hover:text-[#00a2ff] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="bg-[#0d0e2c] px-4 py-3 border-t border-[#00a2ff]/20 flex items-center">
        <div className="flex-1 bg-[#06071F] rounded-full px-4 py-2 border border-[#00a2ff]/20 text-white/50 text-sm">
          What's on your mind?
        </div>
        <button className="ml-3 w-8 h-8 rounded-full bg-[#00a2ff]/20 flex items-center justify-center text-[#00a2ff] hover:bg-[#00a2ff]/30 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SocialFeedDemo;