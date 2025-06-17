
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from './useProfile';

interface NotificationSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  follows_enabled: boolean;
  likes_enabled: boolean;
  comments_enabled: boolean;
  mentions_enabled: boolean;
  new_posts_enabled: boolean;
  group_activity_enabled: boolean;
  mining_rewards_enabled: boolean;
  system_updates_enabled: boolean;
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { profile } = useProfile();

  const fetchSettings = useCallback(async () => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (error) throw error;

      setSettings(data);
    } catch (err: unknown) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<NotificationSettings>) => {
    if (!profile?.id || !settings) {
      throw new Error('User not authenticated or settings not loaded');
    }

    try {
      const { error } = await supabase
        .from('user_notification_settings')
        .update(updates)
        .eq('user_id', profile.id);

      if (error) throw error;

      // Update local state
      setSettings(prev => prev ? { ...prev, ...updates } : null);
      
      return true;
    } catch (err) {
      throw err;
    }
  }, [profile?.id, settings]);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    if (!profile?.id) {
      throw new Error('User not authenticated');
    }

    // Default settings
    const defaults = {
      email_enabled: false,
      push_enabled: true,
      follows_enabled: true,
      likes_enabled: false,
      comments_enabled: true,
      mentions_enabled: true,
      new_posts_enabled: true,
      group_activity_enabled: true,
      mining_rewards_enabled: true,
      system_updates_enabled: true
    };

    try {
      const { error } = await supabase
        .from('user_notification_settings')
        .update(defaults)
        .eq('user_id', profile.id);

      if (error) throw error;

      // Update local state
      setSettings(prev => prev ? { ...prev, ...defaults } : null);
      
      return true;
    } catch (err) {
      throw err;
    }
  }, [profile?.id]);

  // Create default settings if they don't exist
  const ensureSettingsExist = useCallback(async () => {
    if (!profile?.id) return;

    try {
      // Check if settings exist
      const { data, error } = await supabase
        .from('user_notification_settings')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error) throw error;

      // If no settings found, create default ones
      if (!data) {
        const defaults = {
          user_id: profile.id,
          email_enabled: false,
          push_enabled: true,
          follows_enabled: true, 
          likes_enabled: false,
          comments_enabled: true,
          mentions_enabled: true,
          new_posts_enabled: true,
          group_activity_enabled: true,
          mining_rewards_enabled: true,
          system_updates_enabled: true
        };

        const { error: insertError } = await supabase
          .from('user_notification_settings')
          .insert([defaults]);

        if (insertError) throw insertError;
        
        // Fetch newly created settings
        await fetchSettings();
      }
    } catch (err) {
    }
  }, [profile?.id, fetchSettings]);

  // Initial fetch
  useEffect(() => {
    if (profile?.id) {
      ensureSettingsExist().then(() => fetchSettings());
    }
  }, [profile?.id, ensureSettingsExist, fetchSettings]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetToDefaults,
    fetchSettings
  };
}
