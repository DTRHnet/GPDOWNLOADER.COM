'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { trpc } from '@/app/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [tabsPage, setTabsPage] = useState(1);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [uploadsPage, setUploadsPage] = useState(1);

  const { data: userTabs, isLoading: tabsLoading } = trpc.tabs.getUserTabs.useQuery({
    page: tabsPage,
    limit: 20,
  });

  const { data: favorites, isLoading: favoritesLoading } = trpc.favorites.list.useQuery({
    page: favoritesPage,
    limit: 20,
  });

  const { data: uploads, isLoading: uploadsLoading } = trpc.uploads.list.useQuery({
    page: uploadsPage,
    limit: 20,
  });

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4">Please sign in to view your profile.</p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Name:</span>
              <p className="font-medium">{session.user?.name || 'Not set'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Email:</span>
              <p className="font-medium">{session.user?.email}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Role:</span>
              <p className="font-medium">{session.user?.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tabs" className="w-full">
        <TabsList>
          <TabsTrigger value="tabs">My Tabs</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
        </TabsList>

        <TabsContent value="tabs">
          <Card>
            <CardHeader>
              <CardTitle>My Uploaded Tabs</CardTitle>
            </CardHeader>
            <CardContent>
              {tabsLoading ? (
                <div>Loading...</div>
              ) : userTabs && userTabs.tabs.length > 0 ? (
                <div className="space-y-4">
                  {userTabs.tabs.map((tab) => (
                    <div key={tab.id} className="border-b pb-4 last:border-0">
                      <Link href={`/tabs/${tab.id}`} className="hover:underline">
                        <h3 className="font-medium">{tab.title}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {tab.artist.name} • {tab.downloadCount} downloads
                      </p>
                    </div>
                  ))}
                  {userTabs.pagination.totalPages > 1 && (
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setTabsPage((p) => Math.max(1, p - 1))}
                        disabled={tabsPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-4">
                        Page {tabsPage} of {userTabs.pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setTabsPage((p) => Math.min(userTabs.pagination.totalPages, p + 1))
                        }
                        disabled={tabsPage === userTabs.pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tabs uploaded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Tabs</CardTitle>
            </CardHeader>
            <CardContent>
              {favoritesLoading ? (
                <div>Loading...</div>
              ) : favorites && favorites.favorites.length > 0 ? (
                <div className="space-y-4">
                  {favorites.favorites.map((tab) => (
                    <div key={tab.id} className="border-b pb-4 last:border-0">
                      <Link href={`/tabs/${tab.id}`} className="hover:underline">
                        <h3 className="font-medium">{tab.title}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {tab.artist.name} • {tab.downloadCount} downloads
                      </p>
                    </div>
                  ))}
                  {favorites.pagination.totalPages > 1 && (
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setFavoritesPage((p) => Math.max(1, p - 1))}
                        disabled={favoritesPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-4">
                        Page {favoritesPage} of {favorites.pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setFavoritesPage((p) => Math.min(favorites.pagination.totalPages, p + 1))
                        }
                        disabled={favoritesPage === favorites.pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No favorites yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uploads">
          <Card>
            <CardHeader>
              <CardTitle>My Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              {uploadsLoading ? (
                <div>Loading...</div>
              ) : uploads && uploads.uploads.length > 0 ? (
                <div className="space-y-4">
                  {uploads.uploads.map((upload) => (
                    <div key={upload.id} className="border-b pb-4 last:border-0">
                      <h3 className="font-medium">{upload.title || upload.filename}</h3>
                      <p className="text-sm text-muted-foreground">
                        Status: {upload.status} •{' '}
                        {new Date(upload.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {uploads.pagination.totalPages > 1 && (
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setUploadsPage((p) => Math.max(1, p - 1))}
                        disabled={uploadsPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-4">
                        Page {uploadsPage} of {uploads.pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setUploadsPage((p) => Math.min(uploads.pagination.totalPages, p + 1))
                        }
                        disabled={uploadsPage === uploads.pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No uploads yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
