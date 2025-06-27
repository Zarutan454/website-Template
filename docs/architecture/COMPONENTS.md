# BSN Website Components Documentation

This document provides a comprehensive overview of the components used in the BSN (Blockchain Social Network) website template.

## Table of Contents

1. [Core Components](#core-components)
2. [Authentication Components](#authentication-components)
3. [Token and Blockchain Components](#token-and-blockchain-components)
4. [User Engagement Components](#user-engagement-components)
5. [Dashboard Components](#dashboard-components)
6. [UI Components](#ui-components)
7. [Animation Components](#animation-components)
8. [Utility Components](#utility-components)
9. [Component Integration](#component-integration)
10. [Styling Guidelines](#styling-guidelines)

## Core Components

### App (`App.jsx`)

The main application component that handles routing and global state.

**Features:**
- React Router setup
- Global state management
- Authentication context
- Error boundary integration
- Performance monitoring

**Usage:**
```jsx
import App from './App';

function Main() {
  return <App />;
}
```

### Navbar (`Navbar.jsx`)

The main navigation component that appears at the top of the website.

**Features:**
- Responsive design with mobile menu
- Dynamic navigation links based on authentication state
- Language switcher integration
- Wallet connection status
- User dropdown menu

**Props:**
- `isAuthenticated` (boolean): User authentication status
- `user` (object): User data object
- `onLogout` (function): Logout handler

**Usage:**
```jsx
<Navbar 
  isAuthenticated={isAuthenticated}
  user={user}
  onLogout={handleLogout}
/>
```

### Footer (`Footer.jsx`)

The footer section that appears at the bottom of the website.

**Features:**
- Multi-column layout for different content sections
- Social media links with hover animations
- Newsletter signup form
- Language selector
- Scroll-to-top functionality
- Responsive design

**Usage:**
```jsx
<Footer />
```

### PageTemplate (`PageTemplate.jsx`)

A template component that provides consistent page layout.

**Features:**
- SEO meta tags
- Page title management
- Consistent header/footer structure
- Loading states
- Error boundaries

**Props:**
- `title` (string): Page title
- `description` (string): Meta description
- `children` (node): Page content

**Usage:**
```jsx
<PageTemplate title="Dashboard" description="User dashboard">
  <DashboardContent />
</PageTemplate>
```

## Authentication Components

### LoginForm (`LoginForm.jsx`)

User login form component.

**Features:**
- Form validation
- Password visibility toggle
- Remember me functionality
- Social login integration
- Error handling

**Props:**
- `onLogin` (function): Login handler
- `loading` (boolean): Loading state

**Usage:**
```jsx
<LoginForm onLogin={handleLogin} loading={isLoading} />
```

### RegisterForm (`RegisterForm.jsx`)

User registration form component.

**Features:**
- Multi-step form
- Real-time validation
- Password strength indicator
- Terms and privacy acceptance
- Referral code input

**Props:**
- `onRegister` (function): Registration handler
- `referralCode` (string): Pre-filled referral code

**Usage:**
```jsx
<RegisterForm 
  onRegister={handleRegister} 
  referralCode={referralCode}
/>
```

### RegistrationForm (`RegistrationForm.jsx`)

Enhanced registration form with additional features.

**Features:**
- Step-by-step registration process
- Email verification flow
- Profile setup
- Welcome messaging

### ForgotPassword (`ForgotPassword.jsx`)

Password reset request component.

**Features:**
- Email input validation
- Reset link sending
- Success/error messaging

### ResetPassword (`ResetPassword.jsx`)

Password reset confirmation component.

**Features:**
- Token validation
- New password input
- Password confirmation
- Security requirements display

### VerifyEmail (`VerifyEmail.jsx`)

Email verification component.

**Features:**
- Token verification
- Resend verification email
- Success/error states

### ProtectedRoute (`ProtectedRoute.jsx`)

Route protection wrapper component.

**Features:**
- Authentication check
- Redirect to login
- Loading states
- Role-based access

**Props:**
- `children` (node): Protected content
- `requiredRole` (string): Required user role
- `redirectTo` (string): Redirect path

**Usage:**
```jsx
<ProtectedRoute requiredRole="user">
  <DashboardPage />
</ProtectedRoute>
```

## Token and Blockchain Components

### TokenReservationForm (`TokenReservationForm.jsx`)

Token reservation/purchase form.

**Features:**
- Amount input with validation
- Price calculation
- Payment method selection
- Wallet address input
- Terms acceptance

**Props:**
- `onReservation` (function): Reservation handler
- `currentPhase` (object): Current sale phase data

### FaucetWidget (`FaucetWidget.jsx`)

Token faucet claim widget.

**Features:**
- Claim button with cooldown
- Balance display
- Claim history
- Captcha integration
- Wallet connection

**Props:**
- `userBalance` (number): Current user balance
- `onClaim` (function): Claim handler

### ICOPhaseSystem (`ICOPhaseSystem.jsx`)

ICO phase management and display component.

**Features:**
- Phase timeline visualization
- Progress indicators
- Phase-specific information
- Countdown timers

### InvestmentCalculator (`InvestmentCalculator.jsx`)

Investment calculation tool.

**Features:**
- Amount input
- ROI calculation
- Price projections
- Bonus calculations

### ReservationHistory (`ReservationHistory.jsx`)

User's token reservation history.

**Features:**
- Paginated list
- Status indicators
- Transaction details
- Export functionality

### WalletConnectButton (`WalletConnectButton.jsx`)

Wallet connection interface.

**Features:**
- Multiple wallet support
- Connection status
- Account switching
- Disconnect functionality

## User Engagement Components

### NewsletterForm (`NewsletterForm.jsx`)

Newsletter subscription form.

**Features:**
- Email validation
- Interest selection
- GDPR compliance
- Success/error messaging

### FAQ (`FAQ.jsx`)

Frequently asked questions component.

**Features:**
- Expandable accordion
- Search functionality
- Category filtering
- Responsive design

### TeamSection (`TeamSection.jsx`)

Team member showcase.

**Features:**
- Member cards with photos
- Role and bio information
- Social media links
- Grid layout

### Benefits (`Benefits.jsx`)

Platform benefits display.

**Features:**
- Icon-based benefit cards
- Animated entrance effects
- Responsive grid
- Hover interactions

### CTA (`CTA.jsx`) and UpdatedCTA (`UpdatedCTA.jsx`)

Call-to-action components.

**Features:**
- Attention-grabbing design
- Multiple action buttons
- Background effects
- Conversion tracking

## Dashboard Components

### DashboardPage (`DashboardPage.jsx`)

Main dashboard page component.

**Features:**
- User statistics overview
- Quick actions
- Recent activity
- Widget layout

### DashboardStats (`DashboardStats.jsx`)

Dashboard statistics widget.

**Features:**
- Key metrics display
- Charts and graphs
- Real-time updates
- Responsive cards

### FaucetWidget (`FaucetWidget.jsx`)

Dashboard faucet widget.

**Features:**
- Quick claim access
- Balance display
- Claim status
- Next claim timer

### MiningWidget (`MiningWidget.jsx`)

Social mining widget.

**Features:**
- Mining status
- Earnings display
- Activity tracking
- Performance metrics

### ReferralWidget (`ReferralWidget.jsx`)

Referral program widget.

**Features:**
- Referral link generation
- Statistics display
- Earning tracking
- Share functionality

### TokenWidget (`TokenWidget.jsx`)

Token balance and information widget.

**Features:**
- Balance display
- Price information
- Transaction history
- Quick actions

### TransactionHistory (`TransactionHistory.jsx`)

Transaction history component.

**Features:**
- Paginated transaction list
- Filtering options
- Export functionality
- Status indicators

### UserStats (`UserStats.jsx`)

User statistics component.

**Features:**
- Activity metrics
- Achievement progress
- Ranking information
- Performance charts

## UI Components

### Toast (`Toast.jsx`)

Toast notification component.

**Features:**
- Multiple notification types
- Auto-dismiss
- Action buttons
- Animation effects

**Props:**
- `type` (string): Notification type (success, error, warning, info)
- `message` (string): Notification message
- `onClose` (function): Close handler

### Card (`Card.jsx`)

Reusable card component.

**Features:**
- Multiple variants
- Hover effects
- Loading states
- Responsive design

**Props:**
- `variant` (string): Card style variant
- `children` (node): Card content
- `className` (string): Additional CSS classes

### Button (`Button.jsx`)

Enhanced button component.

**Features:**
- Multiple sizes and variants
- Loading states
- Icon support
- Disabled states

**Props:**
- `variant` (string): Button style
- `size` (string): Button size
- `loading` (boolean): Loading state
- `onClick` (function): Click handler

### Modal (`Modal.jsx`)

Modal dialog component.

**Features:**
- Backdrop click to close
- Keyboard navigation
- Animation effects
- Responsive sizing

### LanguageSwitcher (`LanguageSwitcher.jsx`)

Language selection component.

**Features:**
- Dropdown language selector
- Flag icons
- Persistent selection
- RTL support

### SEO (`SEO.jsx`)

SEO meta tags component.

**Features:**
- Dynamic meta tags
- Open Graph tags
- Twitter cards
- Structured data

**Props:**
- `title` (string): Page title
- `description` (string): Meta description
- `image` (string): OG image URL

## Animation Components

### BlockchainParticlesEffect (`BlockchainParticlesEffect.jsx`)

Animated blockchain particles background.

**Features:**
- WebGL-based animations
- Responsive design
- Performance optimization
- Customizable parameters

### DataFlowAnimation (`DataFlowAnimation.jsx`)

Data flow visualization component.

**Features:**
- Real-time data streams
- Interactive elements
- Smooth animations
- Performance monitoring

### GlowingParticles (`GlowingParticles.jsx`)

Glowing particle effects.

**Features:**
- GPU-accelerated animations
- Color customization
- Density controls
- Performance optimization

### EnhancedBackground (`EnhancedBackground.jsx`)

Enhanced background with effects.

**Features:**
- Multiple background layers
- Parallax effects
- Interactive elements
- Responsive design

### BlockchainBackground (`BlockchainBackground.jsx`)

Blockchain-themed background component.

**Features:**
- Animated blockchain visualization
- Network connections
- Node interactions
- Performance optimization

## Utility Components

### ErrorBoundary (`ErrorBoundary.jsx`)

Error boundary for catching React errors.

**Features:**
- Error catching and logging
- Fallback UI
- Error reporting
- Development vs production modes

**Props:**
- `children` (node): Components to wrap
- `fallback` (component): Fallback component

### LazyLoader (`LazyLoader.jsx`)

Lazy loading wrapper component.

**Features:**
- Intersection Observer API
- Loading placeholders
- Error handling
- Performance optimization

### PerformanceMonitor (`PerformanceMonitor.jsx`)

Performance monitoring component.

**Features:**
- Web Vitals tracking
- Performance metrics
- Development tools
- Reporting integration

### TranslationChecker (`TranslationChecker.jsx`)

Translation validation component.

**Features:**
- Missing translation detection
- Translation key validation
- Language coverage reports
- Development tools

## Component Integration

### App Structure

The main application structure follows this pattern:

```jsx
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-black text-white">
              <PerformanceMonitor />
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                  {/* More routes */}
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

### Context Providers

The application uses several context providers:

1. **AuthContext**: Authentication state management
2. **ToastContext**: Global notification system
3. **WalletContext**: Blockchain wallet integration

### State Management

Components use a combination of:
- React hooks (useState, useEffect, useContext)
- Context API for global state
- Local component state for UI interactions

## Styling Guidelines

### CSS Framework

The project uses TailwindCSS for styling with custom configurations:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#f43f5e',
        secondary: '#8b5cf6',
        dark: {
          100: '#1a1a1a',
          200: '#2a2a2a',
          300: '#3a3a3a',
          400: '#4a4a4a'
        }
      }
    }
  }
}
```

### Component Styling Patterns

1. **Base Classes**: Use consistent base classes
2. **Responsive Design**: Mobile-first approach
3. **Dark Theme**: Default dark theme with light mode support
4. **Animations**: CSS transitions and Framer Motion
5. **Accessibility**: ARIA labels and keyboard navigation

### Example Component Styling

```jsx
// Good: Consistent styling pattern
const Button = ({ variant = 'primary', size = 'md', children, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary/90 text-white',
    secondary: 'bg-secondary hover:bg-secondary/90 text-white',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

### Responsive Design

All components should follow mobile-first responsive design:

```jsx
// Mobile-first responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

### Animation Guidelines

Use Framer Motion for complex animations:

```jsx
import { motion } from 'framer-motion';

const AnimatedCard = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.05 }}
    className="bg-dark-300 rounded-lg p-6"
  >
    {children}
  </motion.div>
);
```

## Development Guidelines

### Component Creation

1. Use functional components with hooks
2. Implement proper TypeScript types (if using TS)
3. Add PropTypes for prop validation
4. Include proper documentation
5. Write unit tests
6. Follow accessibility guidelines

### File Structure

```
src/
├── components/
│   ├── atoms/          # Basic UI components
│   ├── molecules/      # Composed components
│   ├── organisms/      # Complex components
│   ├── templates/      # Page templates
│   └── pages/          # Page components
├── hooks/              # Custom hooks
├── context/            # Context providers
├── utils/              # Utility functions
└── styles/             # Global styles
```

### Testing

Each component should include:
- Unit tests with Jest and React Testing Library
- Accessibility tests
- Visual regression tests (if applicable)
- Performance tests for complex components

### Performance Optimization

1. Use React.memo for expensive components
2. Implement lazy loading for large components
3. Optimize images and assets
4. Use code splitting
5. Monitor bundle size

This documentation serves as a comprehensive guide for understanding and working with the BSN website components. For specific implementation details, refer to the individual component files in the codebase. 