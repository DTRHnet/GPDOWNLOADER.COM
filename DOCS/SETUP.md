# GPDownloader Setup Guide

## Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL database
- AWS S3 bucket (for file storage)
- Upstash Redis account (for caching and rate limiting)
- Google OAuth credentials (optional, for Google sign-in)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gpdownloader
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and fill in all required values:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Your application URL (e.g., `http://localhost:3000`)
- `NEXTAUTH_SECRET`: Generate a random secret (e.g., `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
- AWS credentials and S3 bucket name
- Upstash Redis URL and token

4. Set up the database:
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed the database
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run test` - Run Jest tests
- `npm run test:e2e` - Run Cypress E2E tests
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
/
├── app/              # Next.js App Router pages and API routes
├── components/       # React components
├── lib/              # Utility functions and configurations
├── server/           # tRPC routers and server utilities
├── prisma/           # Prisma schema and migrations
├── DOCS/             # Documentation
└── workflow/         # Project workflow specifications
```

## Environment Variables

See `.env.example` for all required environment variables.

## Database Schema

The database schema is defined in `prisma/schema.prisma`. Key models:
- User, Account, Session (authentication)
- Artist, Tab (core content)
- Upload, Favorite, Rating, Comment (user interactions)
- Ad (advertisement management)

## API Documentation

The API is built with tRPC and provides end-to-end type safety. All API routes are defined in `server/routers/`.

Main routers:
- `search` - Tab search functionality
- `tabs` - Tab management and downloads
- `favorites` - User favorites
- `ratings` - Tab ratings
- `comments` - Tab comments
- `uploads` - File upload management
- `admin` - Admin panel functionality
- `ads` - Advertisement management

## Authentication

The application uses NextAuth.js with:
- Google OAuth provider
- Email/password credentials
- JWT-based sessions
- Role-based access control (USER, MODERATOR, ADMIN)

## File Storage

Files are stored in AWS S3 with:
- Presigned URLs for secure downloads (10-minute expiry)
- Presigned URLs for uploads (1-hour expiry)
- CloudFront CDN support (configured via `AWS_CLOUDFRONT_URL`)

## Caching and Rate Limiting

- Redis caching for search results (5-minute TTL)
- Rate limiting via Upstash Redis:
  - Search: 60 requests per minute
  - Downloads: 10 requests per minute (anonymous), unlimited (authenticated)
  - Uploads: 5 requests per hour
  - Auth: 5 requests per 15 minutes

## Security Features

- Input validation with Zod schemas
- SQL injection protection via Prisma
- Rate limiting to prevent abuse
- Secure file uploads with validation
- CSRF protection (Next.js built-in)
- Secure password hashing (bcrypt)

## Deployment

See `DOCS/DEPLOYMENT.md` for deployment instructions.
