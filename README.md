# Buyology E-Commerce Platform

## Overview

Buyology is a modern, multi-language e-commerce platform built with Next.js that provides a unified marketplace for buying, renting, repairing, and selling products. The platform supports three languages (English, Azerbaijani, Arabic) with full internationalization and RTL/LTR support.

## Architecture

The project follows a **feature-based modular architecture** with:
- **Next.js 16.1.6** with App Router
- **Redux Toolkit** for state management
- **Tailwind CSS v4** for styling
- **i18next** for internationalization
- **JWT authentication** with automatic token refresh
- **Docker-optimized** standalone builds

## Project Structure & Modules

### Core Application (`src/app/`)

#### Root Layout (`layout.tsx`)
- Sets HTML language and direction attributes
- Wraps the app with Redux and i18next providers
- Includes global CSS and AI bot button

#### Language-Specific Layout (`[lang]/layout.tsx`)
- Handles dynamic language routing (`/en/`, `/az/`, `/ar/`)
- Validates language parameters
- Applies background decorations
- Syncs language state with Redux

#### Pages Structure
- **`/`** - Homepage with marketing content and product showcases
- **`/auth`** - Authentication pages (signup, signin, OTP verification)
- **`/shop`** - Product catalog with filtering and search
- **`/shop/[slug]`** - Individual product detail pages
- **`/cart`** - Shopping cart management
- **`/checkout`** - Multi-step checkout process
- **`/favourites`** - User wishlist/favorites
- **`/profile`** - User account and settings
- **`/quick-delivery`** - Express delivery information
- **`/rent`** - Coming soon: Rental services
- **`/repair`** - Coming soon: Repair services

### Feature Modules (`src/features/`)

#### Authentication (`auth/`)
**Purpose**: Complete user authentication and account management system

**Jobs Performed**:
- User registration with email validation
- OTP (One-Time Password) verification for account activation
- Secure login with email/password credentials
- JWT token management (access tokens in memory, refresh tokens in HttpOnly cookies)
- Automatic token refresh 30 seconds before expiry
- Session restoration on app startup
- Password strength validation (minimum 8 characters, uppercase, numbers)
- XSS/SQL injection pattern detection
- Secure logout with server-side token revocation

**Components**: AuthForm, AuthToggler, SocialButtons, StatusPopup, LoginPromptModal, OTP verification flows
**Services**: API calls for signup, signin, OTP verification, token refresh, logout
**State**: Redux slice managing authentication status and user ID

#### Shopping Cart (`cart/`)
**Purpose**: Comprehensive shopping cart functionality with persistence

**Jobs Performed**:
- Add/remove products to/from cart with optimistic UI updates
- Update item quantities
- Save items for later (wishlist-like functionality)
- Move items between cart and saved-for-later lists
- Promo code validation (SAVE10, SAVE20, WELCOME15)
- Automatic tax calculation (8% rate)
- Shipping cost calculation ($9.99 flat rate)
- Discount application and total price computation
- Cart persistence across sessions
- Item selection for checkout
- Clear entire cart functionality

**Components**: CartPage, CartItems, CartItem, OrderSummary
**Services**: API integration for cart operations
**State**: Redux slice with async thunks for API calls and local state management

#### Product Management (`product/`)
**Purpose**: Product catalog, browsing, and detailed information display

**Jobs Performed**:
- Fetch and display all products with language-specific slugs
- Retrieve individual products by ID or slug
- Display comprehensive product details (specifications, colors, storage options)
- Product filtering by category, specifications, and other criteria
- Review and rating system management
- Product Q&A (Questions & Answers) functionality
- Variant selection (color, storage capacity)
- Stock status monitoring (in-stock/out-of-stock)
- Discount percentage calculations
- Key features and technical specifications display
- Product image galleries and media management

**Components**: ProductCard, ProductDetailClient, ProductDetailImage, ProductVariants, ProductReviews, ProductQA, ProductSpecs, ProductFilter, ProductFeaturesBadges, ProductActions
**Services**: Product API calls, review services, Q&A services
**State**: Redux slice for product data management

#### Favorites/Wishlist (`favourites/`)
**Purpose**: User favorites and wishlist management

**Jobs Performed**:
- Add/remove products from user favorites
- Fetch and display user's favorite items with full metadata
- Favorite count display and status indicators
- Quick view functionality for favorite products
- Persistent favorites across user sessions
- Integration with product catalog for easy access

**Components**: FavouritesGuest, FavouritesEmptyItems, FavouritesGrid, FavouriteCard
**Services**: API calls for favorites management
**State**: Redux slice with async thunks for add/remove/fetch operations

#### Checkout Process (`checkout/`)
**Purpose**: Multi-step checkout and payment processing system

