export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          check_function: string
          created_at: string | null
          description: string
          estimated_duration: string
          icon_name: string
          id: string
          required_value: number
          title: string
          token_reward: number
          value_type: string
        }
        Insert: {
          category: string
          check_function: string
          created_at?: string | null
          description: string
          estimated_duration: string
          icon_name: string
          id: string
          required_value: number
          title: string
          token_reward: number
          value_type: string
        }
        Update: {
          category?: string
          check_function?: string
          created_at?: string | null
          description?: string
          estimated_duration?: string
          icon_name?: string
          id?: string
          required_value?: number
          title?: string
          token_reward?: number
          value_type?: string
        }
        Relationships: []
      }
      airdrop_campaigns: {
        Row: {
          completion_date: string | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          name: string
          recipients_count: number
          status: string
          token_id: string
          total_amount: number
          transaction_hash: string | null
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          name: string
          recipients_count: number
          status: string
          token_id: string
          total_amount: number
          transaction_hash?: string | null
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          name?: string
          recipients_count?: number
          status?: string
          token_id?: string
          total_amount?: number
          transaction_hash?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "airdrop_campaigns_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      airdrop_recipients: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string
          id: string
          status: string
          transaction_hash: string | null
          updated_at: string
          wallet_address: string
        }
        Insert: {
          amount: number
          campaign_id: string
          created_at?: string
          id?: string
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          wallet_address: string
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string
          id?: string
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "airdrop_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "airdrop_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      album_photos: {
        Row: {
          album_id: string
          created_at: string
          description: string | null
          id: string
          photo_url: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          album_id: string
          created_at?: string
          description?: string | null
          id?: string
          photo_url: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          album_id?: string
          created_at?: string
          description?: string | null
          id?: string
          photo_url?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "photo_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_album"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "photo_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_post"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_post"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_post_bookmarks"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_post_bookmarks"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_groups: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          creator_id: string
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_groups_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_groups_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          likes_count: number
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_author"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_author"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_post"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_post"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_post_comments"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_post_comments"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          last_message_at: string
          recipient_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          last_message_at?: string
          recipient_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          last_message_at?: string
          recipient_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_creator"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_creator"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_recipient"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_recipient"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_follower"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_follower"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_following"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_following"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_group"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      group_posts: {
        Row: {
          created_at: string
          group_id: string
          id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          post_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_group"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_post"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_post"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_private: boolean | null
          member_count: number | null
          name: string
          posts_count: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          member_count?: number | null
          name: string
          posts_count?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          member_count?: number | null
          name?: string
          posts_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hashtags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          post_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          post_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          post_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      likes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_post_likes"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_post_likes"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      liquidity_locks: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          lock_date: string | null
          lock_owner: string
          network: string
          token_id: string
          transaction_hash: string | null
          unlock_date: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          lock_date?: string | null
          lock_owner: string
          network: string
          token_id: string
          transaction_hash?: string | null
          unlock_date: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          lock_date?: string | null
          lock_owner?: string
          network?: string
          token_id?: string
          transaction_hash?: string | null
          unlock_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "liquidity_locks_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      lp_token_locks: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          lock_date: string | null
          lock_owner: string
          network: string
          pair_address: string
          token_id: string
          transaction_hash: string | null
          unlock_date: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          lock_date?: string | null
          lock_owner: string
          network: string
          pair_address: string
          token_id: string
          transaction_hash?: string | null
          unlock_date: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          lock_date?: string | null
          lock_owner?: string
          network?: string
          pair_address?: string
          token_id?: string
          transaction_hash?: string | null
          unlock_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lp_token_locks_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_size: number | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string | null
          group_id: string | null
          id: string
          message_type: string | null
          read: boolean | null
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          message_type?: string | null
          read?: boolean | null
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          message_type?: string | null
          read?: boolean | null
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "chat_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mining_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          efficiency_at_time: number | null
          id: string
          mining_rate_at_time: number | null
          points: number | null
          tokens_earned: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          efficiency_at_time?: number | null
          id?: string
          mining_rate_at_time?: number | null
          points?: number | null
          tokens_earned?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          efficiency_at_time?: number | null
          id?: string
          mining_rate_at_time?: number | null
          points?: number | null
          tokens_earned?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mining_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mining_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mining_activity_thresholds: {
        Row: {
          activity_type: string
          cooldown_period: number
          created_at: string | null
          id: string
          max_activities: number
          time_window: number
          updated_at: string | null
        }
        Insert: {
          activity_type: string
          cooldown_period: number
          created_at?: string | null
          id?: string
          max_activities: number
          time_window: number
          updated_at?: string | null
        }
        Update: {
          activity_type?: string
          cooldown_period?: number
          created_at?: string | null
          id?: string
          max_activities?: number
          time_window?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      mining_intervals: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          interval_length_seconds: number | null
          interval_type: string | null
          points_earned: number | null
          session_id: string | null
          start_time: string
          tokens_earned: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          interval_length_seconds?: number | null
          interval_type?: string | null
          points_earned?: number | null
          session_id?: string | null
          start_time: string
          tokens_earned?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          interval_length_seconds?: number | null
          interval_type?: string | null
          points_earned?: number | null
          session_id?: string | null
          start_time?: string
          tokens_earned?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mining_intervals_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mining_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mining_rewards: {
        Row: {
          created_at: string | null
          id: string
          source: string
          tokens_earned: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          source: string
          tokens_earned?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          source?: string
          tokens_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      mining_sessions: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          start_time: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          start_time?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          start_time?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mining_stats: {
        Row: {
          achievement_bonus: number | null
          created_at: string | null
          current_speed_boost: number | null
          daily_comments_count: number | null
          daily_invites_count: number | null
          daily_likes_count: number | null
          daily_points: number | null
          daily_posts_count: number | null
          daily_reset_at: string | null
          daily_shares_count: number | null
          daily_tokens_earned: number | null
          effective_mining_rate: number | null
          efficiency_multiplier: number | null
          is_mining: boolean | null
          last_activity_at: string | null
          last_heartbeat: string | null
          last_streak_update: string | null
          max_speed_boost: number | null
          mining_rate: number | null
          streak_days: number | null
          total_points: number | null
          total_tokens_earned: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievement_bonus?: number | null
          created_at?: string | null
          current_speed_boost?: number | null
          daily_comments_count?: number | null
          daily_invites_count?: number | null
          daily_likes_count?: number | null
          daily_points?: number | null
          daily_posts_count?: number | null
          daily_reset_at?: string | null
          daily_shares_count?: number | null
          daily_tokens_earned?: number | null
          effective_mining_rate?: number | null
          efficiency_multiplier?: number | null
          is_mining?: boolean | null
          last_activity_at?: string | null
          last_heartbeat?: string | null
          last_streak_update?: string | null
          max_speed_boost?: number | null
          mining_rate?: number | null
          streak_days?: number | null
          total_points?: number | null
          total_tokens_earned?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievement_bonus?: number | null
          created_at?: string | null
          current_speed_boost?: number | null
          daily_comments_count?: number | null
          daily_invites_count?: number | null
          daily_likes_count?: number | null
          daily_points?: number | null
          daily_posts_count?: number | null
          daily_reset_at?: string | null
          daily_shares_count?: number | null
          daily_tokens_earned?: number | null
          effective_mining_rate?: number | null
          efficiency_multiplier?: number | null
          is_mining?: boolean | null
          last_activity_at?: string | null
          last_heartbeat?: string | null
          last_streak_update?: string | null
          max_speed_boost?: number | null
          mining_rate?: number | null
          streak_days?: number | null
          total_points?: number | null
          total_tokens_earned?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mining_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mining_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mining_status_history: {
        Row: {
          change_reason: string | null
          changed_at: string
          created_at: string
          id: string
          new_status: boolean
          previous_status: boolean
          user_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string
          created_at?: string
          id?: string
          new_status: boolean
          previous_status: boolean
          user_id: string
        }
        Update: {
          change_reason?: string | null
          changed_at?: string
          created_at?: string
          id?: string
          new_status?: boolean
          previous_status?: boolean
          user_id?: string
        }
        Relationships: []
      }
      nft_attributes: {
        Row: {
          display_type: string | null
          id: string
          nft_id: string
          rarity: number | null
          trait_type: string
          value: string
        }
        Insert: {
          display_type?: string | null
          id?: string
          nft_id: string
          rarity?: number | null
          trait_type: string
          value: string
        }
        Update: {
          display_type?: string | null
          id?: string
          nft_id?: string
          rarity?: number | null
          trait_type?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_attributes_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nfts"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_collections: {
        Row: {
          banner_url: string | null
          categories: string[] | null
          contract_address: string | null
          created_at: string
          creator_avatar: string | null
          creator_id: string
          creator_name: string | null
          description: string | null
          featured: boolean | null
          floor_price: number | null
          id: string
          image_url: string
          name: string
          network: string
          royalty_fee: number | null
          symbol: string
          total_supply: number | null
          verified: boolean | null
        }
        Insert: {
          banner_url?: string | null
          categories?: string[] | null
          contract_address?: string | null
          created_at?: string
          creator_avatar?: string | null
          creator_id: string
          creator_name?: string | null
          description?: string | null
          featured?: boolean | null
          floor_price?: number | null
          id?: string
          image_url: string
          name: string
          network: string
          royalty_fee?: number | null
          symbol: string
          total_supply?: number | null
          verified?: boolean | null
        }
        Update: {
          banner_url?: string | null
          categories?: string[] | null
          contract_address?: string | null
          created_at?: string
          creator_avatar?: string | null
          creator_id?: string
          creator_name?: string | null
          description?: string | null
          featured?: boolean | null
          floor_price?: number | null
          id?: string
          image_url?: string
          name?: string
          network?: string
          royalty_fee?: number | null
          symbol?: string
          total_supply?: number | null
          verified?: boolean | null
        }
        Relationships: []
      }
      nft_likes: {
        Row: {
          created_at: string
          id: string
          nft_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nft_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nft_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_likes_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nfts"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_reports: {
        Row: {
          created_at: string
          description: string
          id: string
          nft_id: string
          reason: string
          resolved_at: string | null
          resolver_id: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          nft_id: string
          reason: string
          resolved_at?: string | null
          resolver_id?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          nft_id?: string
          reason?: string
          resolved_at?: string | null
          resolver_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_reports_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nfts"
            referencedColumns: ["id"]
          },
        ]
      }
      nft_transactions: {
        Row: {
          block_number: number | null
          created_at: string
          currency: string | null
          from_address: string
          from_name: string | null
          gas_fee: number | null
          gas_used: number | null
          id: string
          network: string
          nft_id: string
          nft_image: string | null
          nft_name: string | null
          price: number | null
          status: string | null
          to_address: string
          to_name: string | null
          transaction_hash: string
          transaction_type: string
        }
        Insert: {
          block_number?: number | null
          created_at?: string
          currency?: string | null
          from_address: string
          from_name?: string | null
          gas_fee?: number | null
          gas_used?: number | null
          id?: string
          network: string
          nft_id: string
          nft_image?: string | null
          nft_name?: string | null
          price?: number | null
          status?: string | null
          to_address: string
          to_name?: string | null
          transaction_hash: string
          transaction_type: string
        }
        Update: {
          block_number?: number | null
          created_at?: string
          currency?: string | null
          from_address?: string
          from_name?: string | null
          gas_fee?: number | null
          gas_used?: number | null
          id?: string
          network?: string
          nft_id?: string
          nft_image?: string | null
          nft_name?: string | null
          price?: number | null
          status?: string | null
          to_address?: string
          to_name?: string | null
          transaction_hash?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "nft_transactions_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nfts"
            referencedColumns: ["id"]
          },
        ]
      }
      nfts: {
        Row: {
          animation_url: string | null
          collection_id: string
          collection_name: string | null
          contract_address: string | null
          created_at: string
          creator_id: string
          creator_name: string | null
          currency: string | null
          description: string | null
          favorite_count: number | null
          id: string
          image_url: string
          last_sale_currency: string | null
          last_sale_price: number | null
          listed: boolean | null
          name: string
          network: string
          owner_id: string
          owner_name: string | null
          price: number | null
          rarity: number | null
          rarity_rank: number | null
          token_id: string
          view_count: number | null
        }
        Insert: {
          animation_url?: string | null
          collection_id: string
          collection_name?: string | null
          contract_address?: string | null
          created_at?: string
          creator_id: string
          creator_name?: string | null
          currency?: string | null
          description?: string | null
          favorite_count?: number | null
          id?: string
          image_url: string
          last_sale_currency?: string | null
          last_sale_price?: number | null
          listed?: boolean | null
          name: string
          network: string
          owner_id: string
          owner_name?: string | null
          price?: number | null
          rarity?: number | null
          rarity_rank?: number | null
          token_id: string
          view_count?: number | null
        }
        Update: {
          animation_url?: string | null
          collection_id?: string
          collection_name?: string | null
          contract_address?: string | null
          created_at?: string
          creator_id?: string
          creator_name?: string | null
          currency?: string | null
          description?: string | null
          favorite_count?: number | null
          id?: string
          image_url?: string
          last_sale_currency?: string | null
          last_sale_price?: number | null
          listed?: boolean | null
          name?: string
          network?: string
          owner_id?: string
          owner_name?: string | null
          price?: number | null
          rarity?: number | null
          rarity_rank?: number | null
          token_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      notification_details: {
        Row: {
          actor_avatar_url: string | null
          actor_display_name: string | null
          actor_id: string | null
          actor_username: string | null
          content: string | null
          created_at: string
          id: string
          read: boolean | null
          target_id: string | null
          target_type: string | null
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actor_avatar_url?: string | null
          actor_display_name?: string | null
          actor_id?: string | null
          actor_username?: string | null
          content?: string | null
          created_at?: string
          id?: string
          read?: boolean | null
          target_id?: string | null
          target_type?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actor_avatar_url?: string | null
          actor_display_name?: string | null
          actor_id?: string | null
          actor_username?: string | null
          content?: string | null
          created_at?: string
          id?: string
          read?: boolean | null
          target_id?: string | null
          target_type?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_actor"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_actor"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          target_id: string | null
          target_type: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          target_id?: string | null
          target_type?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actor_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          target_id?: string | null
          target_type?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_actor"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_actor"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_albums: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          photo_count: number | null
          title: string
          updated_at: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          photo_count?: number | null
          title: string
          updated_at?: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          photo_count?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: []
      }
      post_subscriptions: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string
          comments_count: number | null
          content: string
          created_at: string | null
          hashtags: string[] | null
          id: string
          likes_count: number | null
          media_type: string | null
          media_url: string | null
          shares_count: number | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          content: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          shares_count?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          content?: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          shares_count?: number | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reel_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          reel_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          reel_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          reel_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reel_comments_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
        ]
      }
      reel_likes: {
        Row: {
          created_at: string
          id: string
          reel_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reel_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reel_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reel_likes_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
        ]
      }
      reels: {
        Row: {
          caption: string
          comments_count: number
          created_at: string
          id: string
          likes_count: number
          thumbnail_url: string | null
          updated_at: string
          user_id: string
          video_url: string
          views_count: number
        }
        Insert: {
          caption: string
          comments_count?: number
          created_at?: string
          id?: string
          likes_count?: number
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
          video_url: string
          views_count?: number
        }
        Update: {
          caption?: string
          comments_count?: number
          created_at?: string
          id?: string
          likes_count?: number
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string
          views_count?: number
        }
        Relationships: []
      }
      reports: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          reason: string
          resolved_at: string | null
          resolver_id: string | null
          status: string | null
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          reason: string
          resolved_at?: string | null
          resolver_id?: string | null
          status?: string | null
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          reason?: string
          resolved_at?: string | null
          resolver_id?: string | null
          status?: string | null
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          background_color: string
          content: string
          created_at: string
          expires_at: string
          id: string
          media_type: string | null
          media_url: string | null
          text_color: string
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          background_color?: string
          content: string
          created_at?: string
          expires_at: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          text_color?: string
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          background_color?: string
          content?: string
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          text_color?: string
          updated_at?: string
          user_id?: string
          views_count?: number
        }
        Relationships: []
      }
      story_views: {
        Row: {
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      token_deployments: {
        Row: {
          contract_address: string | null
          deployer_address: string
          deployment_date: string | null
          deployment_status: string
          error_message: string | null
          gas_price: number | null
          gas_used: number | null
          id: string
          network: string
          token_id: string
          transaction_hash: string | null
          updated_at: string | null
        }
        Insert: {
          contract_address?: string | null
          deployer_address: string
          deployment_date?: string | null
          deployment_status?: string
          error_message?: string | null
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          network: string
          token_id: string
          transaction_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          contract_address?: string | null
          deployer_address?: string
          deployment_date?: string | null
          deployment_status?: string
          error_message?: string | null
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          network?: string
          token_id?: string
          transaction_hash?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_deployments_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      token_locks: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          lock_date: string | null
          lock_owner: string
          network: string
          token_id: string
          transaction_hash: string | null
          unlock_date: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          lock_date?: string | null
          lock_owner: string
          network: string
          token_id: string
          transaction_hash?: string | null
          unlock_date: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          lock_date?: string | null
          lock_owner?: string
          network?: string
          token_id?: string
          transaction_hash?: string | null
          unlock_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_locks_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      token_transfers: {
        Row: {
          amount: number
          created_at: string | null
          from_address: string
          id: string
          network: string
          status: string | null
          to_address: string
          token_id: string
          transaction_hash: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          from_address: string
          id?: string
          network: string
          status?: string | null
          to_address: string
          token_id: string
          transaction_hash: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          from_address?: string
          id?: string
          network?: string
          status?: string | null
          to_address?: string
          token_id?: string
          transaction_hash?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_transfers_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      token_verification_status: {
        Row: {
          compiler_version: string | null
          constructor_args: string | null
          contract_name: string | null
          created_at: string
          explorer_url: string | null
          id: string
          last_error: string | null
          token_id: string
          updated_at: string
          verification_attempts: number | null
          verification_date: string | null
          verification_status: string
          verification_type: string | null
        }
        Insert: {
          compiler_version?: string | null
          constructor_args?: string | null
          contract_name?: string | null
          created_at?: string
          explorer_url?: string | null
          id?: string
          last_error?: string | null
          token_id: string
          updated_at?: string
          verification_attempts?: number | null
          verification_date?: string | null
          verification_status?: string
          verification_type?: string | null
        }
        Update: {
          compiler_version?: string | null
          constructor_args?: string | null
          contract_name?: string | null
          created_at?: string
          explorer_url?: string | null
          id?: string
          last_error?: string | null
          token_id?: string
          updated_at?: string
          verification_attempts?: number | null
          verification_date?: string | null
          verification_status?: string
          verification_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_verification_status_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      token_vesting_schedules: {
        Row: {
          beneficiary_address: string
          cliff_duration: string | null
          created_at: string | null
          end_date: string
          id: string
          released_amount: number | null
          start_date: string
          status: string | null
          token_id: string
          total_amount: number
          transaction_hash: string | null
          updated_at: string | null
          vesting_interval: string | null
        }
        Insert: {
          beneficiary_address: string
          cliff_duration?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          released_amount?: number | null
          start_date: string
          status?: string | null
          token_id: string
          total_amount: number
          transaction_hash?: string | null
          updated_at?: string | null
          vesting_interval?: string | null
        }
        Update: {
          beneficiary_address?: string
          cliff_duration?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          released_amount?: number | null
          start_date?: string
          status?: string | null
          token_id?: string
          total_amount?: number
          transaction_hash?: string | null
          updated_at?: string | null
          vesting_interval?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "token_vesting_schedules_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens: {
        Row: {
          contract_address: string | null
          created_at: string | null
          creator_id: string
          decimals: number
          description: string | null
          discord_url: string | null
          features: string[] | null
          id: string
          name: string
          network: string
          symbol: string
          telegram_url: string | null
          token_metrics: Json | null
          total_supply: number
          twitter_url: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          contract_address?: string | null
          created_at?: string | null
          creator_id: string
          decimals?: number
          description?: string | null
          discord_url?: string | null
          features?: string[] | null
          id?: string
          name: string
          network: string
          symbol: string
          telegram_url?: string | null
          token_metrics?: Json | null
          total_supply: number
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          contract_address?: string | null
          created_at?: string | null
          creator_id?: string
          decimals?: number
          description?: string | null
          discord_url?: string | null
          features?: string[] | null
          id?: string
          name?: string
          network?: string
          symbol?: string
          telegram_url?: string | null
          token_metrics?: Json | null
          total_supply?: number
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tokens_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tokens_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number | null
          block_hash: string | null
          block_number: number | null
          created_at: string
          error_message: string | null
          from_address: string | null
          gas_price: number | null
          gas_used: number | null
          id: string
          network: string
          status: string
          to_address: string | null
          token_id: string
          transaction_hash: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          block_hash?: string | null
          block_number?: number | null
          created_at?: string
          error_message?: string | null
          from_address?: string | null
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          network: string
          status?: string
          to_address?: string | null
          token_id: string
          transaction_hash: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          block_hash?: string | null
          block_number?: number | null
          created_at?: string
          error_message?: string | null
          from_address?: string | null
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          network?: string
          status?: string
          to_address?: string | null
          token_id?: string
          transaction_hash?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          progress: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          points: number | null
          target_id: string | null
          target_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          points?: number | null
          target_id?: string | null
          target_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          points?: number | null
          target_id?: string | null
          target_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_followers: {
        Row: {
          created_at: string | null
          follower_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          follower_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          follower_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_followers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_followers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_settings: {
        Row: {
          comments_enabled: boolean | null
          created_at: string | null
          email_enabled: boolean | null
          follows_enabled: boolean | null
          group_activity_enabled: boolean | null
          id: string
          likes_enabled: boolean | null
          mentions_enabled: boolean | null
          mining_rewards_enabled: boolean | null
          new_posts_enabled: boolean | null
          push_enabled: boolean | null
          system_updates_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comments_enabled?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          follows_enabled?: boolean | null
          group_activity_enabled?: boolean | null
          id?: string
          likes_enabled?: boolean | null
          mentions_enabled?: boolean | null
          mining_rewards_enabled?: boolean | null
          new_posts_enabled?: boolean | null
          push_enabled?: boolean | null
          system_updates_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comments_enabled?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          follows_enabled?: boolean | null
          group_activity_enabled?: boolean | null
          id?: string
          likes_enabled?: boolean | null
          mentions_enabled?: boolean | null
          mining_rewards_enabled?: boolean | null
          new_posts_enabled?: boolean | null
          push_enabled?: boolean | null
          system_updates_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_relationships: {
        Row: {
          created_at: string
          id: string
          related_user_id: string
          relationship_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          related_user_id: string
          relationship_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          related_user_id?: string
          relationship_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string | null
          daily_activity_count: number | null
          display_name: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          last_activity_reset: string | null
          mined_tokens: number | null
          social_links: Json | null
          updated_at: string | null
          username: string
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string | null
          daily_activity_count?: number | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id: string
          last_activity_reset?: string | null
          mined_tokens?: number | null
          social_links?: Json | null
          updated_at?: string | null
          username: string
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string | null
          daily_activity_count?: number | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          last_activity_reset?: string | null
          mined_tokens?: number | null
          social_links?: Json | null
          updated_at?: string | null
          username?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      post_with_profiles: {
        Row: {
          author_id: string | null
          avatar_url: string | null
          comments_count: number | null
          content: string | null
          created_at: string | null
          display_name: string | null
          hashtags: string[] | null
          id: string | null
          likes_count: number | null
          media_type: string | null
          media_url: string | null
          shares_count: number | null
          updated_at: string | null
          username: string | null
          video_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_search: {
        Row: {
          avatar_url: string | null
          bio: string | null
          display_name: string | null
          followers_count: number | null
          id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          display_name?: string | null
          followers_count?: number | null
          id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          display_name?: string | null
          followers_count?: number | null
          id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      batch_process_mining_activities: {
        Args: { p_user_id: string; p_activities: Json[] }
        Returns: Json
      }
      can_mark_message_as_read: {
        Args: { msg_id: string; msg_read: boolean; msg_content: string }
        Returns: boolean
      }
      cleanup_stale_mining_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_stale_mining_states: {
        Args: { auto_cleanup?: boolean }
        Returns: number
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_type: string
          p_content: string
          p_actor_id?: string
          p_target_id?: string
          p_target_type?: string
        }
        Returns: string
      }
      create_notification_settings: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      create_post_subscription_notification: {
        Args: {
          p_post_id: string
          p_actor_id: string
          p_action_type: string
          p_content: string
        }
        Returns: undefined
      }
      decrement: {
        Args: { value: number }
        Returns: number
      }
      decrement_likes: {
        Args: { post_id: string }
        Returns: undefined
      }
      decrement_nft_favorites: {
        Args: { nft_id: string }
        Returns: undefined
      }
      decrement_reel_comments: {
        Args: { reel_id: string }
        Returns: undefined
      }
      decrement_reel_likes: {
        Args: { reel_id: string }
        Returns: undefined
      }
      delete_post_cascade: {
        Args: { post_id_param: string }
        Returns: boolean
      }
      get_inactive_miners: {
        Args: { inactivity_minutes: number }
        Returns: {
          user_id: string
          last_heartbeat: string
        }[]
      }
      get_relationship_type: {
        Args: { user_id: string; target_user_id: string }
        Returns: string
      }
      handle_mining_status_update: {
        Args: {
          user_id_param: string
          is_mining_param: boolean
          update_heartbeat?: boolean
        }
        Returns: boolean
      }
      increment: {
        Args:
          | { value: number }
          | { value: number; column_name: string; user_id: string }
        Returns: number
      }
      increment_comments: {
        Args: { post_id: string }
        Returns: undefined
      }
      increment_decimal: {
        Args:
          | { value: number; column_name: string; user_id: string }
          | { value: number }
        Returns: undefined
      }
      increment_likes: {
        Args: { post_id: string }
        Returns: undefined
      }
      increment_mined_tokens: {
        Args: { user_id_param: string; increment_value: number }
        Returns: undefined
      }
      increment_nft_favorites: {
        Args: { nft_id: string }
        Returns: undefined
      }
      increment_reel_comments: {
        Args: { reel_id: string }
        Returns: undefined
      }
      increment_reel_likes: {
        Args: { reel_id: string }
        Returns: undefined
      }
      increment_reel_views: {
        Args: { reel_id: string }
        Returns: undefined
      }
      increment_shares: {
        Args: { post_id: string }
        Returns: undefined
      }
      increment_story_views: {
        Args: { story_id: string }
        Returns: undefined
      }
      record_mining_activity: {
        Args: {
          p_user_id: string
          p_type: string
          p_points: number
          p_tokens: number
        }
        Returns: Json
      }
      record_mining_activity_optimized: {
        Args: {
          p_user_id: string
          p_type: string
          p_points: number
          p_tokens: number
          p_efficiency_multiplier?: number
          p_mining_rate?: number
        }
        Returns: Json
      }
      sync_mining_tokens: {
        Args: { p_user_id: string }
        Returns: Json
      }
      synchronize_post_like_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      toggle_post_like: {
        Args: { p_user_id: string; p_post_id: string }
        Returns: Json
      }
      update_conversation_last_message_time: {
        Args: { conversation_id: number; last_message_time: string }
        Returns: undefined
      }
      update_follower_count: {
        Args: { target_user_id: string; count_change: number }
        Returns: undefined
      }
      update_following_count: {
        Args: { user_id: string; count_change: number }
        Returns: undefined
      }
      update_mining_heartbeat: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      validate_mining_state: {
        Args: { p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      transaction_status: "pending" | "completed" | "failed"
      vesting_status: "active" | "completed" | "canceled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      transaction_status: ["pending", "completed", "failed"],
      vesting_status: ["active", "completed", "canceled"],
    },
  },
} as const
