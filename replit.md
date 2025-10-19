# HandyConnect - Handyman Marketplace Platform

## Overview

HandyConnect is a two-sided marketplace platform connecting customers with local handyman service providers. The application enables customers to browse and book services (plumbing, electrical, painting, carpentry, HVAC, cleaning) while allowing service providers to manage their profiles, list services, and handle bookings. The platform emphasizes trust through transparent pricing, reviews, and provider credentials, with integrated payment processing via Stripe.

**Database Status**: Fully operational with PostgreSQL using Drizzle ORM. All tables created and ready for production use.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- Single Page Application (SPA) architecture

**UI Component System**
- Shadcn/ui component library (New York style variant) built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Design system inspired by successful marketplace platforms (Airbnb, TaskRabbit, Thumbtack)
- Mobile-first responsive design approach
- Support for light/dark themes with system preference detection

**State Management**
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod validation for form state
- Query invalidation strategy for real-time data synchronization

**Design Philosophy**
- Trust-building through transparency (clear pricing, provider credentials)
- Dual-interface optimization (separate customer and provider workflows)
- Efficiency in service discovery and booking flows

### Backend Architecture

**Server Framework**
- Express.js REST API with TypeScript
- Session-based authentication using express-session
- Middleware pipeline for logging, error handling, and request parsing

**Authentication System**
- Replit OpenID Connect (OIDC) integration via Passport.js
- Session storage in PostgreSQL for scalability
- Cookie-based sessions with CSRF protection (sameSite: 'lax')
- User profile sync with OIDC claims

**API Design Patterns**
- RESTful endpoints organized by resource type
- Consistent error handling with appropriate HTTP status codes
- Request/response logging for API routes
- Authentication middleware applied per-route

**Data Access Layer**
- Storage abstraction interface (IStorage) for database operations
- Repository pattern implementation in DatabaseStorage class
- Drizzle ORM for type-safe database queries
- Support for complex joins and relations (services with provider profiles and users)
- All numeric fields properly converted to strings for PostgreSQL decimal columns
- Nested object transformation for clean API responses

### Database Architecture

**Schema Design**
- **users**: Core user table with userType discrimination ('customer' | 'provider')
- **sessions**: Session persistence for authentication (required by connect-pg-simple)
- **providerProfiles**: Extended profile data for service providers (1:1 with users)
- **services**: Service listings linked to provider profiles
- **bookings**: Booking records with status tracking and relationships to customers, providers, and services
- **payments**: Payment records linked to bookings with Stripe integration

**Relationships**
- One-to-One: User → ProviderProfile (when userType is 'provider')
- One-to-Many: ProviderProfile → Services
- One-to-Many: User → Bookings (as customer)
- One-to-Many: ProviderProfile → Bookings (as provider)
- One-to-One: Booking → Payment

**Data Integrity**
- Foreign key constraints with CASCADE deletes for data consistency
- Unique constraints on user emails
- Default values and timestamps for audit trails
- Zod schema validation matching database schema

### Payment Processing

**Stripe Integration**
- Stripe Elements for secure payment form rendering
- Payment Intent flow for booking payments
- Server-side payment processing with @stripe/stripe-js client
- Conditional initialization based on environment variable availability
- Return URL handling for post-payment flow

## External Dependencies

### Database
- **Neon Serverless PostgreSQL**: Managed PostgreSQL database with WebSocket support
- **Drizzle ORM**: Type-safe SQL query builder and schema management
- **drizzle-kit**: Migration generation and database push tooling

### Authentication
- **Replit Auth (OIDC)**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware with openid-client strategy
- **connect-pg-simple**: PostgreSQL session store for express-session

### Payment Processing
- **Stripe API**: Payment processing platform (v2024-11-20.acacia)
- **@stripe/stripe-js**: Client-side Stripe SDK
- **@stripe/react-stripe-js**: React components for Stripe Elements

### UI Components & Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library on top of Radix UI
- **Lucide React**: Icon library
- **class-variance-authority**: Variant-based styling utility

### Form Handling & Validation
- **React Hook Form**: Performant form state management
- **Zod**: TypeScript-first schema validation
- **@hookform/resolvers**: Zod resolver for React Hook Form

### Development Tools
- **TypeScript**: Static type checking
- **ESBuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution for development server
- **Vite Plugins**: Runtime error overlay, cartographer, dev banner (Replit-specific)

### Fonts & Assets
- **Google Fonts (Inter)**: Primary UI font loaded via CDN
- Generated images stored in attached_assets directory for hero and category sections