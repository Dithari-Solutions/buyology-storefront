# Buyology E-Commerce Platform - Services Documentation

## Overview

This document lists all the services implemented in the Buyology e-commerce platform, organized by feature modules. Each service handles specific API interactions, data management, and business logic operations.

## Core Infrastructure Services

### API Client (`src/shared/lib/apiClient.ts`)
**Purpose**: Centralized HTTP client for all API communications

**Features**:
- Axios instance configuration with base URL
- Request interceptor for automatic JWT token attachment
- Response interceptor for 401 error handling and token refresh
- Environment-based configuration

**Usage**: Used by all feature services for API calls

### Token Manager (`src/shared/lib/tokenManager.ts`)
**Purpose**: Secure JWT token management and session handling

**Features**:
- In-memory access token storage (XSS protection)
- HttpOnly refresh token cookie management (CSRF protection)
- Automatic token refresh scheduling (30 seconds before expiry)
- Session restoration on application startup
- Token validation and cleanup

**Usage**: Integrated with apiClient for authentication flows

## Feature-Specific Services

### Authentication Services (`src/features/auth/services/`)

#### `auth.api.ts`
**Purpose**: User authentication and account management API calls

**API Endpoints**:
- `POST /auth/signup` - User registration with email validation
- `POST /auth/verify-otp` - OTP verification for account activation
- `POST /auth/signin` - User login with credentials
- `POST /auth/refresh` - Access token refresh using refresh token
- `POST /auth/logout` - Secure logout with token revocation

**Features**:
- Email validation and suspicious input detection
- Password strength validation (8+ chars, uppercase, numbers)
- XSS/SQL injection pattern detection
- Automatic token refresh integration
- Session restoration on app startup

### Cart Services (`src/features/cart/services/`)

#### `cart.api.ts`
**Purpose**: Shopping cart management and persistence

