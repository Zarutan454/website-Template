# API Endpoints - Performance Optimized

## Overview
Diese Dokumentation beschreibt alle optimierten API-Endpoints für das BSN Social Network mit Performance-Optimierungen, Caching-Strategien und Security-Enhancements.

## Performance Optimizations

### 1. Database Query Optimization
- **select_related()**: Für Foreign Key Beziehungen
- **prefetch_related()**: Für Many-to-Many Beziehungen
- **Optimized Count Queries**: Für Follow-Statistiken
- **Indexed Queries**: Für schnelle User-Lookups

### 2. Caching Strategy
- **Profile Data**: 5 Minuten Cache für User-Profile
- **Follow Statistics**: 10 Minuten Cache für Follow-Counts
- **Recent Posts**: 3 Minuten Cache für aktuelle Posts
- **API Performance**: 1 Stunde Cache für Performance-Metrics

### 3. Rate Limiting
- **Profile Views**: 100 Requests/Stunde pro User
- **Search API**: 50 Requests/Stunde pro User
- **Upload API**: 20 Requests/Stunde pro User

## User Profile Endpoints

### GET /api/users/profile/{username}/
**Optimized User Profile by Username**

```typescript
interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: {
    bio: string;
    avatar_url: string;
    cover_url: string;
    location: string;
    website: string;
    birth_date: string;
    gender: string;
    phone: string;
    is_public: boolean;
  };
  followers_count: number;
  following_count: number;
  is_following: boolean;
  is_own_profile: boolean;
  recent_posts_count: number;
}
```

**Performance Features:**
- ✅ Cached for 5 minutes
- ✅ Optimized database queries
- ✅ Rate limited (100/hour)
- ✅ Error handling with logging

### GET /api/users/profile/id/{user_id}/
**Optimized User Profile by ID**

```typescript
interface UserProfileByIdResponse {
  // Same as UserProfileResponse
  // Additional: recent_posts_count
}
```

**Performance Features:**
- ✅ Cached for 5 minutes
- ✅ select_related for profile data
- ✅ prefetch_related for posts
- ✅ Optimized follow statistics

## Follow System Endpoints

### POST /api/users/follow/{user_id}/
**Follow a User**

```typescript
interface FollowRequest {
  user_id: number;
}

interface FollowResponse {
  success: boolean;
  message: string;
  followers_count: number;
}
```

### POST /api/users/unfollow/{user_id}/
**Unfollow a User**

```typescript
interface UnfollowResponse {
  success: boolean;
  message: string;
  followers_count: number;
}
```

### GET /api/users/following/{user_id}/
**Get Following List**

```typescript
interface FollowingListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserProfile[];
}
```

**Performance Features:**
- ✅ Pagination (20 items per page)
- ✅ Optimized queries with select_related
- ✅ Cached follow statistics

## Search & Discovery Endpoints

### GET /api/users/search/
**User Search with Optimized Queries**

```typescript
interface SearchRequest {
  q: string;           // Search query
  type?: 'username' | 'name' | 'all';
  page?: number;
  limit?: number;
}

interface SearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserProfile[];
}
```

**Performance Features:**
- ✅ Full-text search optimization
- ✅ Rate limited (50/hour)
- ✅ Pagination support
- ✅ Cached search results

## Media Upload Endpoints

### POST /api/users/avatar/upload/
**Avatar Upload with Security**

```typescript
interface AvatarUploadRequest {
  avatar: File;
}

interface AvatarUploadResponse {
  success: boolean;
  avatar_url: string;
  message: string;
}
```

**Security Features:**
- ✅ File type validation
- ✅ File size limits (5MB)
- ✅ Image compression
- ✅ Rate limited (20/hour)

### POST /api/users/cover/upload/
**Cover Image Upload**

```typescript
interface CoverUploadRequest {
  cover: File;
}

interface CoverUploadResponse {
  success: boolean;
  cover_url: string;
  message: string;
}
```

