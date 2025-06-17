# BSN Website Components Documentation

This document provides an overview of the components used in the BSN website template.

## Core Components

### Navbar (`Navbar.jsx`)

The main navigation component that appears at the top of the website.

**Features:**
- Responsive design with mobile menu
- Navigation links to different sections
- Optional authentication buttons
- Customizable logo and branding

**Usage:**
```jsx
<Navbar />
```

### Hero (`Hero.jsx`)

The main hero section that appears at the top of the landing page.

**Features:**
- Eye-catching headline and subheadline
- Call-to-action buttons
- Background animations
- Responsive design

**Usage:**
```jsx
<Hero />
```

### FeatureSection (`FeatureSection.jsx`)

Displays the main features of the product or service.

**Features:**
- Grid layout for feature cards
- Icons and descriptions
- Animated entrance effects
- Responsive design

**Usage:**
```jsx
<FeatureSection />
```

### Footer (`Footer.jsx`)

The footer section that appears at the bottom of the website.

**Features:**
- Multiple columns for different content
- Social media links
- Copyright information
- Newsletter signup form
- Responsive design

**Usage:**
```jsx
<Footer />
```

## Token and Blockchain Components

### Tokenomics (`Tokenomics.jsx`)

Displays tokenomics information with charts and data.

**Features:**
- Token distribution chart
- Token metrics
- Animated data visualization
- Responsive design

**Usage:**
```jsx
<Tokenomics />
```

### Roadmap (`Roadmap.jsx`)

Displays the project roadmap with timeline and milestones.

**Features:**
- Timeline visualization
- Milestone descriptions
- Status indicators (completed, in progress, planned)
- Responsive design

**Usage:**
```jsx
<Roadmap />
```

### FaucetWidget (`FaucetWidget.jsx`)

A widget for token faucet functionality.

**Features:**
- Input for wallet address
- Request button
- Status messages
- Captcha integration

**Usage:**
```jsx
<FaucetWidget />
```

### ReferralWidget (`ReferralWidget.jsx`)

A widget for the referral program.

**Features:**
- Referral link generation
- Copy to clipboard functionality
- Referral statistics
- Reward information

**Usage:**
```jsx
<ReferralWidget />
```

### TokenReservationWidget (`TokenReservationWidget.jsx`)

A widget for token reservation or presale.

**Features:**
- Input for amount and wallet address
- Price calculator
- Purchase button
- Status messages

**Usage:**
```jsx
<TokenReservationWidget />
```

## User Engagement Components

### RegistrationForm (`RegistrationForm.jsx`)

A form for user registration.

**Features:**
- Input fields for user information
- Form validation
- Submission handling
- Success/error messages

**Usage:**
```jsx
<RegistrationForm />
```

### NewsletterForm (`NewsletterForm.jsx`)

A form for newsletter subscription.

**Features:**
- Email input field
- Subscription button
- Success/error messages
- GDPR compliance checkbox

**Usage:**
```jsx
<NewsletterForm />
```

### FAQ (`FAQ.jsx`)

Displays frequently asked questions in an accordion format.

**Features:**
- Expandable question/answer pairs
- Categorized questions
- Search functionality
- Responsive design

**Usage:**
```jsx
<FAQ />
```

### TeamSection (`TeamSection.jsx`)

Displays team member information.

**Features:**
- Team member cards with photos
- Role and bio information
- Social media links
- Responsive grid layout

**Usage:**
```jsx
<TeamSection />
```

## Additional Components

### ProductShowcase (`ProductShowcase.jsx`)

Showcases product features with images and descriptions.

**Features:**
- Image gallery
- Feature descriptions
- Animated transitions
- Responsive design

**Usage:**
```jsx
<ProductShowcase />
```

### CTA (`CTA.jsx`) and UpdatedCTA (`UpdatedCTA.jsx`)

Call-to-action components to encourage user action.

**Features:**
- Attention-grabbing design
- Action buttons
- Background effects
- Responsive design

**Usage:**
```jsx
<CTA />
<UpdatedCTA />
```

### MagazineSpread (`MagazineSpread.jsx`)

A component that displays content in a magazine-style layout.

**Features:**
- Multi-column layout
- Image integration
- Pull quotes
- Responsive design

**Usage:**
```jsx
<MagazineSpread />
```

### TableOfContents (`TableOfContents.jsx`)

Displays a table of contents for navigation within a page.

**Features:**
- Linked sections
- Hierarchical structure
- Active section highlighting
- Smooth scrolling

**Usage:**
```jsx
<TableOfContents />
```

### Benefits (`Benefits.jsx`)

Displays the benefits of the product or service.

**Features:**
- Icon-based benefit cards
- Descriptions
- Animated entrance effects
- Responsive grid layout

**Usage:**
```jsx
<Benefits />
```

### Ingredients (`Ingredients.jsx`)

Displays ingredient information for token or product.

**Features:**
- Ingredient cards with icons
- Descriptions and details
- Percentage indicators
- Responsive design

**Usage:**
```jsx
<Ingredients />
```

## Component Integration

Most components are already integrated in the main `App.jsx` file. To add or remove components, modify the `App.jsx` file accordingly.

Example:
```jsx
function App() {
  // State and effects
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <FeatureSection />
      {/* Add or remove components here */}
      <Footer />
    </div>
  );
}
```

## Styling Components

Components use TailwindCSS for styling. To customize the appearance:

1. Use TailwindCSS utility classes directly in the component JSX
2. Modify the component's JSX structure
3. Update the `tailwind.config.js` file for global theme changes

Example of customizing a component:
```jsx
// Original
<Button className="bg-blue-500 hover:bg-blue-600">Click Me</Button>

// Customized
<Button className="bg-purple-500 hover:bg-purple-600 rounded-full">Click Me</Button>
``` 