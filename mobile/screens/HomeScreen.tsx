import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Post {
  id: number;
  content: string;
  author: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  likes_count: number;
  comments_count: number;
  created_at: string;
  media_url?: string;
}

const HomeScreen = ({ navigation }: any) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      // In a real app, this would be an API call
      const mockPosts: Post[] = [
        {
          id: 1,
          content: 'Willkommen bei BSN! 🚀 Die Zukunft der sozialen Blockchain-Plattform beginnt hier.',
          author: {
            username: 'bsn_official',
            display_name: 'BSN Official',
            avatar_url: 'https://via.placeholder.com/40',
          },
          likes_count: 42,
          comments_count: 8,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          content: 'Erste Erfahrungen mit dem Mining-System - sehr beeindruckend! 💎',
          author: {
            username: 'crypto_enthusiast',
            display_name: 'Crypto Enthusiast',
            avatar_url: 'https://via.placeholder.com/40',
          },
          likes_count: 15,
          comments_count: 3,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      
      setPosts(mockPosts);
    } catch (error) {
      Alert.alert('Fehler', 'Posts konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postContainer}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      <View style={styles.postHeader}>
        <Image
          source={{ uri: item.author.avatar_url || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.postHeaderText}>
          <Text style={styles.authorName}>{item.author.display_name}</Text>
          <Text style={styles.postTime}>
            {new Date(item.created_at).toLocaleDateString('de-DE')}
          </Text>
        </View>
      </View>
      
      <Text style={styles.postContent}>{item.content}</Text>
      
      {item.media_url && (
        <Image source={{ uri: item.media_url }} style={styles.postImage} />
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{item.likes_count}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{item.comments_count}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>BSN Feed</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Lade Posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderText: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  postTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen; 