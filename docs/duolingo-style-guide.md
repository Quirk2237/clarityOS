# 🦉 Duolingo-Inspired Style Guide

## Philosophy & Brand Principles

### Design Philosophy
- **Friendly & Approachable**: Every interaction should feel welcoming and encouraging
- **Gamified Learning**: Transform mundane tasks into engaging, game-like experiences  
- **Progress-Oriented**: Always show users their advancement and achievements
- **Accessible**: Design for all users, abilities, and contexts
- **Playful but Professional**: Maintain credibility while being fun

### Core Values
- **Motivation through Achievement**: Celebrate every small win
- **Consistency**: Predictable patterns build user confidence
- **Clarity**: Information should be immediately understandable
- **Encouragement**: Never punish failure, always encourage progress

---

## 🎨 Color System

### Primary Palette
```typescript
export const duolingoColors = {
  // Primary Brand Colors
  primary: {
    DEFAULT: '#58CC02',     // Duolingo Green
    50: '#F0FCE8',
    100: '#DDF9CC', 
    200: '#BEF264',
    300: '#8DE639',
    400: '#58CC02',
    500: '#46A302',
    600: '#378002',
    700: '#2D6102',
    800: '#1F4102',
    900: '#132801',
  },
  
  // Secondary Colors
  secondary: {
    DEFAULT: '#1CB0F6',     // Sky Blue
    50: '#E8F8FF',
    100: '#CCF0FF',
    200: '#8DE0FF',
    300: '#4DD0FF',
    400: '#1CB0F6',
    500: '#0B7BC7',
    600: '#064B98',
    700: '#032F69',
    800: '#01183A',
    900: '#000C1B',
  },
  
  // Accent Colors
  accent: {
    gold: '#FFD900',        // Achievement Gold
    orange: '#FF9600',      // Energy/Fire
    red: '#FF4B4B',        // Hearts/Lives
    purple: '#CE82FF',      // Premium/Special
    pink: '#FF82B2',       // Friendship/Social
  },
  
  // Semantic Colors
  success: '#58CC02',
  warning: '#FFD900', 
  error: '#FF4B4B',
  info: '#1CB0F6',
  
  // Neutral Colors
  gray: {
    50: '#F8F9FA',
    100: '#F1F3F4',
    200: '#E8EAED',
    300: '#DADCE0',
    400: '#BDC1C6',
    500: '#9AA0A6',
    600: '#80868B',
    700: '#5F6368',
    800: '#3C4043',
    900: '#202124',
  },
}
```

### Color Usage Guidelines

#### Primary Green (`#58CC02`)
- **Use for**: Primary CTAs, progress completion, success states
- **Don't use for**: Error states, destructive actions
- **Accessibility**: Ensure 4.5:1 contrast ratio with white text

#### Secondary Blue (`#1CB0F6`)  
- **Use for**: Secondary actions, links, informational elements
- **Pairs well with**: Primary green, neutral grays

#### Accent Colors
- **Gold**: Achievements, streaks, premium features
- **Orange**: Energy indicators, fire streaks, motivation
- **Red**: Lives/hearts, critical alerts (use sparingly)
- **Purple**: Premium features, special events
- **Pink**: Social features, friend interactions

---

## ✏️ Typography

### Font Hierarchy
```typescript
export const typography = {
  // Display Text
  display: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700', 
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32, 
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  
  // Body Text
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500', 
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  
  // UI Text
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  overline: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
}
```

### Typography Guidelines
- **Primary Font**: System font stack for optimal readability
- **Font Weights**: Use 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Line Height**: Generous spacing for readability (1.5x font size minimum)
- **Letter Spacing**: Subtle negative spacing for larger text, positive for small caps

---

## 📐 Spacing & Layout

### Spacing Scale
```typescript
export const spacing = {
  xs: 4,    // 0.25rem
  sm: 8,    // 0.5rem  
  md: 16,   // 1rem
  lg: 24,   // 1.5rem
  xl: 32,   // 2rem
  '2xl': 48, // 3rem
  '3xl': 64, // 4rem
  '4xl': 96, // 6rem
}
```

