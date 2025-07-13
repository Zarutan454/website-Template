# 📚 Profile Page - Complete Documentation

## 🎯 Übersicht

Die Profile-Page ist das Herzstück der BSN Social Network-Anwendung. Sie bietet Benutzern eine vollständige Übersicht über ihr Profil, ihre Aktivitäten und die Möglichkeit, mit anderen zu interagieren.

## 🏗️ Architektur

### **Komponenten-Struktur**
```
ProfilePage/
├── ProfileHeader/          # Profil-Header mit Avatar, Cover, Bio
├── ProfileTabNavigation/   # Tab-Navigation für verschiedene Bereiche
├── CreatePostBox/         # Post-Erstellung (nur eigenes Profil)
├── UnifiedPostCard/       # Einheitliche Post-Darstellung
├── ProfileAboutSection/   # Über-Sektion mit Bio, Skills, etc.
├── ProfileMediaSection/   # Medien-Galerie
├── ProfileFriendsSection/ # Freunde und Follower
├── ProfileActivitySection/ # Aktivitäts-Feed
└── Modals/               # Followers/Following-Modals
```

### **State Management**
```typescript
interface ProfileState {
  profileData: UserProfile | null;
  isOwnProfile: boolean;
  isLoading: boolean;
  error: Error | null;
  activeTab: ProfileTab;
  followStats: FollowStats;
  posts: Post[];
}
```

## 🚀 Features

### **1. Profile Header**
- **Avatar Upload**: Drag & Drop oder Klick zum Hochladen
- **Cover Upload**: Banner-Bild-Upload mit Vorschau
- **Bio-Editor**: Rich-Text-Editor für Bio-Bearbeitung
- **Social Links**: Website, Twitter, GitHub, LinkedIn
- **Follow/Unfollow**: Interaktion mit anderen Benutzern

### **2. Tab Navigation**
```typescript
type ProfileTab = 
  | 'posts'      // Benutzer-Beiträge
  | 'about'      // Über-Sektion
  | 'mining'     // Mining-Statistiken
  | 'token'      // Token-Portfolio
  | 'friends'    // Freunde & Follower
  | 'media'      // Medien-Galerie
  | 'activity';  // Aktivitäts-Feed
```

### **3. Posts Tab**
- **Create Post**: Rich-Text-Editor mit Media-Upload
- **Post Display**: Einheitliche Darstellung mit Likes, Comments, Shares
- **Post Actions**: Like, Comment, Share, Delete (eigene Posts)
- **Infinite Scroll**: Automatisches Laden weiterer Posts

### **4. Mobile Optimizations**
- **Responsive Design**: Anpassung an alle Bildschirmgrößen
- **Touch Optimizations**: Große Touch-Targets für Mobile
- **Swipe Gestures**: Navigation zwischen Tabs
- **Progressive Loading**: Lazy Loading für bessere Performance

## 🔧 API Integration

### **Backend Endpoints**
```typescript
// Profile API
GET /api/users/profile/{username}/     // Profil abrufen
PATCH /api/auth/user/                  // Profil aktualisieren
POST /api/upload/media/                // Avatar/Cover upload

// Posts API
GET /api/posts/?user={userId}          // User-Posts abrufen
POST /api/posts/                       // Post erstellen
DELETE /api/posts/{id}/                // Post löschen

// Social API
POST /api/follow/                      // User folgen
DELETE /api/follow/{userId}/           // User entfolgen
GET /api/followers/{userId}/           // Follower abrufen
GET /api/following/{userId}/           // Following abrufen
```

