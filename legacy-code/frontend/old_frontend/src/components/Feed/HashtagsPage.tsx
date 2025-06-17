
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, Search, Filter, TrendingUp, MessageSquare, Users, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHashtags } from '@/hooks/useHashtags';

const HashtagsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { 
    trendingHashtags, 
    isLoading, 
    error 
  } = useHashtags();
  
  const categories = [
    'Alle',
    'Krypto',
    'DeFi',
    'NFTs',
    'Trading',
    'Mining',
    'Metaverse',
    'Gaming'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-200 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white mr-4">
            <Hash size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Hashtags</h1>
            <p className="text-gray-400">Entdecke und folge Themen, die dich interessieren</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Hashtags durchsuchen..."
              className="w-full bg-dark-100 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <button 
            className="px-4 py-2 bg-dark-100 rounded-lg text-white flex items-center hover:bg-dark-300 transition-colors"
          >
            <Filter size={18} className="mr-2" />
            Filter
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-100 text-gray-400 hover:text-white'
              }`}
              onClick={() => setSelectedCategory(category === 'Alle' ? null : category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Hashtag Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 text-center py-10">
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span>Hashtags werden geladen...</span>
            </div>
          </div>
        ) : error ? (
          <div className="col-span-3 text-center py-10">
            <div className="text-red-400">{error.toString()}</div>
          </div>
        ) : trendingHashtags.length > 0 ? (
          trendingHashtags.map((hashtag, index) => (
            <motion.div
              key={index}
              className="bg-dark-200 rounded-xl border border-gray-800 p-6 hover:border-primary-500/30 transition-all"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <Link 
                  to={`/feed/hashtag/${hashtag.name.substring(1)}`}
                  className="text-xl font-bold text-white hover:text-primary-400 transition-colors"
                >
                  {hashtag.name}
                </Link>
                <span className="text-green-400 text-sm font-medium">+{Math.floor(Math.random() * 30)}%</span>
              </div>
              
              <p className="text-gray-400 text-sm mb-4">
                {hashtag.name.startsWith('#') ? `Diskussionen über ${hashtag.name}` : `Diskussionen über #${hashtag.name}`}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-400">
                  <MessageSquare size={14} className="mr-1" />
                  {hashtag.post_count} Posts
                </div>
                <div className="flex items-center text-gray-400">
                  <Users size={14} className="mr-1" />
                  {Math.floor(hashtag.post_count / 2.5)} Nutzer
                </div>
                <div className="flex items-center text-gray-400">
                  <TrendingUp size={14} className="mr-1" />
                  Trending
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-3 text-center py-10">
            <div className="text-gray-400">Keine Hashtags gefunden</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HashtagsPage;
