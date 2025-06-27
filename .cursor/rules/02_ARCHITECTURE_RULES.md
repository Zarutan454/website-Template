# BSN Architektur-Regeln für Cursor

## 🏗️ Systemarchitektur

### Clean Architecture Prinzipien
```
┌─────────────────────────────────────────┐
│                Frontend                 │
├─────────────────────────────────────────┤
│                REST API                 │
├─────────────────────────────────────────┤
│              Business Logic             │
├─────────────────────────────────────────┤
│               Data Layer                │
└─────────────────────────────────────────┘
```

## 📁 Komponenten-Architektur Regeln

### Frontend Component Structure (Verpflichtend)
```
src/
├── components/
│   ├── atoms/           # Basic UI Elements
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Badge.jsx
│   ├── molecules/       # Combined Atoms
│   │   ├── Card.jsx
│   │   └── FormField.jsx
│   ├── organisms/       # Complex Components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── Form.jsx
│   ├── templates/       # Page Layouts
│   │   └── PageTemplate.jsx
│   └── pages/          # Full Pages
│       ├── HomePage.jsx
│       └── DashboardPage.jsx
```

### Component Naming Rules
1. **PascalCase** für alle Komponenten: `UserProfile.jsx`
2. **Descriptive Names**: `TokenReservationForm.jsx` nicht `Form.jsx`
3. **Context Suffix**: `AuthContext.jsx`, `ThemeContext.jsx`
4. **Hook Prefix**: `useAuth.js`, `useMining.js`
5. **Page Suffix**: `DashboardPage.jsx`, `AboutPage.jsx`

## 🎯 Component Design Rules

### Atomic Design Pattern (Verpflichtend)

#### Atoms (Basic Elements)
```jsx
// ✅ RICHTIG - Pure, wiederverwendbar
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}) => {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`}
      {...props}
    >
      {children}
    </button>
  )
}

// ❌ FALSCH - Zu spezifisch für Atom
const SavePostButton = () => {...}
```

#### Molecules (Combined Atoms)
```jsx
// ✅ RICHTIG - Kombiniert Atoms sinnvoll
const FormField = ({ label, error, children }) => {
  return (
    <div className="form-field">
      <Label>{label}</Label>
      {children}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  )
}
```

#### Organisms (Complex Components)
```jsx
// ✅ RICHTIG - Komplexe Business Logic
const MiningDashboard = () => {
  const { miningData, isLoading } = useMining()
  
  return (
    <Card>
      <MiningStats data={miningData} />
      <MiningControls onStart={startMining} />
      <MiningHistory transactions={miningData.history} />
    </Card>
  )
}
```

## 🔗 Props & State Management Rules

### Props Validation (Verpflichtend)
```jsx
// ✅ RICHTIG - Mit PropTypes oder TypeScript
import PropTypes from 'prop-types'

const UserCard = ({ user, onEdit, showActions = true }) => {
  // Component logic
}

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  }).isRequired,
  onEdit: PropTypes.func,
  showActions: PropTypes.bool
}
```

### State Management Rules
```jsx
// ✅ RICHTIG - Lokaler State für UI-State
const [isOpen, setIsOpen] = useState(false)

// ✅ RICHTIG - Context für App-weiten State
const { user, isAuthenticated } = useContext(AuthContext)

// ✅ RICHTIG - Custom Hooks für Business Logic
const { mining, startMining, stopMining } = useMining()

// ❌ FALSCH - Props Drilling vermeiden
<Component1 user={user}>
  <Component2 user={user}>
    <Component3 user={user} />
  </Component2>
</Component1>
```

## 🎨 Styling Architecture Rules

### CSS Class Naming (BEM-Style)
```css
/* ✅ RICHTIG - BEM Konvention */
.mining-dashboard {}
.mining-dashboard__stats {}
.mining-dashboard__stats--active {}

/* ✅ RICHTIG - Tailwind Utility Classes */
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors;
}

/* ❌ FALSCH - Unspezifische Namen */
.container {}
.box {}
.thing {}
```

### Component Styling Rules
```jsx
// ✅ RICHTIG - CSS Modules oder Styled Components
import styles from './MiningDashboard.module.css'

const MiningDashboard = () => (
  <div className={styles.dashboard}>
    <div className={styles.stats}>...</div>
  </div>
)

// ✅ RICHTIG - Tailwind mit clsx für conditional classes
import clsx from 'clsx'

const Button = ({ variant, isLoading }) => (
  <button className={clsx(
    'px-4 py-2 rounded-lg transition-colors',
    {
      'bg-blue-600 hover:bg-blue-700': variant === 'primary',
      'bg-gray-600 hover:bg-gray-700': variant === 'secondary',
      'opacity-50 cursor-not-allowed': isLoading
    }
  )}>
    {isLoading ? 'Loading...' : 'Submit'}
  </button>
)
```

## 🔄 State Flow Architecture

### Data Flow Rules (Redux-Style)
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Component   │───▶│   Action    │───▶│    Store    │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                                      │
       │                ┌─────────────┐      │
       └────────────────│   Selector  │◀─────┘
                        └─────────────┘
```

### Context Architecture (BSN-Specific)
```jsx
// ✅ RICHTIG - Separierte Context für verschiedene Bereiche
const AuthContext = createContext()      // User authentication
const MiningContext = createContext()    // Mining system
const WalletContext = createContext()    // Wallet operations
const ThemeContext = createContext()     // UI theme
const ToastContext = createContext()     // Notifications

// ✅ RICHTIG - Context Provider Structure
const BSNProvider = ({ children }) => (
  <AuthProvider>
    <ThemeProvider>
      <WalletProvider>
        <MiningProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </MiningProvider>
      </WalletProvider>
    </ThemeProvider>
  </AuthProvider>
)
```