### **Frontend API Client**
```typescript
// Optimierte API-Calls mit Caching
export const userAPI = {
  getProfileByUsername: async (username: string) => {
    const cacheKey = `profile_${username}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const response = await apiRequest(`/users/profile/${username}/`);
    sessionStorage.setItem(cacheKey, JSON.stringify(response));
    return response;
  },
  
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar_image', file);
    return await fetch(`${BASE_URL}/upload/media/`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    }).then(r => r.json());
  },
  
  uploadCover: async (file: File) => {
    const formData = new FormData();
    formData.append('cover_image', file);
    return await fetch(`${BASE_URL}/upload/media/`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    }).then(r => r.json());
  },
};
```

## 🎨 UI/UX Design

### **Design System**
```css
/* Color Palette */
:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --dark-200: #1f2937;
  --dark-300: #374151;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
}

/* Typography */
.profile-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

/* Spacing */
.profile-container {
  max-width: 7rem;
  margin: 0 auto;
  padding: 1rem;
}

/* Responsive Breakpoints */
@media (max-width: 640px) {
  .profile-header h1 {
    font-size: 1.5rem;
  }
}
```

### **Accessibility Features**
- **ARIA Labels**: Alle interaktiven Elemente haben ARIA-Labels
- **Keyboard Navigation**: Vollständige Tastatur-Navigation
- **Screen Reader Support**: Semantische HTML-Struktur
- **Focus Indicators**: Sichtbare Focus-Indikatoren
- **Color Contrast**: WCAG 2.1 AA Compliance

### **Mobile Optimizations**
```typescript
// Mobile Detection Hook
export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};
```

## 🔄 Performance Optimizations

### **React Optimizations**
```typescript
// Memoized Components
const MemoizedProfileHeader = memo(ProfileHeader);
const MemoizedProfileTabNavigation = memo(ProfileTabNavigation);
const MemoizedCreatePostBox = memo(CreatePostBox);
const MemoizedUnifiedPostCard = memo(UnifiedPostCard);

// Optimized Event Handlers
const handleLikePost = useCallback(async (postId: number) => {
  try {
    await interactionRepository.togglePostLike(postId.toString());
    refreshMedia();
  } catch (error) {
    toast.error('Fehler beim Liken');
  }
}, [refreshMedia]);

// Memoized Data Conversion
const convertedPosts = useMemo(() => {
  if (!profileData || !postsMedia) return [];
  return postsMedia.map(item => ({
    id: parseInt(item.id.toString()),
    content: item.description || '',
    media_url: item.url || '',
    // ... weitere Konvertierungen
  }));
}, [profileData, postsMedia]);
```

### **Lazy Loading**
```typescript
// Lazy load sidebar components
const LazyProfileAboutSection = lazy(() => import('./ProfileAboutSection'));
const LazyProfileMediaSection = lazy(() => import('./ProfileMediaSection'));
const LazyProfileFriendsSection = lazy(() => import('./ProfileFriendsSection'));
const LazyProfileActivitySection = lazy(() => import('./ProfileActivitySection'));

// Suspense Wrapper
<Suspense fallback={<SectionLoader />}>
  <LazyProfileAboutSection profile={profileData} />