### Layout Principles
- **8pt Grid System**: All spacing increments should be multiples of 8
- **Consistent Margins**: Use `md` (16px) as default spacing between elements
- **Generous Touch Targets**: Minimum 44px for interactive elements
- **Safe Areas**: Respect device safe areas with proper padding

### Container Widths
```typescript
export const containers = {
  sm: 375,   // Mobile
  md: 768,   // Tablet
  lg: 1024,  // Desktop
  xl: 1280,  // Large Desktop
}
```

---

## 🧩 Component Guidelines

### Button Design Principles

#### Primary Button
```typescript
// Duolingo-style primary button
const primaryButton = {
  backgroundColor: duolingoColors.primary.DEFAULT,
  borderRadius: 16,
  paddingVertical: 16,
  paddingHorizontal: 24,
  minHeight: 56,
  shadowColor: duolingoColors.primary[600],
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0, // Hard shadow for bold look
  elevation: 4,
}
```

#### Button States
- **Default**: Solid background with hard shadow
- **Pressed**: Slight scale (0.98) with reduced shadow
- **Disabled**: 50% opacity, no shadow
- **Loading**: Animated indicator, maintain size

### Card Components
```typescript
const cardStyles = {
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 20,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
  borderWidth: 2,
  borderColor: duolingoColors.gray[200],
}
```

### Input Fields
```typescript
const inputStyles = {
  borderWidth: 2,
  borderColor: duolingoColors.gray[300],
  borderRadius: 12,
  paddingVertical: 16,
  paddingHorizontal: 16,
  fontSize: 16,
  backgroundColor: '#FFFFFF',
  // Focus state
  focusedBorderColor: duolingoColors.primary.DEFAULT,
  // Error state  
  errorBorderColor: duolingoColors.accent.red,
}
```

---

## 🎮 Gamification Elements

### Progress Indicators

#### Linear Progress Bar
```typescript
const ProgressBar = ({ progress, total, color = duolingoColors.primary.DEFAULT }) => (
  <View style={progressContainer}>
    <View style={[progressTrack, { backgroundColor: duolingoColors.gray[200] }]}>
      <View 
        style={[
          progressFill, 
          { 
            width: `${(progress / total) * 100}%`,
            backgroundColor: color,
          }
        ]} 
      />
    </View>
  </View>
)

const progressContainer = {
  height: 12,
  borderRadius: 6,
  overflow: 'hidden',
  backgroundColor: duolingoColors.gray[200],
}

const progressFill = {
  height: '100%',
  borderRadius: 6,
  // Add shine effect
  backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
}
```

#### Circular Progress (XP/Level)
```typescript
const CircularProgress = ({ progress, size = 80 }) => {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference
  
  return (
    <Svg width={size} height={size}>
      {/* Background circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={duolingoColors.gray[200]}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={duolingoColors.accent.gold}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  )
}
```

### Achievement Badges
```typescript
const achievementBadgeStyles = {
  container: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: duolingoColors.accent.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  icon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  pulse: {
    // Add pulsing animation for new achievements
    transform: [{ scale: 1.1 }],
  }
}
```

### Streak Counter
```typescript
const StreakCounter = ({ count, isActive }) => (
  <View style={streakContainer}>
    <Text style={streakNumber}>{count}</Text>
    <Text style={streakLabel}>day streak</Text>
    {isActive && <View style={fireIcon}>🔥</View>}
  </View>
)

const streakStyles = {
  container: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: isActive ? duolingoColors.accent.orange : duolingoColors.gray[100],
  },
  number: {
    fontSize: 24,
    fontWeight: '700',
    color: isActive ? '#FFFFFF' : duolingoColors.gray[700],
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: isActive ? '#FFFFFF' : duolingoColors.gray[600],
  }
}
```

