# Changelog

All notable changes to GPDownloader will be documented in this file.

## [Unreleased]

### Added
- Initial project setup with Next.js 15, TypeScript, and Tailwind CSS
- tRPC API layer with end-to-end type safety
- Prisma database schema with all models
- NextAuth.js authentication with Google OAuth and email/password
- Redis caching and rate limiting via Upstash
- AWS S3 integration for file storage
- Search functionality with filters and pagination
- Tab management (CRUD operations)
- User favorites system
- Tab ratings system
- Comments system
- File upload system with presigned URLs
- Admin panel with analytics
- Advertisement management system
- Rate limiting for search, downloads, uploads, and auth
- Redis caching for search results (5-minute TTL)
- Login and registration pages
- Home page with search interface
- Basic UI components (Button, Input, Card)
- Development tools (ESLint, Prettier, Husky, Jest, Cypress)
- Database seed script
- Comprehensive documentation (Setup, API, Architecture, Security)

### Security
- Password hashing with bcrypt
- Input validation with Zod schemas
- SQL injection prevention via Prisma
- Rate limiting to prevent abuse
- Presigned URLs with expiration
- File upload validation

### Infrastructure
- TypeScript configuration
- ESLint and Prettier setup
- Git hooks with Husky
- Jest and Cypress test configuration
- Prisma schema with indexes
- Environment variable template

## [0.1.0] - 2024-01-XX

### Initial Release
- Core functionality implemented
- Basic frontend pages
- API endpoints via tRPC
- Database schema
- Authentication system
- File upload/download
- Search and filtering
- User interactions (favorites, ratings, comments)
- Admin panel
- Documentation