**Jobs Performed**:
- Two-step checkout flow (Shipping → Payment)
- Shipping information collection (email, phone, address, postal code)
- Payment method selection (Credit Card, Tabby, Tamara)
- Payment status tracking (PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED, REFUNDED)
- Third-party payment provider integration
- Order summary generation and display
- Transaction history and status updates
- Secure payment data handling

**Components**: CheckoutPage, ShippingStep, PaymentStep, CheckoutSummary, PaymentIframe
**Services**: Payment API integration and transaction processing
**State**: Local component state for checkout flow management

#### Homepage (`home/`)
**Purpose**: Marketing homepage with feature showcases and promotions

**Jobs Performed**:
- Hero banner displays with call-to-action buttons
- Stories carousel for user-generated or promotional content
- Popular product categories showcase
- Super deals section with discounted products
- Limited stock countdown displays
- Trust and security statistics presentation
- Feature highlights and benefits
- Announcement marquee strips
- Newsletter signup functionality
- Quick delivery service promotion

**Components**: Banner, Stories, Features, SuperDeals, LimitedStock, MarqueeStrip, PopularCategories, TrustStats, Newsletter, QuickDeliveryBanner

#### Stories (`story/`)
**Purpose**: Social proof and user-generated content via Stories feature

**Jobs Performed**:
- Display Instagram/Snapchat-style stories
- Story viewer with swipe navigation
- Time-based story expiration management
- Media hosting integration for story images
- User engagement tracking

**Components**: Stories, StoryViewer
**Services**: Story data fetching and management

#### User Profile (`profile/`)
**Purpose**: User account management and personal settings

**Jobs Performed**:
- View and edit user profile information
- Manage multiple delivery addresses
- Display order history and transaction records
- Update personal preferences and settings
- Sidebar navigation for profile sections
- Account security settings

**Components**: ProfilePage, ProfileInfo, DeliveryAddress, ProfileSidebar
**Services**: Profile API calls for data management

#### Quick Delivery (`quickDelivery/`)
**Purpose**: Express and same-day delivery service information

**Jobs Performed**:
- Display quick delivery service features and benefits
- Show service area coverage maps
- Delivery time guarantee information
- Pricing and availability details

**Components**: Quick delivery UI components
**Services**: Delivery availability and pricing API calls

#### Map Services (`map/`)
**Purpose**: Location-based services and interactive mapping

**Jobs Performed**:
- Interactive map display using Leaflet/MapLibre GL
- Store and service location search
- Delivery area visualization
- Address picker for checkout and profile
- Geographic service area management

**Components**: Map UI with location selection and display

#### Coming Soon (`coming-soon/`)
**Purpose**: Placeholder pages for upcoming features

**Jobs Performed**:
- Teaser pages for rental services
- Information displays for repair services
- Feature announcement and waitlist signup

**Components**: Coming soon page templates and placeholders

### Shared Modules (`src/shared/`)

#### Components (`components/`)
**Global UI Components**:
- **Header**: Navigation bar with language switcher, cart indicator, authentication status
- **Footer**: Site footer with links, company information, newsletter signup
- **Providers**: Redux and i18next provider wrappers
- **LangSync**: Client-side language state synchronization with Redux
- **LanguageSwitcher**: UI for language selection
- **HtmlLangDir**: Dynamic HTML lang and dir attribute management
- **ScrollReveal**: Framer Motion wrapper for scroll-triggered animations
- **AiBotButton**: AI assistant/chatbot interface button

#### Internationalization (`i18n/`)
**Multi-language Support**:
- i18next configuration with static JSON imports for SSR compatibility
- Support for 13 translation files per language (auth, banner, cart, checkout, footer, header, home, favourites, notFound, product, profile, coming-soon, quick-delivery)
- Three complete language implementations: English, Azerbaijani, Arabic
- Browser language detection with English fallback
- RTL/LTR text direction support

#### Library/Utilities (`lib/`)
**Core Infrastructure**:
- **apiClient**: Axios instance with:
  - Request interceptor for automatic JWT token attachment
  - Response interceptor for 401 error handling and token refresh
  - Base URL configuration from environment variables
- **tokenManager**: Secure JWT token management:
  - In-memory access token storage (XSS protection)
  - HttpOnly refresh token cookies (CSRF protection)
  - Automatic token refresh scheduling
  - Session restoration on application startup

#### Types (`types/`)
**TypeScript Definitions**:
- Shared interface definitions across all features
- Language type definitions (`Lang = "en" | "az" | "ar"`)
- Common data structure types

#### Styles (`styles/`)
**Global Styling System**:
- Tailwind CSS configuration and global variables
- Theme definitions and design tokens
- Custom CSS classes and utilities

#### UI Components (`ui/`)
**Atomic Design System** (Currently reserved for future atomic components)

