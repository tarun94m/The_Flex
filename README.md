# Flex Living Reviews Dashboard

A comprehensive property management dashboard for managing guest reviews across multiple booking platforms. Built for property managers to streamline review approval workflows, analyze performance metrics, and display approved reviews on public property pages.

## Tech Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** as the build tool and development server for fast HMR
- **Wouter** for lightweight client-side routing
- **TanStack Query (React Query)** for server state management and caching
- **Shadcn/UI** + **Radix UI** for accessible, customizable component library
- **Tailwind CSS** for utility-first styling with custom design tokens
- **Recharts** for data visualization and analytics charts
- **React Hook Form** with Zod validation for form management

### Backend
- **Node.js** with **Express.js** framework using TypeScript
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** with Neon Database for cloud hosting
- **Express Sessions** with PostgreSQL session store for authentication
- **Zod** for runtime type validation and schema definition

### External Integrations
- **Google Places API** for enhanced property location services
- **Hostaway API** integration for fetching guest reviews (with mock data fallback)
- Support for multiple booking channels: Airbnb, Booking.com, Direct bookings

## Key Design and Logic Decisions

### Architecture Patterns
- **Clean Separation of Concerns**: Shared type definitions in `shared/schema.ts` ensure consistency between frontend and backend
- **Frontend-Heavy Design**: Maximum logic handled on the client side, with backend focused on data persistence and API integration
- **Type Safety First**: Comprehensive TypeScript implementation with Drizzle ORM for database type safety

### Data Model Design
- **Review States**: Three-state approval workflow (pending, approved, rejected) with audit trail
- **Multi-Channel Support**: Unified review structure accommodating different booking platform schemas
- **Property Categorization**: Classification system (apartments, studios, houses, townhouses, lofts) for enhanced filtering
- **Flexible Schema**: Category ratings stored as arrays to support varying platform rating systems

### UI/UX Decisions
- **Simplified Navigation**: Removed analytics tab and user profile elements for cleaner manager interface
- **Bulk Operations**: Efficient review management with bulk approve/reject functionality
- **Real-time Filtering**: Advanced filtering by status, property, channel, and rating categories
- **Responsive Design**: Mobile-first approach with Tailwind CSS utilities

### Performance Optimizations
- **Query Caching**: TanStack Query with configurable stale times (30s for reviews, 5 min for properties)
- **Optimistic Updates**: Immediate UI feedback for review approval/rejection actions
- **Lazy Loading**: Component-based code splitting and dynamic imports

## API Behaviors

### Core Endpoints

#### Review Management
```
GET /api/reviews - Fetch reviews with advanced filtering
POST /api/reviews/:id/approve - Approve individual review
POST /api/reviews/:id/reject - Reject individual review
POST /api/reviews/bulk-approve - Bulk approve multiple reviews
POST /api/reviews/bulk-reject - Bulk reject multiple reviews
```

#### Hostaway Integration
```
GET /api/reviews/hostaway - Fetch normalized reviews from Hostaway API
POST /api/sync/hostaway - Trigger manual sync with Hostaway platform
```

#### Property Management
```
GET /api/properties - List all properties with metadata
GET /api/properties/:id - Get detailed property information
```

#### Analytics & Metrics
```
GET /api/dashboard/metrics - Comprehensive dashboard KPIs
GET /api/google-reviews/:propertyId - Google Reviews data for property
```

### Error Handling
- **Structured Error Responses**: Consistent error format with message and details
- **Validation Middleware**: Zod schema validation for all request payloads
- **Graceful Degradation**: Fallback to mock data when external APIs are unavailable

### Caching Strategy
- **Client-Side Caching**: React Query with intelligent cache invalidation
- **API Response Caching**: Express middleware for frequently accessed endpoints
- **Session Management**: PostgreSQL-backed sessions with configurable TTL

## Google Reviews Integration Findings

### API Configuration
- Successfully integrated Google Places API with provided API key
- Implemented property-specific Google Reviews fetching by Place ID
- Rate limiting considerations for production usage (1000 requests/day for basic tier)

### Data Mapping Challenges
- **Review Schema Differences**: Google Reviews format differs significantly from booking platform reviews
- **Rating Scale Variations**: Google uses 1-5 scale while some platforms use 1-10
- **Category Mapping**: Limited category granularity compared to Hostaway's detailed breakdowns

### Implementation Insights
- **Place ID Requirement**: Each property needs a valid Google Place ID for review fetching
- **Review Content**: Google Reviews typically shorter and less structured than booking platform reviews
- **Update Frequency**: Google Reviews API has limitations on real-time data freshness

### Performance Considerations
- **API Quotas**: Monitor daily request limits for production deployments
- **Caching Strategy**: Implement longer cache times (24h) for Google Reviews due to API constraints
- **Error Handling**: Robust fallback mechanisms when Google API is unavailable

### Business Value Assessment
- **Complementary Data**: Google Reviews provide additional customer sentiment beyond booking platforms
- **SEO Benefits**: Displaying Google Reviews can improve local search rankings
- **Validation Tool**: Cross-reference Google Reviews with internal feedback for accuracy

## Development Setup

1. **Environment Configuration**: Set up PostgreSQL database and Google Places API key
2. **Dependency Installation**: `npm install` in root directory
3. **Database Migration**: Drizzle ORM handles schema setup automatically
4. **Development Server**: `npm run dev` starts both frontend and backend with HMR

## Production Considerations

- **Database Scaling**: Consider connection pooling for high-traffic scenarios
- **API Rate Limiting**: Implement rate limiting for external API calls
- **Monitoring**: Add comprehensive logging and error tracking
- **Security**: Implement proper authentication and authorization for production use

The system demonstrates a modern, scalable approach to property management with emphasis on user experience, type safety, and maintainable architecture patterns.