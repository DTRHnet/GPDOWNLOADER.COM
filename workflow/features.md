Complete Website Feature List with API Endpoints

Core Features

1. Tab Search & Discovery

How it works:

Users can search tabs by title, artist, genre, instrument, and difficulty
Results are grouped by title (showing all versions)
Supports pagination and sorting
Results are cached for 5 minutes
Uses database indexes for fast queries
API Endpoints:

GET /api/search - Search tabs with filters
Query params: q, artist, genre, instrument, difficulty, page, limit, groupBy
Returns: Paginated list of tabs with metadata
Frontend Pages:

/ - Home page with search and featured tabs
2. Tab Download

How it works:

Users click download button
System generates presigned S3 URL (10-minute expiry)
Download count is incremented
Anonymous users limited to 3 downloads before redirect to ads page
Downloads tracked via cookie
API Endpoints:

GET /api/download?id={tabId} - Get download URL

Returns: Redirects to presigned S3 URL
Throttles anonymous users (3 downloads max)
GET /api/download/s3 - Direct S3 download (if needed)

Frontend Pages:

/tabs/[id] - Tab detail page with download button
/ads - Ad page shown to anonymous users after download limit
3. User Authentication

How it works:

NextAuth.js handles authentication
Supports Google OAuth and email/password
JWT-based sessions
Role-based access control (USER, ADMIN, MODERATOR)
API Endpoints:

POST /api/auth/[...nextauth] - NextAuth handler
Handles: signin, signout, callback, session
POST /api/register - User registration
Body: { email, name?, password }
Returns: { ok: true }
Frontend Pages:

/login - Login page
/register - Registration page
/profile - User profile page
4. Tab Upload

How it works:

Authenticated users can upload Guitar Pro files
Upload creates presigned S3 URL
File metadata is stored in database
Uploads start as PENDING status
Admins can approve/reject uploads
API Endpoints:

POST /api/upload - Initiate upload
Body: { filename, contentType, sizeBytes, title?, artistName?, instrument?, genre? }
Returns: { uploadId, key, url } (presigned S3 URL)
Frontend Pages:

/upload - Upload form page
5. Tab Favorites

How it works:

Users can favorite/unfavorite tabs
Favorites are stored in database
Users can view their favorites list
API Endpoints:

GET /api/user/favorites - Get user's favorites

Query params: page, limit
Returns: Paginated favorites list
POST /api/tabs/[id]/favorite - Add favorite

Returns: { favorited: true }
DELETE /api/tabs/[id]/favorite - Remove favorite

Returns: { favorited: false }
Frontend Pages:

/profile - Shows favorites section
6. Tab Ratings

How it works:

Users can rate tabs (1-5 stars)
Average rating is calculated and stored
Users can update their ratings
API Endpoints:

POST /api/tabs/[id]/rating - Submit/update rating

Body: { value: number } (1-5)
Returns: { rating: { value, averageRating } }
GET /api/tabs/[id]/rating - Get user's rating for tab

Frontend Pages:

/tabs/[id] - Shows rating interface
7. Comments

How it works:

Users can comment on tabs
Comments are stored with user association
Comments can be viewed on tab detail page
API Endpoints:

GET /api/tabs/[id]/comments - Get comments for tab

Query params: page, limit
Returns: Paginated comments list
POST /api/tabs/[id]/comments - Add comment

Body: { content: string }
Returns: { comment: { id, content, createdAt, user } }
Frontend Pages:

/tabs/[id] - Shows comments section
8. Tab Versions

How it works:

Multiple versions of same song are grouped
Version number tracks different transcriptions
Users can view all versions and download specific ones
API Endpoints:

GET /api/tabs/versions - Get versions grouped by title
Query params: title, artist
Returns: Grouped versions
Frontend Pages:

/tabs/versions - Versions listing page
/tabs/[id] - Shows version selector
9. Artist Pages

How it works:

Dedicated pages for each artist
Shows all tabs by that artist
Can be accessed via search or direct URL
API Endpoints:

Uses /api/search?artist={name}
Frontend Pages:

/artist/[name] - Artist page with all their tabs
10. Admin Panel

How it works:

Admins can manage tabs, users, uploads, and ads
Analytics dashboard shows site statistics
Can approve/reject uploads
Can delete tabs and manage users
API Endpoints:

GET /api/admin/analytics - Get analytics data

Query params: days (default: 30)
Returns: Overview stats, recent tabs, popular tabs, ad stats, daily stats
GET /api/admin/tabs - List all tabs (admin)

DELETE /api/admin/tabs/[id] - Delete tab

GET /api/admin/ads - List all ads

POST /api/admin/ads - Create ad

PUT /api/admin/ads/[id] - Update ad

DELETE /api/admin/ads/[id] - Delete ad

GET /api/admin/uploads - List uploads

PUT /api/admin/uploads/[id] - Update upload status

Frontend Pages:

/admin - Admin dashboard with tabs for analytics, tabs, ads, uploads
11. Ad Management

How it works:

Supports multiple ad types (AdSense, Custom, Facebook, Amazon)
Ads are displayed in specific positions
Impressions and clicks are tracked
CTR and revenue are calculated automatically
API Endpoints:

GET /api/ads - Get active ads for position

Query params: position
Returns: List of active ads
POST /api/ads/[id]/impression - Track impression

POST /api/ads/[id]/click - Track click

Frontend Components:

<AdDisplay position="..." /> - Displays ads and tracks metrics
12. User Profile

How it works:

Users can view their profile
Shows uploaded tabs, favorites, and statistics
Can manage account settings
API Endpoints:

GET /api/user/tabs - Get user's uploaded tabs
Query params: page, limit
Returns: Paginated list of user's tabs
Frontend Pages:

/profile - User profile page