#### Custom Hooks (`hooks/`)
**React Hooks** (Currently reserved for shared custom hooks)

#### Utilities (`utils/`)
**Helper Functions** (Currently reserved for utility functions)

### State Management (`src/store/`)

**Redux Toolkit Configuration**:
- **languageSlice**: Manages current UI language state, synchronized with i18next
- **cartSlice**: Handles shopping cart state with items, selections, promo codes, and totals
- **favouritesSlice**: Manages user's favorite products list
- **authSlice**: Tracks authentication status and user identity

**Key Features**:
- Async thunks for API integration
- Optimistic UI updates for better user experience
- Comprehensive selectors for derived state
- Loading and error state management
- Automatic token refresh integration

### Configuration (`src/config/`)

#### Path Slugs (`pathSlugs.ts`)
**Multi-language URL Management**:
- Maps canonical route names to localized slugs for each language
- Example: `shop` → `{ en: "shop", az: "magaza", ar: "matjar" }`
- Reverse mapping for middleware URL rewriting
- Routes covered: shop, auth, cart, favourites, profile, rent, repair, quick-delivery

#### Routes (`routes.ts`)
**API Route Configuration** (Currently placeholder for future API routing)

### Providers (`src/providers/`)

#### ReduxProvider (`ReduxProvider.ts`)
**State Management Setup**:
- Configures and provides Redux store to the application
- Includes all configured slices and middleware

### Assets (`src/assets/`)

**Organized Asset Structure**:
- **avatars/**: User profile pictures
- **banner/**: Homepage hero images
- **banners/**: Section banner images
- **curves/**: Decorative SVG curves
- **devices/**: Product device mockups
- **features/**: Feature highlight icons
- **icons/**: UI icons (processed via SVGR)
- **logo/**: Brand logo assets
- **not-found/**: 404 page illustrations
- **products/**: Product-specific images (organized by product)
- **story/**: Story carousel media
- **vectors/**: Decorative vector graphics

### Public Assets (`public/`)

#### Locales (`locales/`)
**Translation Files**:
- Complete translation sets for English (`en/`), Azerbaijani (`az/`), Arabic (`ar/`)
- 13 JSON files per language covering all application sections
- Static imports for optimal SSR performance

### Middleware (`src/middleware.ts`)

**URL Routing & Security**:
- Enforces language prefix on all routes (redirects to `/en` if missing)
- Rewrites localized slugs to canonical route names
- Injects `x-lang` header for server-side language awareness
- Excludes Next.js internal routes from processing

## Key Technical Flows

### Authentication Flow
1. User registration → Email validation → OTP generation
2. OTP verification → Account creation → JWT token issuance
3. Access token stored in memory, refresh token in HttpOnly cookie
4. Automatic session restoration on app startup
5. Token refresh 30 seconds before expiry
6. Secure logout with token revocation

### Shopping Cart Flow
1. Optimistic UI updates on item addition
2. API synchronization with backend
3. Promo code validation and discount application
4. Tax and shipping calculation
5. Item selection for checkout process

### Multi-Language Flow
1. URL-based language detection via middleware
2. Localized slug rewriting to canonical routes
3. Redux state synchronization with i18next
4. Dynamic RTL/LTR direction switching
5. Language-specific content loading

### Product Browsing Flow
1. Language-aware product fetching
2. Client-side filtering and sorting
3. Product detail loading with variants
4. Review and Q&A integration
5. Cart integration for purchasing

## Security Features

- **JWT Security**: Access tokens in memory (XSS protection), refresh tokens in HttpOnly cookies (CSRF protection)
- **Input Validation**: XSS and SQL injection pattern detection
- **Token Management**: Automatic refresh with secure storage
- **Session Security**: Server-side token validation and revocation

## Performance Optimizations

- **Static i18n**: No async loading for SSR compatibility
- **React Compiler**: Automatic component memoization
- **Standalone Builds**: Docker-optimized production builds
- **Optimistic Updates**: Immediate UI feedback for better UX
- **Scroll Animations**: Performance-optimized reveal animations

## Development Setup

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Docker Deployment
```bash
docker build -t buyology .
docker run -p 3000:3000 buyology
```

## Technologies Used

- **Frontend**: Next.js 16.1.6, React 19.2.3
- **Styling**: Tailwind CSS v4, PostCSS
- **State Management**: Redux Toolkit
- **Internationalization**: i18next
- **HTTP Client**: Axios
- **Maps**: Leaflet, MapLibre GL
- **Animations**: Framer Motion
- **Icons**: SVGR for React optimization
- **Deployment**: Docker, standalone builds

## Project Status

This is a production-ready e-commerce platform with comprehensive features for buying, renting, and repairing products. The platform supports multiple languages and provides a seamless user experience across different devices and regions.
