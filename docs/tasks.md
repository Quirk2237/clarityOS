# ClarityOS Development Tasks

## Project Overview
ClarityOS is a brand strategy app that helps business owners gain clarity through accessible, scalable, and simple tools. The app uses a gamified learning approach similar to Duolingo, combined with AI-powered guided discovery.

## Tech Stack Implementation Tasks

### 1. Foundation & Setup
- [ ] Configure AI SDK integration for ChatGPT
- [ ] Set up RevenueCat for subscription management
- [ ] Configure Resend for email services
- [ ] Set up environment variables and configuration
- [ ] Create TypeScript interfaces for all data models

### 2. Authentication System
- [ ] Implement Supabase authentication setup
- [ ] Create welcome screen with app introduction
- [ ] Build login screen with form validation
- [ ] Build signup screen with form validation
- [ ] Add social login options (if required)
- [ ] Implement password reset functionality
- [ ] Add email verification flow

### 3. Onboarding Flow
- [ ] Create onboarding screen layout with progress indicator
- [ ] Implement Question 1: "What's your goal?" with 5 options:
  - Get clarity
  - Build confidence in what I'm selling
  - Be able to explain what I do
  - Boost my career
  - Other
- [ ] Implement Question 2: "What stage is your business in?" with 5 options:
  - Still conceptualizing
  - Just launched
  - 1-5 years in
  - Industry pro
  - Local household name
- [ ] Add progress bar with back/continue navigation
- [ ] Store onboarding responses in Supabase
- [ ] Create navigation logic to home screen after completion

### 4. Navigation & Layout System
- [ ] Create bottom navigation bar with 3 tabs:
  - Home
  - Dashboard
  - Settings
- [ ] Implement tab navigation using Expo Router
- [ ] Create navigation guards for authenticated routes
- [ ] Add consistent header/navigation components

### 5. Home Screen
- [ ] Design and implement home screen layout
- [ ] Create 7 brand category cards:
  - Purpose
  - Positioning
  - Personality
  - Product-Market Fit
  - Perception
  - Presentation
  - Proof
- [ ] Add card progress indicators
- [ ] Implement start button navigation to respective card screens
- [ ] Add card completion status visual indicators
- [ ] Create responsive grid layout for cards

### 6. Gamified Learning System Architecture
- [ ] Design quiz component architecture
- [ ] Create scoring system database schema
- [ ] Implement progress tracking system
- [ ] Create achievement/badge system
- [ ] Add auto-save functionality for user progress
- [ ] Design progress bar component
- [ ] Create exit navigation (X button) functionality

### 7. Purpose Card Implementation
- [ ] Create card screen layout template
- [ ] Build quiz interface with multiple choice options
- [ ] Implement the 5 Purpose card questions:
  - Q1: What is a brand's purpose?
  - Q2: Strong example of brand purpose
  - Q3: Most important factor for uncovering purpose
  - Q4: Clear purpose statement components
  - Q5: Why brand purpose is important
- [ ] Add correct answer tracking and scoring
- [ ] Create congratulations screen with score display
- [ ] Add "Continue" screen transition
- [ ] Implement completion tracking in database

### 8. AI-Powered Purpose Discovery System
- [ ] Integrate ChatGPT API for guided discovery
- [ ] Implement the opening question logic:
  - "Imagine your brand disappeared tomorrow. What would your customers miss most — and why would that matter?"
- [ ] Create response scoring system (4 dimensions, 0-2 points each):
  - Audience (who it serves)
  - Benefit (how it helps)
  - Belief (what it stands for)
  - Impact (why it matters)
- [ ] Implement follow-up question logic based on scoring
- [ ] Create dynamic questioning flow
- [ ] Build purpose statement synthesis feature
- [ ] Add validation and refinement conversation flow
- [ ] Store AI conversation history and generated statements

### 9. Remaining Brand Category Cards (6 cards)
- [ ] Create Positioning card content and logic
- [ ] Create Personality card content and logic
- [ ] Create Product-Market Fit card content and logic
- [ ] Create Perception card content and logic
- [ ] Create Presentation card content and logic
- [ ] Create Proof card content and logic
- [ ] Implement unique AI discovery logic for each card
- [ ] Add card-specific completion screens