## 🔌 API Integration Rules

### Service Layer Architecture
```jsx
// ✅ RICHTIG - Separierte Service Layer
// services/api.js
export const apiService = {
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout')
  },
  mining: {
    getStatus: () => api.get('/mining/status'),
    start: () => api.post('/mining/start'),
    claim: () => api.post('/mining/claim')
  },
  user: {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (data) => api.put('/user/profile', data)
  }
}

// ✅ RICHTIG - Custom Hook für API Calls
const useMining = () => {
  const [miningData, setMiningData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const startMining = async () => {
    setIsLoading(true)
    try {
      const response = await apiService.mining.start()
      setMiningData(response.data)
    } catch (error) {
      console.error('Mining start failed:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return { miningData, startMining, isLoading }
}
```

### Error Handling Architecture
```jsx
// ✅ RICHTIG - Centralized Error Handling
const ErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundaryComponent
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Component Error:', error, errorInfo)
        // Send to monitoring service
      }}
    >
      {children}
    </ErrorBoundaryComponent>
  )
}

// ✅ RICHTIG - API Error Handling
const apiWithErrorHandling = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000
})

apiWithErrorHandling.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

## 📱 Responsive Architecture Rules

### Breakpoint System (Verpflichtend)
```css
/* Mobile First Approach */
:root {
  --breakpoint-sm: 640px;   /* Small devices */
  --breakpoint-md: 768px;   /* Medium devices */
  --breakpoint-lg: 1024px;  /* Large devices */
  --breakpoint-xl: 1280px;  /* Extra large devices */
}

/* ✅ RICHTIG - Mobile First Media Queries */
.component {
  /* Mobile styles (default) */
  padding: 1rem;
  
  @media (min-width: 768px) {
    /* Tablet styles */
    padding: 2rem;
  }
  
  @media (min-width: 1024px) {
    /* Desktop styles */
    padding: 3rem;
  }
}
```

### Component Responsiveness Rules
```jsx
// ✅ RICHTIG - Responsive Component Logic
const MiningDashboard = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  
  return (
    <div className={clsx(
      'mining-dashboard',
      {
        'grid-cols-1': isMobile,
        'grid-cols-2': isTablet,
        'grid-cols-3': isDesktop
      }
    )}>
      {/* Content */}
    </div>
  )
}

// ✅ RICHTIG - Conditional Rendering für Mobile
const Navbar = () => {
  const { isMobile } = useResponsive()
  
  return (
    <nav>
      {isMobile ? <MobileMenu /> : <DesktopMenu />}
    </nav>
  )
}
```

## 🚀 Performance Architecture Rules

### Code Splitting Rules
```jsx
// ✅ RICHTIG - Route-based Code Splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const MiningPage = lazy(() => import('./pages/MiningPage'))

// ✅ RICHTIG - Component-based Code Splitting
const HeavyComponent = lazy(() => 
  import('./components/HeavyComponent').then(module => ({
    default: module.HeavyComponent
  }))
)

// ✅ RICHTIG - Lazy Loading mit Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/mining" element={<MiningPage />} />
  </Routes>
</Suspense>
```

### Memoization Rules
```jsx
// ✅ RICHTIG - React.memo für teure Komponenten
const MiningStats = React.memo(({ stats }) => {
  return (
    <div>
      {/* Heavy rendering logic */}
    </div>
  )
}, (prevProps, nextProps) => {
  return prevProps.stats.hash === nextProps.stats.hash
})

// ✅ RICHTIG - useMemo für teure Berechnungen
const ExpensiveComponent = ({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => complexCalculation(item))
  }, [data])
  
  return <div>{processedData.map(item => ...)}</div>
}

// ✅ RICHTIG - useCallback für Funktionen
const ParentComponent = () => {
  const handleMiningStart = useCallback(() => {
    // Mining logic
  }, [])
  
  return <MiningControls onStart={handleMiningStart} />
}
```

## ⚠️ Architektur-Verbote

### DON'Ts (Niemals tun)
```jsx
// ❌ NIEMALS - Direkte DOM Manipulation in React
document.getElementById('element').innerHTML = 'content'

// ❌ NIEMALS - Inline Styles für komplexe Styling
<div style={{marginTop: '10px', backgroundColor: '#333', ...}}>

// ❌ NIEMALS - Props Drilling über 3 Levels
<A prop={value}>
  <B prop={value}>
    <C prop={value}>
      <D prop={value} />
    </C>
  </B>
</A>

// ❌ NIEMALS - State Mutation
state.user.name = 'New Name'  // Use setState instead

// ❌ NIEMALS - Mixed Concerns in Components
const UserProfile = () => {
  // API calls, UI logic, business logic all mixed
}

// ❌ NIEMALS - Hardcoded Values
const API_URL = 'https://api.example.com'  // Use env variables
```

### Critical Architecture Rules (BINDING)
1. **IMMER** Atomic Design Pattern befolgen
2. **NIEMALS** mehr als 3 Props-Levels ohne Context
3. **IMMER** Error Boundaries für Fehlerfälle
4. **NIEMALS** Inline-Styles für Production Code
5. **IMMER** Responsive Design von Beginn an
6. **NIEMALS** Direct DOM Manipulation in React
7. **IMMER** Code Splitting für bessere Performance
8. **NIEMALS** State-Mutation, immer immutable Updates

**Diese Architektur-Regeln sind bindend und garantieren sauberen, wartbaren Code!** 