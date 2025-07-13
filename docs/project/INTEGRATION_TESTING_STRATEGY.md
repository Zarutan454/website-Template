# Integration Testing Strategy - BSN Social Network

## Overview
Diese Dokumentation beschreibt die umfassende Integration Testing Strategie für das BSN Social Network mit Fokus auf API-Integration, Performance-Tests und End-to-End-Tests.

## Test-Pyramide

### 1. Unit Tests (70%)
- **Komponenten-Tests**: React-Komponenten isoliert testen
- **Hook-Tests**: Custom Hooks testen
- **Utility-Tests**: Helper-Funktionen testen
- **Repository-Tests**: Datenzugriff-Schicht testen

### 2. Integration Tests (20%)
- **API-Integration**: Frontend-Backend Kommunikation
- **Database-Integration**: Datenbank-Operationen
- **Authentication-Flow**: Login/Logout Prozesse
- **File-Upload**: Media-Upload Integration

### 3. End-to-End Tests (10%)
- **User-Journeys**: Komplette Nutzer-Workflows
- **Critical-Paths**: Wichtige Geschäftsprozesse
- **Performance-Tests**: Last-Tests und Performance-Monitoring

## API Integration Tests

### Profile API Tests
```typescript
describe('Profile API Integration', () => {
  test('should fetch user profile successfully', async () => {
    // Arrange
    const mockProfile = {
      id: 1,
      username: 'testuser',
      profile: { bio: 'Test bio' }
    };
    
    // Act
    const response = await fetch('/api/users/profile/testuser/');
    const data = await response.json();
    
    // Assert
    expect(response.status).toBe(200);
    expect(data.username).toBe('testuser');
  });

  test('should handle profile not found', async () => {
    // Act
    const response = await fetch('/api/users/profile/nonexistent/');
    
    // Assert
    expect(response.status).toBe(404);
  });
});
```

### Follow System Tests
```typescript
describe('Follow System Integration', () => {
  test('should follow user successfully', async () => {
    // Arrange
    const authToken = await loginUser('testuser', 'password');
    
    // Act
    const response = await fetch('/api/users/follow/2/', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
```

### Media Upload Tests
```typescript
describe('Media Upload Integration', () => {
  test('should upload cover image successfully', async () => {
    // Arrange
    const file = new File(['test'], 'cover.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('cover', file);
    
    // Act
    const response = await fetch('/api/users/cover/upload/', {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.cover_url).toBeDefined();
  });
});
```

## Database Integration Tests

### User Profile Tests
```typescript
describe('User Profile Database Integration', () => {
  test('should create user profile with all fields', async () => {
    // Arrange
    const userData = {
      username: 'newuser',
      email: 'new@example.com',
      profile: {
        bio: 'New user bio',
        location: 'New City'
      }
    };
    
    // Act
    const user = await User.objects.create_user(
      username=userData.username,
      email=userData.email
    );
    const profile = await UserProfile.objects.create(
      user=user,
      bio=userData.profile.bio,
      location=userData.profile.location
    );
    
    // Assert
    expect(user.username).toBe('newuser');
    expect(profile.bio).toBe('New user bio');
  });
});
```

### Follow Relationship Tests
```typescript
describe('Follow Relationship Database Integration', () => {
  test('should create follow relationship correctly', async () => {
    // Arrange
    const follower = await User.objects.create_user('follower', 'follower@test.com');
    const followed = await User.objects.create_user('followed', 'followed@test.com');
    
    // Act
    const relationship = await FollowRelationship.objects.create(
      follower=follower,
      followed=followed
    );
    
    // Assert
    expect(relationship.follower).toBe(follower);
    expect(relationship.followed).toBe(followed);
    expect(followed.followers.count()).toBe(1);
  });
});
```

## Performance Integration Tests

### API Response Time Tests
```typescript
describe('API Performance Integration', () => {
  test('profile API should respond within 500ms', async () => {
    // Arrange
    const startTime = Date.now();
    
    // Act
    const response = await fetch('/api/users/profile/testuser/');
    const endTime = Date.now();
    
    // Assert
    expect(response.status).toBe(200);
    expect(endTime - startTime).toBeLessThan(500);
  });
});
```

### Database Query Performance Tests
```typescript
describe('Database Query Performance', () => {
  test('should optimize profile queries with select_related', async () => {
    // Arrange
    const startTime = Date.now();
    
    // Act
    const user = await User.objects.select_related('profile').get(username='testuser');
    const endTime = Date.now();
    
    // Assert
    expect(user.profile).toBeDefined();
    expect(endTime - startTime).toBeLessThan(100);
  });
});
```

## Authentication Integration Tests

### Login Flow Tests
```typescript
describe('Authentication Integration', () => {
  test('should complete login flow successfully', async () => {
    // Arrange
    const credentials = {
      username: 'testuser',
      password: 'testpass'
    };
    
    // Act
    const loginResponse = await fetch('/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const { access_token } = await loginResponse.json();
    
    // Use token to access protected endpoint
    const profileResponse = await fetch('/api/users/profile/testuser/', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    
    // Assert
    expect(loginResponse.status).toBe(200);
    expect(profileResponse.status).toBe(200);
  });
});
```

## Caching Integration Tests