### 10. Settings Screen
- [ ] Create settings screen layout
- [ ] Implement profile management:
  - Name editing
  - Email management
  - Profile updates
- [ ] Add account settings section
- [ ] Implement password change functionality
- [ ] Add email change functionality
- [ ] Create logout functionality
- [ ] Add feedback submission form
- [ ] Implement data export/backup options

### 11. Dashboard Screen
- [ ] Design dashboard layout
- [ ] Create user progress statistics:
  - Cards completed
  - Overall progress percentage
  - Time spent learning
  - Achievement badges earned
- [ ] Add progress visualization charts
- [ ] Implement streaks and engagement metrics
- [ ] Create brand statement library/history
- [ ] Add sharing functionality for completed brand statements

### 12. Database Schema & Backend
- [ ] Design Supabase database schema:
  - Users/Profiles table
  - Cards table
  - User progress table
  - Quiz responses table
  - AI conversations table
  - Achievements table
- [ ] Implement Row Level Security (RLS) policies
- [ ] Create database functions for progress calculation
- [ ] Add data migration scripts
- [ ] Implement real-time subscriptions for progress updates

### 13. UI/UX Polish & Accessibility
- [ ] Implement consistent design system
- [ ] Add loading states and animations
- [ ] Create responsive design for different screen sizes
- [ ] Add accessibility features (screen reader support, etc.)
- [ ] Implement haptic feedback for interactions
- [ ] Add dark mode support
- [ ] Create onboarding tooltips and help system

### 14. Performance & Optimization
- [ ] Implement lazy loading for card content
- [ ] Add offline capability for completed content
- [ ] Optimize AI API calls and caching
- [ ] Add image optimization and lazy loading
- [ ] Implement proper error boundaries
- [ ] Add performance monitoring

### 15. Testing & Quality Assurance
- [ ] Write unit tests for core functionality
- [ ] Create integration tests for user flows
- [ ] Test AI conversation flows thoroughly
- [ ] Implement end-to-end testing
- [ ] Add error tracking and logging
- [ ] Performance testing and optimization

### 16. Deployment & Distribution
- [ ] Configure EAS Build for app store deployment
- [ ] Set up staging and production environments
- [ ] Configure over-the-air updates
- [ ] Add app store optimization (ASO) content
- [ ] Create privacy policy and terms of service
- [ ] Set up analytics and user tracking

### 17. Subscription & Monetization (RevenueCat)
- [ ] Implement subscription tiers
- [ ] Add paywall integration
- [ ] Create subscription management interface
- [ ] Implement trial period functionality
- [ ] Add subscription status checking
- [ ] Create billing and receipt management

### 18. Content Management
- [ ] Create content management system for quiz questions
- [ ] Add ability to update AI prompts without app updates
- [ ] Implement content versioning
- [ ] Add localization support framework
- [ ] Create content moderation system

## Priority Levels

### Phase 1 (MVP - Core Functionality)
- Foundation & Setup
- Authentication System
- Basic Home Screen with Purpose Card
- Gamified Learning System
- AI-Powered Purpose Discovery
- Basic Settings Screen

### Phase 2 (Full Feature Set)
- Remaining 6 Brand Category Cards
- Complete Dashboard Screen
- Onboarding Flow
- Complete Settings Features

### Phase 3 (Polish & Scale)
- UI/UX Polish & Accessibility
- Performance Optimization
- Advanced Analytics
- Subscription System
- Content Management

## Estimated Timeline
- Phase 1: 8-10 weeks
- Phase 2: 6-8 weeks  
- Phase 3: 4-6 weeks
- Total: 18-24 weeks for full implementation

## Key Dependencies
1. ChatGPT API access and rate limits
2. Supabase database setup and configuration
3. RevenueCat subscription configuration
4. Content creation for all 7 brand categories
5. AI prompt engineering and testing 