**API Endpoints**:
- `GET /cart` - Fetch user's cart with all items and metadata
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/{itemId}` - Update item quantity
- `DELETE /cart/items/{itemId}` - Remove item from cart
- `POST /cart/save-for-later` - Move item to saved-for-later list
- `POST /cart/move-to-cart` - Move item from saved-for-later to cart
- `POST /cart/clear` - Clear entire cart
- `POST /cart/select-items` - Select items for checkout

**Features**:
- Optimistic UI updates with API synchronization
- Promo code validation (SAVE10, SAVE20, WELCOME15)
- Automatic tax calculation (8% rate)
- Shipping cost calculation ($9.99 flat rate)
- Cart persistence across sessions
- Item selection management for checkout

### Product Services (`src/features/product/services/`)

#### `productService.ts`
**Purpose**: Product catalog and individual product data management

**API Endpoints**:
- `GET /products` - Fetch all products with language-specific slugs
- `GET /products/{id}` - Get product by ID
- `GET /products/slug/{slug}` - Get product by slug
- `GET /products/search` - Search products with filters
- `GET /products/category/{category}` - Get products by category

**Features**:
- Language-aware product fetching
- Product variant management (color, storage)
- Stock status monitoring
- Discount percentage calculations
- Product image gallery management

#### `reviewService.ts`
**Purpose**: Product review and rating management

**API Endpoints**:
- `GET /products/{id}/reviews` - Get product reviews
- `POST /products/{id}/reviews` - Add product review
- `PUT /reviews/{reviewId}` - Update review
- `DELETE /reviews/{reviewId}` - Delete review
- `GET /products/{id}/rating` - Get average product rating

**Features**:
- Review submission and moderation
- Rating calculation and display
- User review history tracking

#### `qaService.ts`
**Purpose**: Product Questions & Answers functionality

**API Endpoints**:
- `GET /products/{id}/questions` - Get product questions
- `POST /products/{id}/questions` - Ask product question
- `POST /questions/{questionId}/answers` - Answer question
- `PUT /questions/{questionId}` - Update question
- `DELETE /questions/{questionId}` - Delete question

**Features**:
- Question submission and answering
- Question voting and helpfulness tracking
- Answer moderation and approval

### Favorites Services (`src/features/favourites/services/`)

#### `favourites.api.ts`
**Purpose**: User favorites/wishlist management

**API Endpoints**:
- `GET /user/favorites` - Get user's favorite products
- `POST /user/favorites` - Add product to favorites
- `DELETE /user/favorites/{productId}` - Remove product from favorites
- `GET /user/favorites/count` - Get favorites count

**Features**:
- Favorite status synchronization
- Persistent favorites across sessions
- Favorite count indicators
- Quick access to favorite products

### Checkout Services (`src/features/checkout/services/`)

#### `checkout.api.ts`
**Purpose**: Payment processing and order management

**API Endpoints**:
- `POST /checkout/initiate` - Initiate checkout process
- `POST /checkout/shipping` - Update shipping information
- `POST /checkout/payment` - Process payment
- `GET /checkout/status/{orderId}` - Get payment status
- `POST /checkout/confirm` - Confirm order completion
- `GET /orders/{orderId}` - Get order details

**Features**:
- Multi-step checkout flow management
- Payment method integration (Card, Tabby, Tamara)
- Payment status tracking (PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED, REFUNDED)
- Third-party payment provider integration
- Transaction history and receipts

### Profile Services (`src/features/profile/services/`)

#### `profile.api.ts`
**Purpose**: User profile and account management

**API Endpoints**:
- `GET /user/profile` - Get user profile information
- `PUT /user/profile` - Update user profile
- `GET /user/addresses` - Get user delivery addresses
- `POST /user/addresses` - Add delivery address
- `PUT /user/addresses/{addressId}` - Update delivery address
- `DELETE /user/addresses/{addressId}` - Delete delivery address
- `GET /user/orders` - Get user order history

**Features**:
- Profile information management
- Multiple address management
- Order history tracking
- Account preferences and settings

### Quick Delivery Services (`src/features/quickDelivery/services/`)

#### `delivery.api.ts`
**Purpose**: Express delivery service management

**API Endpoints**:
- `GET /delivery/availability` - Check delivery availability for location
- `GET /delivery/pricing` - Get delivery pricing information
- `POST /delivery/schedule` - Schedule quick delivery
- `GET /delivery/status/{orderId}` - Get delivery status

**Features**:
- Service area coverage checking
- Delivery time estimation
- Pricing calculation
- Delivery scheduling and tracking

### Story Services (`src/features/story/services/`)

#### `story.api.ts`
**Purpose**: Stories feature data management

**API Endpoints**:
- `GET /stories` - Get active stories
- `GET /stories/{storyId}` - Get specific story details
- `POST /stories` - Create new story (admin)
- `PUT /stories/{storyId}` - Update story
- `DELETE /stories/{storyId}` - Delete story

**Features**:
- Story expiration management
- Media hosting integration
- Story viewer analytics
- Time-based content rotation

### Map Services (`src/features/map/services/`)

#### `map.api.ts`
**Purpose**: Location-based services and geographic data

**API Endpoints**:
- `GET /locations/stores` - Get store locations
- `GET /locations/delivery-areas` - Get delivery service areas
- `POST /locations/geocode` - Geocode address to coordinates
- `GET /locations/reverse-geocode` - Reverse geocode coordinates to address

**Features**:
- Store locator functionality
- Delivery area visualization
- Address validation and geocoding
- Geographic service area management

## Service Architecture Patterns

### Error Handling
All services implement consistent error handling:
- Network error detection and retry logic
- Authentication error handling (401 responses)
- Validation error processing
- User-friendly error messages

### Authentication Integration
Services automatically handle authentication:
- JWT token attachment via apiClient interceptor
- Automatic token refresh on 401 responses
- Session restoration on service initialization

### Data Transformation
Services handle data transformation:
- API response normalization
- Client-side data validation
- Optimistic updates for better UX
- Caching strategies for performance

### State Synchronization
Services integrate with Redux state:
- Async thunk actions for API calls
- State updates on successful operations
- Error state management
- Loading state indicators

## API Response Patterns

### Success Response
```typescript
{
  success: true,
  data: T,
  message?: string
}
```

### Error Response
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

### Paginated Response
```typescript
{
  success: true,
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

## Service Dependencies

### External Dependencies
- **Axios**: HTTP client for API calls
- **Redux Toolkit**: State management integration
- **i18next**: Internationalization support
- **JWT**: Token management

### Internal Dependencies
- **apiClient**: Base HTTP client configuration
- **tokenManager**: Authentication token handling
- **TypeScript types**: Request/response type definitions
- **Validation schemas**: Input validation rules

## Testing Strategy

### Unit Tests
- Service function testing with mocked API responses
- Error handling validation
- Data transformation verification

### Integration Tests
- End-to-end API flow testing
- Authentication integration testing
- State synchronization validation

### Mock Services
Development and testing environments use mock services for:
- API response simulation
- Error scenario testing
- Offline development support</content>
<filePath>/Users/firdovsirz/Documents/buyology-e-commerce/buyology-web/SERVICES.md