### Cache Hit/Miss Tests
```typescript
describe('Caching Integration', () => {
  test('should cache profile data and return cached version', async () => {
    // Arrange
    const cacheKey = 'user_profile_testuser';
    
    // Act - First request (cache miss)
    const firstResponse = await fetch('/api/users/profile/testuser/');
    const firstData = await firstResponse.json();
    
    // Act - Second request (cache hit)
    const secondResponse = await fetch('/api/users/profile/testuser/');
    const secondData = await secondResponse.json();
    
    // Assert
    expect(firstData).toEqual(secondData);
    expect(cache.get(cacheKey)).toBeDefined();
  });
});
```

## Error Handling Integration Tests

### Network Error Tests
```typescript
describe('Error Handling Integration', () => {
  test('should handle network errors gracefully', async () => {
    // Arrange
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    // Act & Assert
    await expect(fetch('/api/users/profile/testuser/')).rejects.toThrow('Network error');
    
    // Cleanup
    global.fetch = originalFetch;
  });
});
```

### Rate Limiting Tests
```typescript
describe('Rate Limiting Integration', () => {
  test('should enforce rate limits correctly', async () => {
    // Arrange
    const requests = Array(101).fill(null).map(() => 
      fetch('/api/users/profile/testuser/')
    );
    
    // Act
    const responses = await Promise.all(requests);
    
    // Assert
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});
```

## Test Environment Setup

### Test Database Configuration
```python
# settings_test.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Disable caching for tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}
```

### Test API Client
```typescript
// test-api-client.ts
export class TestAPIClient {
  private baseURL: string;
  private authToken?: string;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
  }

  async login(username: string, password: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/api/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    this.authToken = data.access_token;
    return this.authToken;
  }

  async getProfile(username: string): Promise<any> {
    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseURL}/api/users/profile/${username}/`, {
      headers
    });
    
    return response.json();
  }
}
```

## Test Data Management

### Fixtures Setup
```typescript
// test-fixtures.ts
export const createTestUser = async (userData: any) => {
  const response = await fetch('/api/auth/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  return response.json();
};

export const createTestPost = async (postData: any, authToken: string) => {
  const response = await fetch('/api/posts/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(postData)
  });
  
  return response.json();
};
```

## Performance Monitoring Tests

### Load Testing
```typescript
describe('Load Testing Integration', () => {
  test('should handle concurrent profile requests', async () => {
    // Arrange
    const concurrentRequests = 50;
    const requests = Array(concurrentRequests).fill(null).map(() =>
      fetch('/api/users/profile/testuser/')
    );
    
    // Act
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    
    // Assert
    const successfulResponses = responses.filter(r => r.status === 200);
    expect(successfulResponses.length).toBe(concurrentRequests);
    expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
  });
});
```

## Continuous Integration Setup

### GitHub Actions Workflow
```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
          
      - name: Install dependencies
        run: |
          npm install
          pip install -r backend/requirements.txt
          
      - name: Run backend tests
        run: |
          cd backend
          python manage.py test --settings=bsn.settings_test
          
      - name: Run frontend tests
        run: npm test -- --coverage
          
      - name: Run integration tests
        run: npm run test:integration
```

## Test Reporting

### Coverage Reports
```typescript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};
```

### Performance Reports
```typescript
// performance-test-reporter.ts
export class PerformanceTestReporter {
  private metrics: Array<{
    testName: string;
    duration: number;
    endpoint: string;
    timestamp: Date;
  }> = [];

  recordMetric(testName: string, duration: number, endpoint: string) {
    this.metrics.push({
      testName,
      duration,
      endpoint,
      timestamp: new Date(),
    });
  }

  generateReport() {
    const avgDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length;
    const slowTests = this.metrics.filter(m => m.duration > 1000);
    
    return {
      totalTests: this.metrics.length,
      averageDuration: avgDuration,
      slowTests: slowTests.length,
      metrics: this.metrics,
    };
  }
}
```

## Best Practices

### 1. Test Isolation
- Jeder Test sollte unabhängig sein
- Test-Daten nach jedem Test bereinigen
- Mock externe Dependencies

### 2. Realistic Test Data
- Verwende realistische Test-Daten
- Teste Edge Cases und Error-Szenarien
- Simuliere echte Nutzer-Interaktionen

### 3. Performance Monitoring
- Überwache Test-Performance
- Setze Performance-Benchmarks
- Alerte bei Performance-Regressionen

### 4. Continuous Testing
- Automatische Tests bei jedem Commit
- Parallel Test-Execution
- Schnelle Feedback-Loops

### 5. Test Maintenance
- Regelmäßige Test-Updates
- Refactoring bei Code-Änderungen
- Dokumentation der Test-Szenarien

## Next Steps

### Phase 1: Basic Integration Tests
- [ ] Profile API Integration Tests
- [ ] Authentication Flow Tests
- [ ] Follow System Tests
- [ ] Media Upload Tests

### Phase 2: Performance Tests
- [ ] API Response Time Tests
- [ ] Database Query Performance Tests
- [ ] Caching Integration Tests
- [ ] Load Testing

### Phase 3: Advanced Tests
- [ ] Error Handling Tests
- [ ] Rate Limiting Tests
- [ ] Security Tests
- [ ] End-to-End Tests

### Phase 4: Monitoring & Reporting
- [ ] Test Coverage Reports
- [ ] Performance Metrics
- [ ] Automated Alerts
- [ ] Continuous Integration 