## Activity Feed Endpoints

### GET /api/users/{user_id}/activity/
**User Activity Feed**

```typescript
interface ActivityFeedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ActivityItem[];
}

interface ActivityItem {
  id: number;
  type: 'post' | 'follow' | 'token' | 'mining' | 'nft';
  created_at: string;
  data: any;
}
```

**Performance Features:**
- ✅ Aggregated activity feed
- ✅ Optimized queries
- ✅ Pagination support
- ✅ Cached for 3 minutes

## Error Handling

### Standard Error Response
```typescript
interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}
```

### Common Error Codes
- `400`: Bad Request (Invalid data)
- `401`: Unauthorized (Authentication required)
- `403`: Forbidden (Permission denied)
- `404`: Not Found (User/Resource not found)
- `429`: Too Many Requests (Rate limit exceeded)
- `500`: Internal Server Error

## Performance Monitoring

### API Performance Metrics
```typescript
interface PerformanceMetrics {
  endpoint: string;
  method: string;
  avg_response_time: number;
  request_count: number;
  error_rate: number;
  cache_hit_rate: number;
}
```

### Monitoring Endpoints
- `/api/monitoring/performance/`: Get performance metrics
- `/api/monitoring/cache/`: Get cache statistics
- `/api/monitoring/errors/`: Get error logs

## Security Features

### Request Validation
- ✅ Input sanitization
- ✅ XSS protection
- ✅ SQL injection prevention
- ✅ File upload validation

### Authentication
- ✅ JWT token validation
- ✅ Session management
- ✅ Rate limiting per user
- ✅ Request signature validation

### Data Protection
- ✅ Sensitive data filtering
- ✅ Privacy settings respect
- ✅ GDPR compliance
- ✅ Data encryption

## Caching Strategy

### Cache Keys
- `user_profile_{username}`: User profile data
- `user_profile_id_{user_id}`: User profile by ID
- `follow_stats_{user_id}`: Follow statistics
- `search_results_{query}`: Search results
- `api_performance_{endpoint}`: Performance metrics

### Cache Invalidation
- Profile updates invalidate profile cache
- Follow/unfollow invalidates follow statistics
- Post creation invalidates activity feed
- User settings update invalidates profile cache

## Rate Limiting

### Limits by Endpoint
- Profile views: 100/hour
- Search requests: 50/hour
- Upload requests: 20/hour
- Follow/unfollow: 100/hour
- Activity feed: 200/hour

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Database Optimization

### Indexes
- User username (unique)
- User email (unique)
- Follow relationships
- Post author + created_at
- Activity timestamps

### Query Optimization
- select_related for foreign keys
- prefetch_related for many-to-many
- Optimized count queries
- Pagination with cursor-based pagination

## Monitoring & Logging

### Log Levels
- `INFO`: Normal API requests
- `WARNING`: Slow API calls (>1s)
- `ERROR`: API errors and exceptions
- `DEBUG`: Detailed debugging info

### Metrics Tracked
- Response times
- Request counts
- Error rates
- Cache hit rates
- Database query performance

## Testing Strategy

### Unit Tests
- ✅ API endpoint functionality
- ✅ Error handling
- ✅ Rate limiting
- ✅ Caching behavior

### Integration Tests
- ✅ Database query performance
- ✅ Cache invalidation
- ✅ Security validation
- ✅ Authentication flow

### Performance Tests
- ✅ Load testing
- ✅ Stress testing
- ✅ Cache performance
- ✅ Database query optimization

## Deployment Considerations

### Production Settings
- Redis for caching
- PostgreSQL for database
- CDN for media files
- Load balancer for scaling

### Monitoring Setup
- Application performance monitoring
- Database query monitoring
- Cache hit rate monitoring
- Error rate tracking

### Security Hardening
- HTTPS enforcement
- Security headers
- Input validation
- Rate limiting
- File upload restrictions 