### Hearts/Lives System
```typescript
const HeartsDisplay = ({ current, total }) => (
  <View style={heartsContainer}>
    {Array.from({ length: total }, (_, i) => (
      <View key={i} style={heartContainer}>
        <Text style={heartIcon}>
          {i < current ? '❤️' : '🤍'}
        </Text>
      </View>
    ))}
  </View>
)
```

---

## 🎭 Icons & Illustrations

### Icon Guidelines
- **Style**: Rounded, friendly icons with consistent stroke width
- **Size**: Use 16px, 24px, 32px, 48px for system icons
- **Color**: Primary green for active states, gray for inactive
- **Format**: Use SVG for scalability

### Character Design
```typescript
const mascotStyles = {
  // Owl character (primary mascot)
  owl: {
    primaryColor: duolingoColors.primary.DEFAULT,
    secondaryColor: '#FFFFFF',
    accentColor: duolingoColors.accent.orange,
    style: 'friendly, rounded, expressive eyes',
  },
  
  // Expression guidelines
  expressions: {
    happy: 'Wide smile, bright eyes, celebratory pose',
    encouraging: 'Gentle smile, supportive gesture',
    thinking: 'Tilted head, finger to chin',
    celebrating: 'Arms raised, confetti around',
  }
}
```

### Illustration Principles
- **Consistent Style**: Flat design with subtle shadows
- **Color Harmony**: Use established color palette
- **Emotional Connection**: Characters should feel relatable
- **Cultural Sensitivity**: Inclusive representation

---

## 🎬 Animation Principles

### Timing & Easing
```typescript
export const animations = {
  // Standard durations
  fast: 200,
  normal: 300,
  slow: 500,
  
  // Easing curves
  easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
}
```

### Common Animations

#### Button Press
```typescript
const buttonPressAnimation = {
  scale: 0.98,
  duration: 100,
  easing: animations.easeOut,
}
```

#### Success Celebration
```typescript
const successAnimation = {
  scale: [1, 1.2, 1],
  opacity: [1, 0.8, 1],
  duration: 600,
  easing: animations.bounce,
}
```

#### Progress Bar Fill
```typescript
const progressFillAnimation = {
  width: '100%',
  duration: 1000,
  easing: animations.easeOut,
  delay: 200,
}
```

### Animation Guidelines
- **Purpose-Driven**: Every animation should have a clear purpose
- **Performance**: Use native driver when possible
- **Accessibility**: Respect reduced motion preferences
- **Feedback**: Provide immediate visual feedback for interactions

---

## 📱 Interaction Patterns

### Touch Targets
- **Minimum Size**: 44px × 44px for all interactive elements
- **Spacing**: At least 8px between adjacent touch targets
- **Feedback**: Immediate visual feedback on press

### Gestures
```typescript
const gesturePatterns = {
  // Swipe patterns
  swipeToProgress: {
    direction: 'right',
    threshold: 50,
    feedback: 'haptic + visual',
  },
  
  // Pull to refresh
  pullToRefresh: {
    threshold: 80,
    animation: 'elastic',
    indicator: 'custom mascot animation',
  },
  
  // Long press
  longPress: {
    duration: 500,
    feedback: 'haptic + scale animation',
  }
}
```

### Loading States
```typescript
const LoadingSpinner = () => (
  <View style={loadingContainer}>
    <Animated.View style={[spinnerStyle, animatedRotation]}>
      <Text style={mascotIcon}>🦉</Text>
    </Animated.View>
    <Text style={loadingText}>Learning...</Text>
  </View>
)
```

### Error States
```typescript
const ErrorState = ({ onRetry }) => (
  <View style={errorContainer}>
    <Text style={errorMascot}>😅</Text>
    <Text style={errorTitle}>Oops! Something went wrong</Text>
    <Text style={errorMessage}>Don't worry, let's try again!</Text>
    <Button onPress={onRetry} variant="primary">
      Try Again
    </Button>
  </View>
)
```

---

## 🛠️ Implementation Examples

