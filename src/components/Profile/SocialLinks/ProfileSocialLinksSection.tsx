import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Edit, Plus, X, Globe, Instagram, Twitter, Github, Linkedin, Youtube, Facebook } from 'lucide-react';
// import { supabase } from '@/lib/supabase'; // TODO: Migrate to Django

interface ProfileSocialLinksSectionProps {
  profileId: string;
  isOwnProfile: boolean;
}

export const ProfileSocialLinksSection = ({ profileId, isOwnProfile }: ProfileSocialLinksSectionProps) => {
  useEffect(() => {
    // TODO: Implement Django social links fetching
    toast.info('Social Links werden zu Django migriert');
  }, [profileId]);

  // Show migration notice
  return (
    <Card className="overflow-hidden bg-dark-100/80 backdrop-blur-sm border-gray-800/40 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-secondary-600/5 to-accent/5 opacity-80"></div>
      
      <CardHeader className="relative flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Social Media</h3>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="bg-dark-200/50 border border-gray-700 rounded-lg p-6 text-center">
          <h4 className="text-lg font-semibold text-white mb-2">Migration in Arbeit</h4>
          <p className="text-gray-300 text-sm">
            Die Social Links-Funktionalität wird gerade von Supabase zu Django migriert.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
