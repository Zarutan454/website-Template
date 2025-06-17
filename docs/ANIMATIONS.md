# Animation System Documentation

This document provides an overview of the animation system used in the BSN website template.

## Overview

The animation system in this project consists of:
1. CSS animations defined in `blockchain-styles.css`
2. React components and hooks in `src/utils/animations.jsx`
3. Custom animation integration in various components
4. Advanced animation components in `src/components/animations/`

## Animation Components

### BlockchainParticles

A component that renders floating particles in the background to create a dynamic blockchain-themed effect.

```jsx
import { BlockchainParticles } from '../utils/animations';

// Usage
<BlockchainParticles count={20} color="#00a2ff" opacity={0.3} />
```

**Props:**
- `count`: Number of particles (default: 20)
- `color`: Color of particles (default: '#00a2ff')
- `opacity`: Opacity of particles (default: 0.3)

### BlockchainConnections

A component that renders animated connection lines to simulate blockchain network connections.

```jsx
import { BlockchainConnections } from '../utils/animations';

// Usage
<BlockchainConnections count={5} color="#00a2ff" opacity={0.2} />
```

**Props:**
- `count`: Number of connection lines (default: 5)
- `color`: Color of lines (default: '#00a2ff')
- `opacity`: Opacity of lines (default: 0.2)

### AnimatedSection

A component that animates its children when they enter the viewport.

```jsx
import { AnimatedSection } from '../utils/animations';

// Usage
<AnimatedSection delay={300} className="my-class">
  <p>Content to animate</p>
</AnimatedSection>
```

**Props:**
- `delay`: Animation delay in milliseconds (default: 300)
- `className`: Additional CSS classes
- `children`: Content to animate

### AnimatedCard

A component that creates a card with hover effects and entrance animation.

```jsx
import { AnimatedCard } from '../utils/animations';

// Usage
<AnimatedCard delay={200} className="p-4 rounded-lg">
  <h3>Card Title</h3>
  <p>Card content</p>
</AnimatedCard>
```

**Props:**
- `delay`: Animation delay in milliseconds (default: 0)
- `className`: Additional CSS classes
- `children`: Card content

## Advanced Animation Components

### BlockchainParticlesEffect

A more complex version of BlockchainParticles that creates particles and connections between them.

```jsx
import BlockchainParticlesEffect from './components/animations/BlockchainParticlesEffect';

// Usage
<BlockchainParticlesEffect particleCount={25} connectionCount={8} />
```

**Props:**
- `particleCount`: Number of particles (default: 30)
- `connectionCount`: Number of connections (default: 10)

### DataFlowAnimation

Creates an interactive network of nodes with data packets flowing between them.

```jsx
import DataFlowAnimation from './components/animations/DataFlowAnimation';

// Usage
<DataFlowAnimation nodeCount={12} packetCount={4} speed={0.8} />
```

**Props:**
- `nodeCount`: Number of network nodes (default: 8)
- `packetCount`: Number of data packets per connection (default: 3)
- `color`: Color of nodes and packets (default: '#00a2ff')
- `speed`: Animation speed multiplier (default: 1)
- `opacity`: Base opacity (default: 0.6)
- `showLabels`: Whether to show node labels (default: false)

### HexagonGrid

Creates a grid of animated hexagons for a tech/blockchain aesthetic.

```jsx
import HexagonGrid from './components/animations/HexagonGrid';

// Usage
<HexagonGrid columns={15} rows={10} size={40} gap={10} opacity={0.2} />
```

**Props:**
- `columns`: Number of columns in the grid (default: 10)
- `rows`: Number of rows in the grid (default: 10)
- `size`: Size of each hexagon in pixels (default: 30)
- `gap`: Gap between hexagons in pixels (default: 5)
- `color`: Color of hexagons (default: '#00a2ff')
- `pulseDelay`: Delay between pulses in milliseconds (default: 150)
- `opacity`: Base opacity (default: 0.3)
- `rotationSpeed`: Speed of rotation (default: 0.5)

