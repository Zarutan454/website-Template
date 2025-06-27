import React, { useState } from 'react';
import { useDjangoFeed } from '@/hooks/feed/useDjangoFeed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Trash2, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Beispiel-Komponente für die Verwendung des Django Feed-Hooks
 * 
 * ALT (Supabase):
 * const { data: posts } = useSupabaseQuery('posts');
 * 
 * NEU (Django):
 * const { posts, isLoading, toggleLike, createPost } = useDjangoFeed();
 */
const DjangoFeedExample: React.FC = () => {
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedFeedType, setSelectedFeedType] = useState<'recent' | 'popular' | 'trending'>('recent');

  const {
    posts,
    isLoading,
    error,
    hasMore,
    isRefreshing,
    fetchPosts,
    loadMore,
    refresh,
    toggleLike,
    createPost,
    deletePost,
    sharePost,
    reportPost
  } = useDjangoFeed({
    feedType: selectedFeedType,
    enableAutoRefresh: true,
    refreshInterval: 120000
  });

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast.error('Bitte gib einen Inhalt ein');
      return;
    }

    const result = await createPost(newPostContent);
    if (result) {
      setNewPostContent('');
    }
  };

  const handleLike = async (postId: string) => {
    await toggleLike(postId);
  };

  const handleDelete = async (postId: string) => {
    const confirmed = window.confirm('Möchtest du diesen Beitrag wirklich löschen?');
    if (confirmed) {
      await deletePost(postId);
    }
  };

  const handleShare = async (postId: string) => {
    await sharePost(postId, 'clipboard');
  };

  const handleReport = async (postId: string) => {
    const reason = prompt('Grund für die Meldung:');
    if (reason) {
      await reportPost(postId, reason);
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Fehler: {error}</p>
            <Button onClick={refresh} variant="outline" className="mt-2">
              Erneut versuchen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Feed Type Selector */}
      <div className="flex gap-2">
        <Button
          variant={selectedFeedType === 'recent' ? 'default' : 'outline'}
          onClick={() => setSelectedFeedType('recent')}
        >
          Neueste
        </Button>
        <Button
          variant={selectedFeedType === 'popular' ? 'default' : 'outline'}
          onClick={() => setSelectedFeedType('popular')}
        >
          Beliebte
        </Button>
        <Button
          variant={selectedFeedType === 'trending' ? 'default' : 'outline'}
          onClick={() => setSelectedFeedType('trending')}
        >
          Trend
        </Button>
      </div>

      {/* Create Post */}
      <Card>
        <CardHeader>
          <CardTitle>Neuer Beitrag</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Was möchtest du teilen?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreatePost()}
          />
          <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
            Beitrag erstellen
          </Button>
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <Button onClick={refresh} disabled={isRefreshing}>
          {isRefreshing ? 'Aktualisiere...' : 'Aktualisieren'}
        </Button>
        {hasMore && (
          <Button onClick={loadMore} variant="outline">
            Mehr laden
          </Button>
        )}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {isLoading && posts.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Lade Beiträge...</p>
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Noch keine Beiträge vorhanden</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {post.author.avatar_url ? (
                      <img
                        src={post.author.avatar_url}
                        alt={post.author.display_name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {post.author.display_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{post.author.display_name}</p>
                      <p className="text-sm text-gray-500">@{post.author.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(post.id)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReport(post.id)}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    {post.author.id === 'current-user-id' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="mb-4">{post.content}</p>
                
                {post.media_url && (
                  <div className="mb-4">
                    {post.media_type?.startsWith('image') ? (
                      <img
                        src={post.media_url}
                        alt="Post media"
                        className="rounded-lg max-w-full"
                      />
                    ) : post.media_type?.startsWith('video') ? (
                      <video
                        src={post.media_url}
                        controls
                        className="rounded-lg max-w-full"
                      />
                    ) : null}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-1 ${
                        post.is_liked_by_user ? 'text-red-500' : ''
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.is_liked_by_user ? 'fill-current' : ''}`} />
                      <span>{post.likes_count}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments_count}</span>
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button onClick={loadMore} variant="outline" disabled={isLoading}>
            {isLoading ? 'Lade...' : 'Mehr Beiträge laden'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DjangoFeedExample; 
