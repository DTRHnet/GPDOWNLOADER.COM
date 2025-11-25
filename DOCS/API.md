# GPDownloader API Reference

## Overview

GPDownloader uses tRPC for type-safe API communication. All API endpoints are defined in `server/routers/` and automatically generate TypeScript types for the frontend.

## Base URL

- Development: `http://localhost:3000/api/trpc`
- Production: `https://yourdomain.com/api/trpc`

## Authentication

Most endpoints require authentication. Use NextAuth.js session cookies for authentication. Protected endpoints will return `UNAUTHORIZED` if the user is not authenticated.

## Rate Limiting

- Search: 60 requests/minute
- Downloads: 10 requests/minute (anonymous), unlimited (authenticated)
- Uploads: 5 requests/hour
- Auth: 5 requests/15 minutes

## Routers

### Search Router (`search`)

#### `search.search`
Search for tabs with filters.

**Input:**
```typescript
{
  q?: string;                    // Search query
  artist?: string;                // Filter by artist
  genre?: string;                 // Filter by genre
  instrument?: string;            // Filter by instrument
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  page?: number;                  // Page number (default: 1)
  limit?: number;                 // Items per page (default: 20, max: 100)
  groupBy?: 'title' | 'artist';   // Group results
}
```

**Output:**
```typescript
{
  tabs: Tab[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Tabs Router (`tabs`)

#### `tabs.getById`
Get a tab by ID.

**Input:**
```typescript
{ id: string; }
```

#### `tabs.getDownloadUrl`
Get a presigned download URL for a tab.

**Input:**
```typescript
{ id: string; }
```

**Output:**
```typescript
{ url: string; }  // Presigned S3 URL (10-minute expiry)
```

#### `tabs.getVersions`
Get all versions of a tab by title.

**Input:**
```typescript
{
  title: string;
  artist?: string;
}
```

#### `tabs.getUserTabs` (Protected)
Get tabs uploaded by the current user.

**Input:**
```typescript
{
  page?: number;
  limit?: number;
}
```

### Favorites Router (`favorites`)

#### `favorites.list` (Protected)
Get user's favorite tabs.

**Input:**
```typescript
{
  page?: number;
  limit?: number;
}
```

#### `favorites.add` (Protected)
Add a tab to favorites.

**Input:**
```typescript
{ id: string; }
```

#### `favorites.remove` (Protected)
Remove a tab from favorites.

**Input:**
```typescript
{ id: string; }
```

#### `favorites.check` (Protected)
Check if a tab is favorited.

**Input:**
```typescript
{ id: string; }
```

### Ratings Router (`ratings`)

#### `ratings.submit` (Protected)
Submit or update a rating for a tab.

**Input:**
```typescript
{
  tabId: string;
  value: number;  // 1-5
}
```

**Output:**
```typescript
{
  rating: {
    value: number;
    averageRating: number;
  };
}
```

#### `ratings.get` (Protected)
Get user's rating for a tab.

**Input:**
```typescript
{ tabId: string; }
```

### Comments Router (`comments`)

#### `comments.list`
Get comments for a tab.

**Input:**
```typescript
{
  tabId: string;
  page?: number;
  limit?: number;
}
```

#### `comments.create` (Protected)
Create a comment on a tab.

**Input:**
```typescript
{
  tabId: string;
  content: string;  // 1-1000 characters
}
```

### Uploads Router (`uploads`)

#### `uploads.initiate` (Protected)
Initiate a file upload and get presigned URL.

**Input:**
```typescript
{
  filename: string;
  contentType?: string;  // Default: 'application/x-guitar-pro'
  sizeBytes: number;     // Max: 50MB
  title?: string;
  artistName?: string;
  instrument?: string;
  genre?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}
```

**Output:**
```typescript
{
  uploadId: string;
  key: string;
  url: string;  // Presigned S3 URL (1-hour expiry)
}
```

#### `uploads.list` (Protected)
Get user's uploads.

**Input:**
```typescript
{
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}
```

### Admin Router (`admin`)

All admin endpoints require ADMIN or MODERATOR role.

#### `admin.analytics`
Get analytics data.

**Input:**
```typescript
{
  days?: number;  // Default: 30, max: 365
}
```

#### `admin.listTabs`
List all tabs (admin view).

**Input:**
```typescript
{
  page?: number;
  limit?: number;
}
```

#### `admin.deleteTab`
Delete a tab.

**Input:**
```typescript
{ id: string; }
```

#### `admin.listUploads`
List all uploads.

**Input:**
```typescript
{
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}
```

#### `admin.updateUploadStatus`
Approve or reject an upload. If approved, creates a tab from the upload.

**Input:**
```typescript
{
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
```

### Ads Router (`ads`)

#### `ads.getByPosition`
Get active ads for a position.

**Input:**
```typescript
{ position: string; }
```

#### `ads.trackImpression`
Track an ad impression.

**Input:**
```typescript
{ id: string; }
```

#### `ads.trackClick`
Track an ad click.

**Input:**
```typescript
{ id: string; }
```

#### `ads.list` (Admin)
List all ads.

**Input:**
```typescript
{
  page?: number;
  limit?: number;
}
```

#### `ads.create` (Admin)
Create an ad.

**Input:**
```typescript
{
  type: 'ADSENSE' | 'CUSTOM' | 'FACEBOOK' | 'AMAZON';
  position: string;
  title?: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  script?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}
```

#### `ads.update` (Admin)
Update an ad.

**Input:**
```typescript
{
  id: string;
  // ... same fields as create
}
```

#### `ads.delete` (Admin)
Delete an ad.

**Input:**
```typescript
{ id: string; }
```

## Error Handling

All endpoints return standard tRPC errors:
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `TOO_MANY_REQUESTS` - Rate limit exceeded
- `BAD_REQUEST` - Invalid input
- `INTERNAL_SERVER_ERROR` - Server error

## Type Safety

All API types are automatically generated from the tRPC routers. Import types in your frontend:

```typescript
import type { AppRouter } from '@/server/routers/_app';
import { trpc } from '@/app/providers';

// Use in components
const { data } = trpc.search.search.useQuery({ q: 'metallica' });
```