### GlowingParticles

Creates animated glowing particles that move around with optional trails.

```jsx
import GlowingParticles from './components/animations/GlowingParticles';

// Usage
<GlowingParticles 
  particleCount={40} 
  minSize={2} 
  maxSize={5}
  glowIntensity={8}
  trails={true}
/>
```

**Props:**
- `particleCount`: Number of particles (default: 20)
- `minSize`: Minimum particle size in pixels (default: 2)
- `maxSize`: Maximum particle size in pixels (default: 8)
- `minSpeed`: Minimum particle speed (default: 0.2)
- `maxSpeed`: Maximum particle speed (default: 0.8)
- `color`: Particle color (default: '#00a2ff')
- `baseOpacity`: Base opacity (default: 0.4)
- `glowIntensity`: Intensity of glow effect (default: 10)
- `trails`: Whether to show particle trails (default: false)

## Utility Functions

### useScrollAnimation

A custom hook that detects when an element enters the viewport.

```jsx
import { useScrollAnimation } from '../utils/animations';

// Usage in a component
const MyComponent = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);
  
  return (
    <div 
      ref={ref} 
      className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      Content that fades in when visible
    </div>
  );
};
```

**Parameters:**
- `threshold`: Visibility threshold (0-1) (default: 0.1)

**Returns:**
- `[ref, isVisible]`: A ref to attach to the element and a boolean indicating visibility

### addExtendedAnimations

A function that adds additional CSS animations to the document.

```jsx
import { addExtendedAnimations } from '../utils/animations';

// Usage in useEffect
useEffect(() => {
  addExtendedAnimations();
}, []);
```

## CSS Animation Classes

The following CSS classes are available for use:

- `.animate-float`: Gentle floating animation
- `.animate-float-slow`: Slower floating animation
- `.animate-pulse-glow`: Pulsing glow effect
- `.animate-blockchain-flow`: Horizontal flow animation
- `.animate-expand-right`: Expansion animation from left to right
- `.animate-expand-left`: Expansion animation from right to left
- `.animate-rotate-slow`: Slow rotation animation
- `.animate-shimmer`: Shimmering effect
- `.animate-pulse-border`: Pulsing border effect
- `.animate-data-flow`: Data flow animation
- `.animate-spin-slow`: Slow spinning animation
- `.animate-spin-very-slow`: Very slow spinning animation

## Integration with Components

To integrate animations into components:

1. Import the required animation components or hooks
2. Use them directly in your component JSX
3. For CSS animations, add the appropriate classes to your elements

Example:

```jsx
import { AnimatedSection, BlockchainParticles } from '../utils/animations';

const MyComponent = () => {
  return (
    <div className="relative">
      {/* Background animations */}
      <BlockchainParticles count={15} />
      
      {/* Content with animations */}
      <AnimatedSection delay={200}>
        <h2 className="animate-float">Animated Title</h2>
        <p className="animate-pulse-glow">This text has a pulsing glow effect</p>
      </AnimatedSection>
    </div>
  );
};
```

## Using the EnhancedBackground Component

The App.jsx file includes an `EnhancedBackground` component that makes it easy to switch between different animation types:

```jsx
// Example usage in a section
<section className="py-20 relative overflow-hidden">
  {/* Background with data flow animation */}
  <EnhancedBackground type="dataFlow" />
  
  <div className="container mx-auto px-6 relative z-10">
    {/* Section content */}
  </div>
</section>
```

**Available types:**
- `default`: Uses the standard BlockchainBackground
- `dataFlow`: Uses DataFlowAnimation
- `hexagons`: Uses HexagonGrid
- `particles`: Uses GlowingParticles

## Best Practices

1. Use animations sparingly to avoid overwhelming the user
2. Ensure animations work well on both desktop and mobile devices
3. Consider performance implications when using many animated elements
4. Use the `useScrollAnimation` hook to trigger animations only when elements are visible
5. Combine CSS and React animations for the best effect
6. For sections with heavy animations, use the IntersectionObserver pattern to only animate when in view 