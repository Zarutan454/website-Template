import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Loader2, 
  ExternalLink,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Globe
} from 'lucide-react';
import { userAPI } from '@/lib/django-api-new';
import { toast } from 'sonner';

interface SocialLinks {
  social_media_links: Record<string, string>;
}

interface ProfileSocialLinksProps {
  userId: number;
  isOwnProfile?: boolean;
}

const ProfileSocialLinks: React.FC<ProfileSocialLinksProps> = ({ userId, isOwnProfile = false }) => {
  const [socialLinks, setSocialLinks] = useState<SocialLinks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSocialLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userAPI.getUserSocialLinks(userId);
      setSocialLinks(response);
    } catch (err) {
      console.error('Error fetching social links:', err);
      setError('Fehler beim Laden der Social Links');
      toast.error('Social Links konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialLinks();
  }, [userId]);

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getSocialColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'twitter':
        return 'bg-blue-500';
      case 'facebook':
        return 'bg-blue-600';
      case 'linkedin':
        return 'bg-blue-700';
      case 'youtube':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Social Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Lade Social Links...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Social Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchSocialLinks} variant="outline">
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!socialLinks || Object.keys(socialLinks.social_media_links).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Social Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Share2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {isOwnProfile ? 'Du hast noch keine Social Links hinzugefügt' : 'Keine Social Links vorhanden'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Social Links ({Object.keys(socialLinks.social_media_links).length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(socialLinks.social_media_links).map(([platform, url]) => (
            <div key={platform} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <div className={`w-10 h-10 rounded-full ${getSocialColor(platform)} flex items-center justify-center`}>
                <div className="text-white">
                  {getSocialIcon(platform)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {platform}
                  </Badge>
                </div>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate block"
                >
                  {url}
                </a>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSocialLinks; 