### Primary Button Component
```typescript
import { Pressable, Text, View } from 'react-native'
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  "rounded-2xl items-center justify-center shadow-lg active:scale-98",
  {
    variants: {
      variant: {
        primary: "bg-primary shadow-primary-600",
        secondary: "bg-secondary shadow-secondary-600", 
        outline: "border-2 border-primary bg-white",
      },
      size: {
        default: "px-6 py-4 min-h-14",
        large: "px-8 py-5 min-h-16",
        icon: "w-12 h-12",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    }
  }
)

export const DuoButton = ({ children, variant, size, ...props }) => (
  <Pressable className={buttonVariants({ variant, size })} {...props}>
    <Text className="text-white font-semibold text-base">
      {children}
    </Text>
  </Pressable>
)
```

### Progress Card Component
```typescript
export const ProgressCard = ({ title, progress, total, icon }) => (
  <View className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-200">
    <View className="flex-row items-center mb-3">
      <Text className="text-2xl mr-3">{icon}</Text>
      <Text className="text-lg font-semibold text-gray-800 flex-1">
        {title}
      </Text>
    </View>
    
    <View className="mb-2">
      <View className="bg-gray-200 h-3 rounded-full overflow-hidden">
        <View 
          className="bg-primary h-full rounded-full"
          style={{ width: `${(progress / total) * 100}%` }}
        />
      </View>
    </View>
    
    <Text className="text-sm text-gray-600 text-right">
      {progress} / {total}
    </Text>
  </View>
)
```

### Achievement Badge
```typescript
export const AchievementBadge = ({ icon, title, unlocked = false }) => (
  <View className="items-center">
    <View className={`
      w-16 h-16 rounded-full items-center justify-center border-3 border-white
      ${unlocked ? 'bg-yellow-400 shadow-lg' : 'bg-gray-300'}
    `}>
      <Text className="text-2xl">
        {unlocked ? icon : '🔒'}
      </Text>
    </View>
    <Text className={`
      text-xs font-medium mt-2 text-center
      ${unlocked ? 'text-gray-800' : 'text-gray-500'}
    `}>
      {title}
    </Text>
  </View>
)
```

---

## ♿ Accessibility Guidelines

### Color Accessibility
- **Contrast Ratios**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Color Blindness**: Don't rely solely on color to convey information
- **Testing**: Use tools like Stark or Color Oracle

### Interactive Accessibility
- **Screen Readers**: Provide meaningful labels and hints
- **Focus Management**: Logical tab order and visible focus indicators
- **Gesture Alternatives**: Provide button alternatives for gesture-based actions

### Motion Accessibility
```typescript
const respectsReducedMotion = () => {
  // Check system preferences
  const prefersReducedMotion = AccessibilityInfo.isReduceMotionEnabled()
  
  return {
    duration: prefersReducedMotion ? 0 : animations.normal,
    scale: prefersReducedMotion ? 1 : 1.1,
  }
}
```

---

## 📏 Design Tokens

### Complete Token System
```typescript
export const designTokens = {
  colors: duolingoColors,
  typography,
  spacing,
  animations,
  
  // Border radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  
  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  }
}
```

---

## 🚀 Getting Started

### Setup Instructions

1. **Update Tailwind Config**
   ```javascript
   // tailwind.config.js
   module.exports = {
     theme: {
       extend: {
         colors: duolingoColors,
         fontSize: typography,
         spacing: spacing,
         borderRadius: designTokens.radius,
       }
     }
   }
   ```

2. **Create Base Components**
   - Start with Button, Card, and Input components
   - Apply Duolingo styling principles
   - Test across different screen sizes

3. **Implement Gamification**
   - Progress tracking system
   - Achievement badges
   - Streak counters
   - XP/level system

4. **Test Accessibility**
   - Screen reader compatibility
   - Color contrast validation
   - Touch target sizing

### Next Steps
- [ ] Implement core component library
- [ ] Create gamification hooks and providers
- [ ] Design mascot character system
- [ ] Build animation library
- [ ] Establish testing patterns

---

This style guide serves as the foundation for creating a cohesive, engaging, and accessible user experience inspired by Duolingo's proven design patterns. Remember: every interaction should feel rewarding and encourage continued engagement! 