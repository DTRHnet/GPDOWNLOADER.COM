# GPDownloader Architecture Documentation

## Overview

GPDownloader is a modern web application for downloading and sharing Guitar Pro tab files. It's built with Next.js 15, tRPC, Prisma, PostgreSQL, Redis, and AWS S3.

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **tRPC** - End-to-end type-safe APIs
- **React Query** - Data fetching and caching
- **NextAuth.js** - Authentication

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **tRPC** - Type-safe API layer
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Relational database
- **Redis (Upstash)** - Caching and rate limiting
- **AWS S3** - File storage
- **CloudFront** - CDN for static assets

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Jest** - Unit testing
- **Cypress** - E2E testing
- **TypeScript** - Type checking

## Architecture Patterns

### API Layer (tRPC)

All API endpoints are defined as tRPC routers in `server/routers/`. This provides:
- End-to-end type safety
- Automatic API documentation
- Input validation with Zod
- Error handling

**Router Structure:**
```
server/routers/
├── _app.ts          # Main router combining all sub-routers
├── search.ts        # Search functionality
├── tabs.ts          # Tab management
├── favorites.ts     # User favorites
├── ratings.ts       # Tab ratings
├── comments.ts      # Comments system
├── uploads.ts       # File uploads
├── admin.ts         # Admin panel
└── ads.ts           # Advertisement management
```

### Database Layer (Prisma)

Database schema is defined in `prisma/schema.prisma`. Key models:

**Authentication:**
- `User` - User accounts with roles
- `Account` - OAuth accounts
- `Session` - User sessions

**Content:**
- `Artist` - Music artists
- `Tab` - Guitar Pro tab files
- `Upload` - Pending uploads

**User Interactions:**
- `Favorite` - User favorites
- `Rating` - Tab ratings
- `Comment` - Tab comments

**Administration:**
- `Ad` - Advertisement configurations

### Authentication Flow

1. User signs in via NextAuth.js (Google OAuth or email/password)
2. NextAuth creates a JWT session token
3. Session is stored in HTTP-only cookie
4. tRPC middleware extracts session from cookie
5. Protected procedures check session and user role

### File Upload Flow

1. User initiates upload via `uploads.initiate` endpoint
2. Server generates presigned S3 URL (1-hour expiry)
3. Client uploads file directly to S3
4. Upload record created with `PENDING` status
5. Admin approves/rejects upload
6. If approved, `Tab` record is created from upload

### File Download Flow

1. User requests download via `tabs.getDownloadUrl`
2. Server checks rate limits (10/min for anonymous, unlimited for authenticated)
3. Server increments download count
4. Server generates presigned S3 URL (10-minute expiry)
5. Client redirects to presigned URL

### Search Flow

1. User submits search query
2. Server checks Redis cache (5-minute TTL)
3. If cache miss, query PostgreSQL with filters
4. Results cached in Redis
5. Results returned to client

### Rate Limiting

Rate limiting is implemented via Upstash Redis:
- **Search**: 60 requests/minute
- **Downloads**: 10 requests/minute (anonymous), unlimited (authenticated)
- **Uploads**: 5 requests/hour
- **Auth**: 5 requests/15 minutes

Rate limits are enforced per user ID (authenticated) or IP address (anonymous).

## Security Features

### Input Validation
- All tRPC inputs validated with Zod schemas
- SQL injection protection via Prisma parameterized queries
- XSS protection via React's built-in escaping

### Authentication & Authorization
- JWT-based sessions (HTTP-only cookies)
- Role-based access control (USER, MODERATOR, ADMIN)
- Password hashing with bcrypt (10 rounds)

### File Security
- File type validation
- File size limits (50MB max)
- Presigned URLs with expiration
- Direct S3 uploads (no server proxying)

### Rate Limiting
- Redis-based distributed rate limiting
- Prevents abuse and DDoS attacks
- Different limits for authenticated vs anonymous users

## Performance Optimizations

### Caching
- Redis caching for search results (5-minute TTL)
- Next.js automatic static optimization
- Image optimization via Next.js Image component

### Database
- Indexed queries on frequently searched fields
- Connection pooling via Prisma
- Efficient pagination

### Frontend
- Code splitting via Next.js
- Lazy loading of components
- Optimistic updates for user interactions

## Deployment Architecture

### Recommended Setup

**Frontend & API:**
- Vercel (recommended) or any Node.js hosting
- Environment variables configured
- Automatic deployments from Git

**Database:**
- PostgreSQL (managed service like Supabase, Neon, or AWS RDS)
- Connection pooling enabled
- Regular backups configured

**Cache & Rate Limiting:**
- Upstash Redis (serverless Redis)
- Automatic scaling

**File Storage:**
- AWS S3 bucket
- CloudFront CDN (optional but recommended)
- CORS configured for direct uploads

### Environment Variables

See `DOCS/SETUP.md` for complete list of required environment variables.

## Development Workflow

1. **Local Development:**
   - `npm run dev` - Start dev server
   - `npm run db:studio` - Open Prisma Studio
   - `npm run type-check` - Check types

2. **Testing:**
   - `npm run test` - Run unit tests
   - `npm run test:e2e` - Run E2E tests

3. **Code Quality:**
   - `npm run lint` - Run ESLint
   - `npm run format` - Format with Prettier
   - Husky pre-commit hooks run lint-staged

4. **Database:**
   - `npm run db:migrate` - Create migration
   - `npm run db:push` - Push schema changes
   - `npm run db:seed` - Seed database

## Future Enhancements

- 2FA authentication (TOTP)
- Advanced search with full-text search
- Real-time notifications
- PWA support
- Social features (following, sharing)
- Premium subscriptions
- API for third-party integrations
