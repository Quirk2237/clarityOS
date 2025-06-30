# React Native Performance Checklist

## Component Optimization
- [ ] **Memoization Review**: Check all components for proper React.memo, useMemo, and useCallback usage
- [ ] **Re-render Analysis**: Identify and fix unnecessary re-renders
- [ ] **Component Splitting**: Break down large components into smaller, focused components
- [ ] **Lazy Loading**: Implement React.Suspense and dynamic imports for non-critical components

## State Management
- [ ] **Context Optimization**: Review Context providers for proper value memoization
- [ ] **State Colocation**: Move state closer to where it's used
- [ ] **Reducer Optimization**: Replace multiple useState with useReducer where appropriate
- [ ] **Global State Audit**: Evaluate if all global state is necessary

## Navigation Performance
- [ ] **Screen Optimization**: Implement lazy loading for navigation screens
- [ ] **Navigation State**: Minimize navigation state complexity
- [ ] **Tab Pre-loading**: Optimize tab navigation with proper pre-loading strategies

## Image and Asset Optimization
- [ ] **Image Formats**: Use WebP format where supported
- [ ] **Image Sizing**: Provide explicit dimensions for all images
- [ ] **Lazy Loading**: Implement lazy loading for images with expo-image
- [ ] **Asset Bundling**: Optimize asset bundling and caching strategies

## Data Fetching and Caching
- [ ] **Query Optimization**: Implement react-query or SWR for efficient data fetching
- [ ] **Cache Strategies**: Review and optimize caching mechanisms
- [ ] **Pagination**: Implement pagination for large data sets
- [ ] **Background Sync**: Optimize background data synchronization

## Bundle Size and Loading
- [ ] **Bundle Analysis**: Analyze bundle size and identify heavy dependencies
- [ ] **Code Splitting**: Implement proper code splitting strategies
- [ ] **Tree Shaking**: Ensure unused code is properly eliminated
- [ ] **Dependency Audit**: Review and remove unnecessary dependencies

## Animation and Gestures
- [ ] **Native Animations**: Use react-native-reanimated for performant animations
- [ ] **Gesture Handling**: Optimize gesture handlers for smooth interactions
- [ ] **Animation Cleanup**: Ensure animations are properly cleaned up
- [ ] **60fps Target**: Verify animations maintain 60fps performance

## Memory Management
- [ ] **Memory Leaks**: Identify and fix potential memory leaks
- [ ] **Event Listeners**: Ensure proper cleanup of event listeners
- [ ] **Timer Cleanup**: Clean up timers and intervals properly
- [ ] **Large Data Sets**: Optimize handling of large data structures

## Supabase Integration
- [ ] **Query Optimization**: Review Supabase queries for efficiency
- [ ] **Connection Pooling**: Optimize database connection usage
- [ ] **Real-time Subscriptions**: Audit real-time subscriptions for performance impact
- [ ] **Auth State Management**: Optimize authentication state handling

## Startup Performance
- [ ] **App Loading**: Optimize app startup time with proper loading screens
- [ ] **Initial Bundle**: Minimize initial bundle size
- [ ] **Splash Screen**: Implement proper splash screen with expo-splash-screen
- [ ] **Critical Path**: Identify and optimize critical loading path

## Development Tools
- [ ] **Performance Monitoring**: Set up performance monitoring (Flipper, React DevTools)
- [ ] **Profiling**: Regular profiling with React DevTools Profiler
- [ ] **Metro Bundler**: Optimize Metro bundler configuration
- [ ] **Build Optimization**: Review build and bundling optimizations

## Platform-Specific Optimizations
- [ ] **iOS Optimization**: Platform-specific iOS performance improvements
- [ ] **Android Optimization**: Platform-specific Android performance improvements
- [ ] **Native Modules**: Evaluate custom native module performance
- [ ] **Bridge Communication**: Minimize React Native bridge usage

## Error Handling and Monitoring
- [ ] **Error Boundaries**: Implement proper error boundaries
- [ ] **Crash Reporting**: Set up crash reporting and monitoring
- [ ] **Performance Metrics**: Track key performance metrics
- [ ] **User Experience**: Monitor real user performance data

---

## Priority Levels
- 🔴 **Critical**: Immediate performance impact
- 🟡 **Medium**: Noticeable improvement potential
- 🟢 **Low**: Nice-to-have optimizations

## Notes
- Performance improvements should be measured before and after implementation
- Use performance profiling tools to validate improvements
- Consider user experience impact alongside technical metrics 