</Suspense>
```

### **Image Optimization**
```typescript
// Optimierte Bild-URL-Generierung
const getImageUrl = (url?: string) => {
  if (!url) return '';
  
  let fullUrl = url;
  if (url.startsWith('/media/')) {
    fullUrl = `http://localhost:8000${url}`;
  }
  
  // Cache-Buster für Uploads
  let cacheBuster = '';
  if (avatarUploading || coverUploading) {
    cacheBuster = `?t=${Date.now()}`;
  }
  
  return `${fullUrl}${cacheBuster}`;
};
```

## 🧪 Testing

### **Unit Tests**
```typescript
// ProfilePage.test.tsx
describe('ProfilePage', () => {
  describe('Loading States', () => {
    it('should show loading state initially', () => {
      renderWithProviders(<ProfilePage />);
      expect(screen.getByTestId('profile-loader')).toBeInTheDocument();
    });
  });
  
  describe('Profile Header', () => {
    it('should display user information correctly', async () => {
      renderWithProviders(<ProfilePage />);
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('@testuser')).toBeInTheDocument();
      });
    });
  });
});
```

### **Integration Tests**
```typescript
// API Integration Tests
describe('Profile API Integration', () => {
  it('should load profile data from API', async () => {
    const mockProfile = { username: 'testuser', display_name: 'Test User' };
    (userAPI.getProfileByUsername as jest.Mock).mockResolvedValue(mockProfile);
    
    renderWithProviders(<ProfilePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });
});
```

### **E2E Tests**
```typescript
// Cypress E2E Tests
describe('Profile Page E2E', () => {
  it('should allow users to update their profile', () => {
    cy.visit('/profile/testuser');
    cy.get('[data-testid="edit-profile-button"]').click();
    cy.get('[data-testid="bio-input"]').type('New bio text');
    cy.get('[data-testid="save-profile-button"]').click();
    cy.get('[data-testid="bio-text"]').should('contain', 'New bio text');
  });
});
```

## 🚀 Deployment

### **Build Optimization**
```bash
# Production Build
npm run build

# Bundle Analysis
npm run build:analyze

# Performance Monitoring
npm run lighthouse
```

### **Environment Variables**
```env
# Frontend
VITE_API_BASE_URL=http://localhost:8000
VITE_ENVIRONMENT=development

# Backend
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## 📊 Monitoring & Analytics

### **Performance Metrics**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

### **User Analytics**
```typescript
// Analytics Tracking
const trackProfileView = (username: string) => {
  analytics.track('Profile View', {
    username,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  });
};

const trackProfileUpdate = (updatedFields: string[]) => {
  analytics.track('Profile Update', {
    updatedFields,
    timestamp: new Date().toISOString(),
  });
};
```

### **Error Tracking**
```typescript
// Error Boundary
export class ProfileErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Profile Error:', error, errorInfo);
    
    // Error an Monitoring-Service senden
    errorTracking.captureException(error, {
      extra: {
        component: 'ProfilePage',
        errorInfo,
      },
    });
  }
}
```

## 🔧 Troubleshooting

### **Häufige Probleme**

#### **1. Banner-Bild wird nicht angezeigt**
```typescript
// Problem: cover_url ist undefined
// Lösung: Korrekte API-Integration
const profile = {
  ...profileData,
  cover_url: profileData.cover_url || '', // Fallback hinzufügen
};
```

#### **2. Mobile Performance-Probleme**
```typescript
// Problem: Langsame Mobile-Performance
// Lösung: Lazy Loading und Memoization
const LazyComponent = lazy(() => import('./HeavyComponent'));
const MemoizedComponent = memo(ExpensiveComponent);
```

#### **3. API-Timeout-Fehler**
```typescript
// Problem: API-Calls timeout
// Lösung: Retry-Mechanismus
const apiCallWithRetry = async (apiCall: () => Promise<any>, retries = 3) => {
  try {
    return await apiCall();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiCallWithRetry(apiCall, retries - 1);
    }
    throw error;
  }
};
```

### **Debug-Logs**
```typescript
// Debug-Logs für Development
if (process.env.NODE_ENV === 'development') {
  console.log('[ProfilePage] ProfileData:', profileData);
  console.log('[ProfilePage] cover_url:', profileData?.cover_url);
  console.log('[ProfilePage] avatar_url:', profileData?.avatar_url);
}
```

## 📚 Weiterführende Dokumentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Component Library](./COMPONENT_LIBRARY.md)
- [Performance Guidelines](./PERFORMANCE_GUIDELINES.md)
- [Accessibility Guide](./ACCESSIBILITY_GUIDE.md)
- [Mobile Optimization](./MOBILE_OPTIMIZATION.md)

---

**Status**: ✅ Vollständig dokumentiert  
**Letzte Aktualisierung**: 21. Dezember 2024  
**Nächste Review**: Wöchentlich  
**Verantwortlich**: Dokumentations-Agent 