# GPDownloader

A modern web platform for downloading and sharing Guitar Pro tab files. Built with Next.js 15, tRPC, Prisma, PostgreSQL, Redis, and AWS S3.

## Features

- 🔍 **Advanced Search** - Search tabs by title, artist, genre, instrument, and difficulty
- 📥 **Secure Downloads** - Presigned S3 URLs with rate limiting
- ⬆️ **File Uploads** - Direct S3 uploads with admin approval workflow
- ⭐ **Favorites & Ratings** - Save favorites and rate tabs
- 💬 **Comments** - Discuss tabs with other users
- 👤 **User Profiles** - Manage your uploads and favorites
- 🔐 **Authentication** - Google OAuth and email/password login
- 🛡️ **Admin Panel** - Content management and analytics
- 📊 **Analytics** - Track downloads, views, and user engagement
- 🎯 **Rate Limiting** - Prevent abuse with Redis-based rate limiting
- ⚡ **Performance** - Redis caching and optimized database queries

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, tRPC, Prisma
- **Database**: PostgreSQL
- **Cache**: Redis (Upstash)
- **Storage**: AWS S3 + CloudFront
- **Auth**: NextAuth.js
- **Testing**: Jest, Cypress

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up the database:**
```bash
npm run db:generate
npm run db:migrate
npm run db:seed  # Optional
```

4. **Start development server:**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Documentation

- [Setup Guide](DOCS/SETUP.md) - Detailed installation and configuration
- [API Reference](DOCS/API.md) - Complete tRPC API documentation
- [Architecture](DOCS/ARCHITECTURE.md) - System architecture and design patterns
- [Security](DOCS/SECURITY.md) - Security model and best practices
- [Changelog](DOCS/CHANGELOG.md) - Version history

## Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
│   ├── db.ts            # Prisma client
│   ├── redis.ts         # Redis client
│   └── s3.ts            # S3 utilities
├── server/              # tRPC routers and utilities
│   ├── routers/        # API routers
│   └── trpc.ts         # tRPC configuration
├── prisma/              # Database schema
│   └── schema.prisma   # Prisma schema
└── DOCS/               # Documentation
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run test` - Run Jest tests
- `npm run test:e2e` - Run Cypress E2E tests
- `npm run db:studio` - Open Prisma Studio

### Code Quality

- ESLint for linting
- Prettier for formatting
- Husky for git hooks
- TypeScript for type safety

## Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - NextAuth secret
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- AWS credentials and S3 bucket
- Upstash Redis URL and token

## Database Schema

Key models:
- **User** - User accounts with roles
- **Artist** - Music artists
- **Tab** - Guitar Pro tab files
- **Upload** - Pending uploads
- **Favorite** - User favorites
- **Rating** - Tab ratings
- **Comment** - Tab comments
- **Ad** - Advertisement configurations

See `prisma/schema.prisma` for complete schema.

## API

The API is built with tRPC for end-to-end type safety. All endpoints are defined in `server/routers/`:

- `search` - Search functionality
- `tabs` - Tab management
- `favorites` - User favorites
- `ratings` - Tab ratings
- `comments` - Comments system
- `uploads` - File uploads
- `admin` - Admin panel
- `ads` - Advertisement management

See [API Reference](DOCS/API.md) for detailed documentation.

## Security

- Password hashing with bcrypt
- Input validation with Zod
- SQL injection prevention via Prisma
- Rate limiting to prevent abuse
- Presigned URLs with expiration
- File upload validation
- Role-based access control

See [Security Documentation](DOCS/SECURITY.md) for details.

## License

[Add your license here]

## Contributing

[Add contributing guidelines here]

## Support

[Add support information here]
